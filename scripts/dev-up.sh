#!/usr/bin/env bash
# Optional Docker path (default local stack is `npm start` / scripts/local.sh).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
# shellcheck disable=SC1091
source "${ROOT}/scripts/ensure-docker.sh"
ensure_docker
ensure_dev_host

cd "${ROOT}"
echo "Starting Vidya Docker stack (postgres, api, student)..."
echo "  API:     http://localhost:4000  (phone: http://${VIDYA_DEV_HOST}:4000)"
echo "  Student: http://localhost:8081"
echo "  Tip: phone and Mac must be on the same Wi‑Fi."
echo "  Prefer: npm start  (Homebrew Postgres + pgweb + LAN, no Docker)"
exec docker compose up --build "$@"
