#!/usr/bin/env bash
# Local stack: Homebrew Postgres + SQL migrate/seed + Nest API (psql CLI only).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OS="$(uname -s)"
export HOMEBREW_NO_AUTO_UPDATE=1
export HOMEBREW_NO_ENV_HINTS=1
PG_VERSION="${VIDYA_PG_VERSION:-17}"
PG_USER="vidya"
PG_PASSWORD="vidya"
PG_DB="vidya"
PG_HOST="localhost"
PG_PORT="5432"
DB_URL="postgresql://${PG_USER}:${PG_PASSWORD}@${PG_HOST}:${PG_PORT}/${PG_DB}"

have() { command -v "$1" >/dev/null 2>&1; }

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

ensure_postgres() {
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
  if pg_isready -h "${PG_HOST}" -p "${PG_PORT}" >/dev/null 2>&1; then
    echo "Postgres already accepting connections on ${PG_HOST}:${PG_PORT}."
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
    if pg_isready -h "${PG_HOST}" -p "${PG_PORT}" >/dev/null 2>&1; then
      echo "Postgres is ready."
      return 0
    fi
    sleep 1
  done
  echo "Timed out waiting for Postgres on ${PG_HOST}:${PG_PORT}." >&2
  exit 1
}

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
    if [[ -f "${ROOT}/.env.example" ]]; then
      echo "Creating .env from .env.example..."
      cp "${ROOT}/.env.example" "${ROOT}/.env"
    else
      cat > "${ROOT}/.env" <<EOF
DATABASE_URL="${DB_URL}"
PORT=4000
JWT_SECRET="dev-only-jwt-secret-change-me"
NEXT_PUBLIC_API_URL="http://localhost:4000"
EXPO_PUBLIC_API_URL="http://localhost:4000"
EOF
    fi
  fi
  # Force local DB URL for this script's lifecycle (does not rewrite .env).
  export DATABASE_URL="${DB_URL}"
  export JWT_SECRET="${JWT_SECRET:-dev-only-jwt-secret-change-me}"
  # No SMTP → API logs mail to console.
  unset SMTP_HOST || true
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

migrate_and_seed() {
  cd "${ROOT}"
  if [[ ! -d "${ROOT}/node_modules" ]]; then
    echo "Installing dependencies..."
    pnpm install
  fi
  export DATABASE_URL="${DB_URL}"
  echo "Running SQL migrations..."
  pnpm --dir packages/db migrate
  echo "Seeding demo data..."
  pnpm --dir packages/db seed
}

start_api() {
  cd "${ROOT}"
  export DATABASE_URL="${DB_URL}"
  export JWT_SECRET="${JWT_SECRET:-dev-only-jwt-secret-change-me}"
  unset SMTP_HOST || true
  cat <<EOF

==> Vidya local API
  Postgres:  ${DB_URL}
  psql:      npm run db:psql
  Docs:      http://localhost:4000/docs
  Health:    http://localhost:4000/health

  Student:   student@vidya.test / StudentDemo1!
  Admin:     admin@vidya.edu.in / AdminDemo1!  (static GETs)

EOF
  exec pnpm --dir apps/api dev
}

main() {
  echo "==> Vidya local (Homebrew Postgres + API, no Docker / no pgAdmin GUI)"
  ensure_postgres
  start_postgres
  ensure_role_and_db
  ensure_env_file
  ensure_node
  migrate_and_seed
  start_api
}

main "$@"
