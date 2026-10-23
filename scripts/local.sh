#!/usr/bin/env bash
# Single-command local stack for anyone who clones the repo:
#   Homebrew Postgres (LAN-reachable) + migrate/seed + pgweb + Nest API + student Expo
# Usage: npm start
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OS="$(uname -s)"
export HOMEBREW_NO_AUTO_UPDATE=1
export HOMEBREW_NO_ENV_HINTS=1

PG_VERSION="${VIDYA_PG_VERSION:-17}"
PG_USER="vidya"
PG_PASSWORD="vidya"
PG_DB="vidya"
PG_PORT="${VIDYA_PG_PORT:-5432}"
API_PORT="${PORT:-4000}"
PGWEB_PORT="${VIDYA_PGWEB_PORT:-8083}"
EXPO_PORT="${VIDYA_EXPO_PORT:-8081}"

PIDS=()

have() { command -v "$1" >/dev/null 2>&1; }

cleanup() {
  local pid
  for pid in "${PIDS[@]:-}"; do
    kill "${pid}" 2>/dev/null || true
  done
}
trap cleanup EXIT INT TERM

detect_lan_ip() {
  if [[ -n "${VIDYA_DEV_HOST:-}" ]]; then
    echo "${VIDYA_DEV_HOST}"
    return 0
  fi
  if [[ "${OS}" == "Darwin" ]]; then
    ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || echo "127.0.0.1"
    return 0
  fi
  hostname -I 2>/dev/null | awk '{print $1}' || echo "127.0.0.1"
}

ensure_homebrew() {
  if have brew; then
    return 0
  fi
  if [[ "${OS}" != "Darwin" ]]; then
    echo "Homebrew is required on macOS, or install PostgreSQL ${PG_VERSION} yourself." >&2
    exit 1
  fi
  echo "Homebrew not found — installing..."
  NONINTERACTIVE=1 /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
  if [[ -x /opt/homebrew/bin/brew ]]; then
    eval "$(/opt/homebrew/bin/brew shellenv)"
  elif [[ -x /usr/local/bin/brew ]]; then
    eval "$(/usr/local/bin/brew shellenv)"
  fi
  have brew
}

ensure_psql_path() {
  local prefix
  if have brew; then
    prefix="$(brew --prefix "postgresql@${PG_VERSION}" 2>/dev/null || true)"
    if [[ -n "${prefix}" && -d "${prefix}/bin" ]]; then
      export PATH="${prefix}/bin:${PATH}"
    fi
  fi
}

ensure_postgres_bin() {
  ensure_psql_path
  if have psql && have pg_isready; then
    return 0
  fi
  if [[ "${OS}" != "Darwin" ]] || ! ensure_homebrew; then
    echo "psql not found. Install PostgreSQL ${PG_VERSION}, then re-run: npm start" >&2
    exit 1
  fi
  echo "Installing postgresql@${PG_VERSION} via Homebrew..."
  brew list "postgresql@${PG_VERSION}" >/dev/null 2>&1 || brew install "postgresql@${PG_VERSION}"
  brew link "postgresql@${PG_VERSION}" --force --overwrite >/dev/null 2>&1 || true
  ensure_psql_path
  if ! have psql; then
    echo "postgresql@${PG_VERSION} installed but psql is not on PATH." >&2
    exit 1
  fi
}

start_postgres() {
  ensure_psql_path
  if pg_isready -h 127.0.0.1 -p "${PG_PORT}" >/dev/null 2>&1; then
    echo "Postgres already accepting connections on :${PG_PORT}."
    return 0
  fi
  if [[ "${OS}" == "Darwin" ]] && have brew; then
    echo "Starting postgresql@${PG_VERSION}..."
    brew services start "postgresql@${PG_VERSION}" >/dev/null
  else
    echo "Postgres is installed but not running. Start it, then re-run." >&2
    exit 1
  fi
  local i
  for i in $(seq 1 45); do
    if pg_isready -h 127.0.0.1 -p "${PG_PORT}" >/dev/null 2>&1; then
      echo "Postgres is ready."
      return 0
    fi
    sleep 1
  done
  echo "Timed out waiting for Postgres on :${PG_PORT}." >&2
  exit 1
}

psql_super() {
  local db="$1"
  shift
  local me
  me="$(whoami)"
  psql -h 127.0.0.1 -p "${PG_PORT}" -U "${me}" -d "${db}" -v ON_ERROR_STOP=1 "$@"
}

