#!/usr/bin/env bash
# Creates the local vidya_contact role + database and applies db/schema.sql.
# Requires a PostgreSQL superuser (default: postgres) on localhost:5432.
# Usage: ./scripts/setup-db.sh
set -euo pipefail

DB_NAME="${DB_NAME:-vidya_contact}"
DB_USER="${DB_USER:-vidya_contact}"
DB_PASSWORD="${DB_PASSWORD:-}"
SUPER_USER="${SUPER_USER:-postgres}"
HOST="${HOST:-localhost}"
PORT="${PORT:-5432}"

if [ -z "$DB_PASSWORD" ]; then
  echo "Set DB_PASSWORD before running this script. Do not commit it." >&2
  exit 1
fi

if ! command -v psql >/dev/null 2>&1; then
  echo "psql not found. Add PostgreSQL bin to PATH." >&2
  exit 1
fi

echo "Creating role $DB_USER (if missing)..."
psql -h "$HOST" -p "$PORT" -U "$SUPER_USER" -d postgres -v ON_ERROR_STOP=1 <<SQL
DO \$\$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = '$DB_USER') THEN
    CREATE ROLE $DB_USER LOGIN PASSWORD '$DB_PASSWORD';
  ELSE
    ALTER ROLE $DB_USER WITH LOGIN PASSWORD '$DB_PASSWORD';
  END IF;
END
\$\$;
SQL

if ! psql -h "$HOST" -p "$PORT" -U "$SUPER_USER" -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME';" | grep -q 1; then
  echo "Creating database $DB_NAME..."
  psql -h "$HOST" -p "$PORT" -U "$SUPER_USER" -d postgres -v ON_ERROR_STOP=1 -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;"
else
  echo "Database $DB_NAME already exists."
fi

echo "Applying schema..."
psql -h "$HOST" -p "$PORT" -U "$SUPER_USER" -d "$DB_NAME" -v ON_ERROR_STOP=1 -f "$(dirname "$0")/../db/schema.sql"
echo "Done. Database: $DB_NAME, role: $DB_USER"
