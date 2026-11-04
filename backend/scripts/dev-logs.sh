#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
# shellcheck disable=SC1091
source "${ROOT}/scripts/ensure-docker.sh"
ensure_docker

cd "${ROOT}"
exec docker compose logs -f "$@"
