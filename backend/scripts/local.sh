#!/usr/bin/env bash
# Back-compat wrapper — prefer: npm start  →  node scripts/start.mjs
# Cross-platform (macOS / Linux / Windows), native Postgres, no Docker.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
exec node "${ROOT}/scripts/start.mjs" "$@"