ensure_role_and_db() {
  echo "Ensuring role '${PG_USER}' and database '${PG_DB}'..."
  local exists
  exists="$(psql_super postgres -Atc "SELECT 1 FROM pg_roles WHERE rolname='${PG_USER}'" | tr -d '[:space:]')"
  if [[ "${exists}" != "1" ]]; then
    psql_super postgres -c "CREATE USER ${PG_USER} WITH PASSWORD '${PG_PASSWORD}' CREATEDB;"
  else
    psql_super postgres -c "ALTER USER ${PG_USER} WITH PASSWORD '${PG_PASSWORD}';"
  fi

  exists="$(psql_super postgres -Atc "SELECT 1 FROM pg_database WHERE datname='${PG_DB}'" | tr -d '[:space:]')"
  if [[ "${exists}" != "1" ]]; then
    psql_super postgres -c "CREATE DATABASE ${PG_DB} OWNER ${PG_USER};"
  else
    psql_super postgres -c "ALTER DATABASE ${PG_DB} OWNER TO ${PG_USER};"
  fi

  PGPASSWORD="${PG_PASSWORD}" psql -h 127.0.0.1 -p "${PG_PORT}" -U "${PG_USER}" -d "${PG_DB}" -c "SELECT 1 AS ok;" >/dev/null
  echo "Database ${PG_DB} is reachable as ${PG_USER}."
}

# Listen on all interfaces so phones / teammates on the same Wi‑Fi can connect.
configure_postgres_lan() {
  local conf hba
  conf="$(psql_super postgres -Atc "SHOW config_file;" | tr -d '[:space:]')"
  hba="$(psql_super postgres -Atc "SHOW hba_file;" | tr -d '[:space:]')"
  if [[ -z "${conf}" || ! -f "${conf}" ]]; then
    echo "Warning: could not locate postgresql.conf — skipping LAN bind." >&2
    return 0
  fi

  if grep -qE "^[[:space:]]*listen_addresses[[:space:]]*=" "${conf}"; then
    sed -i.bak 's/^[[:space:]]*listen_addresses[[:space:]]*=.*/listen_addresses = '\''*'\''/' "${conf}"
  else
    echo "listen_addresses = '*'" >>"${conf}"
  fi

  if [[ -n "${hba}" && -f "${hba}" ]]; then
    if ! grep -qE "host[[:space:]]+${PG_DB}[[:space:]]+${PG_USER}[[:space:]]+0\\.0\\.0\\.0/0" "${hba}"; then
      cat >>"${hba}" <<EOF

# Vidya LAN access (npm start) — same Wi‑Fi teammates / phones
host    ${PG_DB}    ${PG_USER}    0.0.0.0/0    scram-sha-256
host    ${PG_DB}    ${PG_USER}    ::/0         scram-sha-256
EOF
    fi
  fi

  if [[ "${OS}" == "Darwin" ]] && have brew; then
    brew services restart "postgresql@${PG_VERSION}" >/dev/null 2>&1 || true
  else
    psql_super postgres -c "SELECT pg_reload_conf();" >/dev/null || true
  fi

  local i
  for i in $(seq 1 30); do
    if pg_isready -h 127.0.0.1 -p "${PG_PORT}" >/dev/null 2>&1; then
      echo "Postgres listening on 0.0.0.0:${PG_PORT} (LAN-ready)."
      return 0
    fi
    sleep 1
  done
  echo "Warning: Postgres reload slow; continuing with local socket." >&2
}

ensure_pgweb() {
  if have pgweb; then
    return 0
  fi
  if [[ "${OS}" == "Darwin" ]] && ensure_homebrew; then
    echo "Installing pgweb (web DB browser — Prisma Studio alternative)..."
    brew install pgweb
  fi
  if ! have pgweb; then
    echo "pgweb not found — DB UI skipped. Install: brew install pgweb" >&2
    return 1
  fi
}

ensure_node() {
  if ! have node || ! have pnpm; then
    if [[ "${OS}" == "Darwin" ]] && ensure_homebrew; then
      have node || brew install node@22
      have pnpm || npm install -g pnpm@8.15.8
    fi
  fi
  if ! have pnpm; then
    echo "pnpm is required. Install pnpm 8 and re-run." >&2
    exit 1
  fi
}

