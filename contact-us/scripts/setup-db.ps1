# Creates the local vidya_contact role + database and applies db/schema.sql.
# Requires a PostgreSQL superuser (default: postgres) on localhost:5432.
# Usage: .\scripts\setup-db.ps1
param(
  [string]$DbName = "vidya_contact",
  [string]$DbUser = "vidya_contact",
  [string]$DbPassword = "",
  [string]$SuperUser = "postgres",
  [string]$SuperUserPassword = "",
  [string]$Host = "localhost",
  [int]$Port = 5432
)

if (-not $DbPassword -and $env:DB_PASSWORD) {
  $DbPassword = $env:DB_PASSWORD
}
if (-not $DbPassword) {
  throw "Set DB_PASSWORD before running this script. Do not commit it."
}

$ErrorActionPreference = 'Stop'
$psql = (Get-Command psql -ErrorAction SilentlyContinue)?.Source
if (-not $psql) {
  $psql = "C:\Program Files\PostgreSQL\18\bin\psql.exe"
}
if (-not (Test-Path $psql)) {
  throw "psql not found. Add PostgreSQL bin to PATH or edit the path in this script."
}

if ($SuperUserPassword) { $env:PGPASSWORD = $SuperUserPassword }

Write-Host "Creating role $DbUser (if missing)..."
& $psql -h $Host -p $Port -U $SuperUser -d postgres -v ON_ERROR_STOP=1 -c @"
DO \$\$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = '$DbUser') THEN
    CREATE ROLE $DbUser LOGIN PASSWORD '$DbPassword';
  ELSE
    ALTER ROLE $DbUser WITH LOGIN PASSWORD '$DbPassword';
  END IF;
END
\$\$;
"@

$dbExists = & $psql -h $Host -p $Port -U $SuperUser -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname = '$DbName';"
if ($dbExists -ne '1') {
  Write-Host "Creating database $DbName..."
  & $psql -h $Host -p $Port -U $SuperUser -d postgres -v ON_ERROR_STOP=1 -c "CREATE DATABASE $DbName OWNER $DbUser;"
} else {
  Write-Host "Database $DbName already exists."
}

Write-Host "Applying schema..."
& $psql -h $Host -p $Port -U $SuperUser -d $DbName -v ON_ERROR_STOP=1 -f "$PSScriptRoot\..\db\schema.sql"
Write-Host "Done. Database: $DbName, role: $DbUser"
