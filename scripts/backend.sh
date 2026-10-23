#!/usr/bin/env bash
# Single command: bring up the Vidya Nest API + Postgres + Mailhog locally.
# Detects OS, starts Docker/Colima (installs via Homebrew on macOS when possible),
# ensures pnpm deps, then runs only the backend stack.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
# shellcheck disable=SC1091
source "${ROOT}/scripts/ensure-docker.sh"

OS="$(uname -s)"
echo "==> Vidya backend bootstrap (${OS})"

have() { command -v "$1" >/dev/null 2>&1; }

ensure_homebrew() {
  if have brew; then
    return 0
  fi
  if [[ "${OS}" != "Darwin" ]]; then
    return 1
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

ensure_runtime_tools() {
  if ! have node; then
    if [[ "${OS}" == "Darwin" ]] && ensure_homebrew; then
      echo "Installing Node via Homebrew..."
      brew install node
    else
      echo "Node.js is required. Install Node 22+ then re-run: npm run backend" >&2
      exit 1
    fi
  fi

  if ! have pnpm; then
    echo "Enabling pnpm via corepack..."
    if have corepack; then
      corepack enable
      corepack prepare pnpm@8.15.8 --activate
    elif [[ "${OS}" == "Darwin" ]] && ensure_homebrew; then
      brew install pnpm
    else
      npm install -g pnpm@8.15.8
    fi
  fi

  if ! have docker; then
    if [[ "${OS}" == "Darwin" ]] && ensure_homebrew; then
      echo "Installing Docker CLI + Colima via Homebrew..."
      brew install docker colima docker-compose || brew install docker colima
    else
      echo "Docker CLI not found. Install Docker Desktop or Colima, then retry." >&2
      exit 1
    fi
  fi

  if ! have colima && [[ "${OS}" == "Darwin" ]] && ensure_homebrew; then
    if [[ ! -d /Applications/Docker.app ]]; then
      echo "Installing Colima (lightweight Docker runtime)..."
      brew install colima
    fi
  fi
}

ensure_env_file() {
  if [[ ! -f "${ROOT}/.env" ]]; then
    echo "Creating .env from .env.example (local Docker Postgres)..."
    cp "${ROOT}/.env.example" "${ROOT}/.env"
  fi
}

ensure_deps() {
  cd "${ROOT}"
  if [[ ! -d node_modules ]] || [[ ! -d apps/api/node_modules && ! -e node_modules/.pnpm ]]; then
    echo "Installing workspace dependencies..."
    pnpm install
  fi
}

wait_for_url() {
  local url="$1"
  local label="$2"
  local i
  for i in $(seq 1 90); do
    if curl -sf "${url}" >/dev/null 2>&1; then
      echo "${label} is ready."
      return 0
    fi
    sleep 2
  done
  echo "Timed out waiting for ${label} at ${url}" >&2
  return 1
}

main() {
  ensure_runtime_tools
  ensure_docker
  ensure_dev_host
  ensure_env_file
  ensure_deps

  cd "${ROOT}"
  echo "Starting backend services: postgres, mailhog, api..."
  docker compose up -d --build postgres mailhog api

  echo "Waiting for API health..."
  wait_for_url "http://127.0.0.1:4000/health" "API /health"
  wait_for_url "http://127.0.0.1:4000/health/db" "API /health/db" || true

  cat <<EOF

Vidya backend is running
  API:      http://localhost:4000
  Docs:     http://localhost:4000/docs
  Health:   http://localhost:4000/health
  DB check: http://localhost:4000/health/db
  Mailhog:  http://localhost:8025
  pgAdmin:  Host localhost | Port 5432 | User vidya | Password vidya | DB vidya

Logs:       npm run docker:logs
Stop:       npm run docker:down
EOF
}

main "$@"