write_env() {
  local lan_ip="$1"
  local local_db="postgresql://${PG_USER}:${PG_PASSWORD}@127.0.0.1:${PG_PORT}/${PG_DB}"
  local api_url="http://${lan_ip}:${API_PORT}"

  cat >"${ROOT}/.env" <<EOF
# Generated by npm start — gitignored. Re-run npm start to refresh LAN IP.
DATABASE_URL="${local_db}"
PORT=${API_PORT}
JWT_SECRET="${JWT_SECRET:-dev-only-jwt-secret-change-me}"
VIDYA_DEV_HOST="${lan_ip}"
EXPO_PUBLIC_API_URL="${api_url}"
NEXT_PUBLIC_API_URL="${api_url}"
REACT_NATIVE_PACKAGER_HOSTNAME="${lan_ip}"
EOF

  export DATABASE_URL="${local_db}"
  export JWT_SECRET="${JWT_SECRET:-dev-only-jwt-secret-change-me}"
  export VIDYA_DEV_HOST="${lan_ip}"
  export EXPO_PUBLIC_API_URL="${api_url}"
  export REACT_NATIVE_PACKAGER_HOSTNAME="${lan_ip}"
  unset SMTP_HOST || true
}

migrate_and_seed() {
  cd "${ROOT}"
  if [[ ! -d "${ROOT}/node_modules" ]]; then
    echo "Installing dependencies..."
    pnpm install
  fi
  echo "Running SQL migrations..."
  pnpm --dir packages/db migrate
  echo "Seeding demo data..."
  pnpm --dir packages/db seed
}

start_services() {
  local lan_ip="$1"
  local local_db="postgresql://${PG_USER}:${PG_PASSWORD}@127.0.0.1:${PG_PORT}/${PG_DB}"
  local lan_db="postgresql://${PG_USER}:${PG_PASSWORD}@${lan_ip}:${PG_PORT}/${PG_DB}"
  local api_url="http://${lan_ip}:${API_PORT}"
  local pgweb_url="http://${lan_ip}:${PGWEB_PORT}"
  local expo_url="http://${lan_ip}:${EXPO_PORT}"

  cd "${ROOT}"
  export DATABASE_URL="${local_db}"
  export JWT_SECRET="${JWT_SECRET:-dev-only-jwt-secret-change-me}"
  export EXPO_PUBLIC_API_URL="${api_url}"
  export REACT_NATIVE_PACKAGER_HOSTNAME="${lan_ip}"
  export EXPO_NO_TELEMETRY=1
  unset SMTP_HOST || true

  echo "Starting API on 0.0.0.0:${API_PORT}..."
  pnpm --dir apps/api dev &
  PIDS+=($!)

  if ensure_pgweb; then
    echo "Starting pgweb on 0.0.0.0:${PGWEB_PORT}..."
    pgweb --bind=0.0.0.0 --listen="${PGWEB_PORT}" --url "${local_db}" --sessions=false &
    PIDS+=($!)
  fi

  echo "Starting student Expo (LAN) on :${EXPO_PORT}..."
  pnpm --dir apps/student-mobile exec expo start --lan --port "${EXPO_PORT}" &
  PIDS+=($!)

  cat <<EOF

==> Vidya local stack (same Wi‑Fi)
  LAN IP:     ${lan_ip}

  API:        ${api_url}          (docs: ${api_url}/docs)
  Postgres:   ${lan_db}
  psql:       npm run db:psql
  DB UI:      ${pgweb_url}        (pgweb — not Prisma Studio)
  Student:    ${expo_url}         (Expo Go: scan QR / open LAN URL)

  Tabs:       Home · Learn · Profile · Notifications
  Login:      student@vidya.test / StudentDemo1!

  Teammates on this Wi‑Fi can use the API + DB + pgweb URLs above.
  Ctrl+C stops API, pgweb, and Expo.

EOF

  wait
}

main() {
  local lan_ip
  echo "==> Vidya: Postgres + API + student app + pgweb (LAN)"
  lan_ip="$(detect_lan_ip)"
  echo "Detected LAN host: ${lan_ip}"

  ensure_postgres_bin
  start_postgres
  ensure_role_and_db
  configure_postgres_lan
  ensure_node
  write_env "${lan_ip}"
  migrate_and_seed
  start_services "${lan_ip}"
}

main "$@"
