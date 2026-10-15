#!/usr/bin/env bash
# Single entrypoint: start Colima/Docker if needed, then the full local stack.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
# shellcheck disable=SC1091
source "${ROOT}/scripts/ensure-docker.sh"
ensure_docker
ensure_dev_host

cd "${ROOT}"
echo "Starting Vidya stack (postgres, mailhog, api, student, admin)..."
echo "  API:     http://localhost:4000  (phone: http://${VIDYA_DEV_HOST}:4000)"
echo "  Student: http://localhost:8081  — scan Expo Go QR from this service's logs"
echo "  Admin:   http://localhost:8082"
echo "  Mailhog: http://localhost:8025"
echo "  Tip: phone and Mac must be on the same Wi‑Fi."
exec docker compose up --build "$@"
