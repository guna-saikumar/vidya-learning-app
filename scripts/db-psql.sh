#!/usr/bin/env bash
# Interactive psql against local Vidya Postgres (no GUI).
set -euo pipefail

PG_VERSION="${VIDYA_PG_VERSION:-17}"
PG_USER="vidya"
PG_PASSWORD="vidya"
PG_DB="vidya"
PG_HOST="localhost"
PG_PORT="5432"

if command -v brew >/dev/null 2>&1; then
  prefix="$(brew --prefix "postgresql@${PG_VERSION}" 2>/dev/null || true)"
  if [[ -n "${prefix}" && -d "${prefix}/bin" ]]; then
    export PATH="${prefix}/bin:${PATH}"
  fi
fi

if ! command -v psql >/dev/null 2>&1; then
  echo "psql not found. Run npm start once to install/start Postgres." >&2
  exit 1
fi

exec env PGPASSWORD="${PG_PASSWORD}" psql -h "${PG_HOST}" -p "${PG_PORT}" -U "${PG_USER}" -d "${PG_DB}" "$@"
