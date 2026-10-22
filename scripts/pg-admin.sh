#!/usr/bin/env bash
# Local Postgres (Homebrew, no Docker) + open pgAdmin 4 with Vidya credentials.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OS="$(uname -s)"
# Keep installs predictable / fast (no brew self-update mid-script).
export HOMEBREW_NO_AUTO_UPDATE=1
export HOMEBREW_NO_ENV_HINTS=1
PG_VERSION="${VIDYA_PG_VERSION:-17}"
PG_USER="vidya"
PG_PASSWORD="vidya"
PG_DB="vidya"
PG_HOST="localhost"
PG_PORT="5432"
SERVERS_JSON="${ROOT}/scripts/pgadmin-vidya-local.json"

have() { command -v "$1" >/dev/null 2>&1; }

ensure_homebrew() {
  if have brew; then
    return 0
  fi
  if [[ "${OS}" != "Darwin" ]]; then
    echo "Homebrew is required on this OS path, or install PostgreSQL ${PG_VERSION} yourself." >&2
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

ensure_postgres() {
  ensure_psql_path
  if have psql && have pg_isready; then
    return 0
  fi
  if [[ "${OS}" != "Darwin" ]] || ! ensure_homebrew; then
    echo "psql not found. Install PostgreSQL ${PG_VERSION}, then re-run: npm run pg-admin" >&2
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
  if pg_isready -h "${PG_HOST}" -p "${PG_PORT}" >/dev/null 2>&1; then
    echo "Postgres already accepting connections on ${PG_HOST}:${PG_PORT}."
    return 0
  fi
  if [[ "${OS}" == "Darwin" ]] && have brew; then
    echo "Starting postgresql@${PG_VERSION}..."
    brew services start "postgresql@${PG_VERSION}" >/dev/null
  elif have pg_ctl; then
    echo "Postgres is installed but not running. Start it, then re-run." >&2
    exit 1
  fi
  local i
  for i in $(seq 1 45); do
    if pg_isready -h "${PG_HOST}" -p "${PG_PORT}" >/dev/null 2>&1; then
      echo "Postgres is ready."
      return 0
    fi
    sleep 1
  done
  echo "Timed out waiting for Postgres on ${PG_HOST}:${PG_PORT}." >&2
  exit 1
}

# brew Postgres trusts the macOS login user as a local superuser.
psql_super() {
  local db="$1"
  shift
  local me
  me="$(whoami)"
  psql -h "${PG_HOST}" -p "${PG_PORT}" -U "${me}" -d "${db}" -v ON_ERROR_STOP=1 "$@"
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

  PGPASSWORD="${PG_PASSWORD}" psql -h "${PG_HOST}" -p "${PG_PORT}" -U "${PG_USER}" -d "${PG_DB}" -c "SELECT 1 AS ok;" >/dev/null
  echo "Database ${PG_DB} is reachable as ${PG_USER}."
}

ensure_env_file() {
  if [[ ! -f "${ROOT}/.env" ]]; then
    echo "Creating .env from .env.example..."
    cp "${ROOT}/.env.example" "${ROOT}/.env"
  fi
  # Keep local URLs pointed at Homebrew Postgres (same creds as Docker).
  if ! grep -q "postgresql://${PG_USER}:${PG_PASSWORD}@${PG_HOST}:${PG_PORT}/${PG_DB}" "${ROOT}/.env"; then
    echo "Note: .env DATABASE_URL may not match local Homebrew Postgres (${PG_USER}@${PG_HOST}/${PG_DB})." >&2
  fi
}

write_servers_json() {
  cat > "${SERVERS_JSON}" <<EOF
{
  "Servers": {
    "1": {
      "Name": "Vidya local",
      "Group": "Servers",
      "Host": "${PG_HOST}",
      "Port": ${PG_PORT},
      "MaintenanceDB": "${PG_DB}",
      "Username": "${PG_USER}",
      "SSLMode": "prefer",
      "Comment": "Created by npm run pg-admin (Homebrew Postgres, no Docker)"
    }
  }
}
EOF
}

open_pgadmin() {
  if [[ "${OS}" == "Darwin" ]]; then
    if [[ -d "/Applications/pgAdmin 4.app" ]]; then
      echo "Opening pgAdmin 4..."
      open -a "pgAdmin 4"
      return 0
    fi
    if have brew; then
      echo "pgAdmin 4.app not found — installing via Homebrew cask..."
      brew install --cask pgadmin4
      open -a "pgAdmin 4"
      return 0
    fi
  fi
  echo "Install pgAdmin 4, then import: ${SERVERS_JSON}" >&2
}

maybe_migrate() {
  if [[ "${VIDYA_PG_MIGRATE:-1}" != "1" ]]; then
    return 0
  fi
  if [[ ! -d "${ROOT}/node_modules" ]]; then
    echo "Skipping migrate (run pnpm install first)."
    return 0
  fi
  if [[ ! -d "${ROOT}/packages/db" ]]; then
    return 0
  fi
  echo "Applying Prisma migrations..."
  (
    cd "${ROOT}"
    export DATABASE_URL="postgresql://${PG_USER}:${PG_PASSWORD}@${PG_HOST}:${PG_PORT}/${PG_DB}?schema=public"
    export DIRECT_URL="${DATABASE_URL}"
    pnpm --dir packages/db exec prisma generate >/dev/null
    pnpm --dir packages/db exec prisma migrate deploy
  ) || echo "Migrate skipped/failed — DB is up; run prisma migrate when ready." >&2
}

main() {
  echo "==> Vidya local Postgres + pgAdmin (no Docker)"
  ensure_postgres
  start_postgres
  ensure_role_and_db
  ensure_env_file
  write_servers_json
  maybe_migrate
  open_pgadmin

  local db_url="postgresql://${PG_USER}:${PG_PASSWORD}@${PG_HOST}:${PG_PORT}/${PG_DB}?schema=public"
  cat <<EOF

Postgres is running (Homebrew, no Docker)
  Host:     ${PG_HOST}
  Port:     ${PG_PORT}
  Database: ${PG_DB}
  Username: ${PG_USER}
  Password: ${PG_PASSWORD}

pgAdmin
  1. Object → Register → Server…  (or File → Import/Export Servers…)
  2. Import: ${SERVERS_JSON}
     — or enter the fields above manually (password: ${PG_PASSWORD})

App .env already uses the same URL as Docker local:
  ${db_url}

API only:  npm run backend   (Docker)  or  pnpm dev:api  (against this DB)
EOF
}

main "$@"
