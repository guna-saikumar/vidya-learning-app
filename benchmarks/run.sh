#!/usr/bin/env bash
# Reproduce: needs Node >= 22.12, pnpm 8, Postgres at $DATABASE_URL, k6 on PATH.
set -euo pipefail
cd "$(dirname "$0")/.."
: "${DATABASE_URL:=postgresql://vidya:vidya@127.0.0.1:5432/vidya?schema=public}"
export DATABASE_URL DIRECT_URL="${DIRECT_URL:-$DATABASE_URL}" JWT_SECRET="${JWT_SECRET:-bench-only-secret}" NODE_ENV=production PORT=4100
OUT="benchmarks/results-$(date +%F)"; mkdir -p "$OUT"
{ echo "date: $(date -Is)"; echo "cpu: $(nproc) x $(grep -m1 'model name' /proc/cpuinfo | cut -d: -f2)"; free -m | sed -n 2p | awk '{print "ram_mb: "$2}'; uname -sr; echo "node $(node -v)"; k6 version; echo "api: single Node process (pnpm --dir apps/api start)"; echo "load generator: k6 on the same machine"; } > "$OUT/environment.txt"
pnpm --dir packages/db exec prisma generate > /dev/null
(pnpm --dir packages/db migrate && pnpm --dir packages/db seed) > "$OUT/seed.txt" 2>&1
(cd apps/api && pnpm build && pnpm test) > "$OUT/tests.txt" 2>&1
(cd packages/auth && pnpm test) >> "$OUT/tests.txt" 2>&1
(cd apps/student-mobile && pnpm test) >> "$OUT/tests.txt" 2>&1
(cd apps/api && pnpm start > /tmp/vidya-api.log 2>&1) &
PID=$!; trap 'pkill -P $PID 2>/dev/null; kill $PID 2>/dev/null || true' EXIT
for i in $(seq 1 100); do curl -sf http://127.0.0.1:4100/health >/dev/null && break; sleep 0.2; done
for s in health classes me; do k6 run -e SCENARIO=$s -e VUS=50 --summary-export "$OUT/k6-$s.json" benchmarks/k6-api.js > "$OUT/k6-$s.txt" 2>&1; done
k6 run -e SCENARIO=login -e VUS=20 --summary-export "$OUT/k6-login.json" benchmarks/k6-api.js > "$OUT/k6-login.txt" 2>&1
