#!/usr/bin/env bash
# Shared Docker/Colima bootstrap for local Vidya scripts.
set -euo pipefail

detect_lan_ip() {
  if [[ "$(uname -s)" == "Darwin" ]]; then
    ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || true
    return 0
  fi
  hostname -I 2>/dev/null | awk '{print $1}' || true
}

# Export VIDYA_DEV_HOST for Expo Go / physical devices (LAN IP of this machine).
ensure_dev_host() {
  if [[ -n "${VIDYA_DEV_HOST:-}" ]]; then
    return 0
  fi
  local ip
  ip="$(detect_lan_ip)"
  if [[ -n "${ip}" ]]; then
    export VIDYA_DEV_HOST="${ip}"
    echo "Using LAN host for Expo Go: ${VIDYA_DEV_HOST}"
  else
    export VIDYA_DEV_HOST="127.0.0.1"
    echo "Warning: could not detect LAN IP; Expo Go on a phone may not reach the API." >&2
  fi
}

ensure_docker() {
  if ! command -v docker >/dev/null 2>&1; then
    echo "Docker CLI not found. Install Docker or Colima first." >&2
    exit 1
  fi

  local colima_sock="${HOME}/.colima/default/docker.sock"
  if [[ -S "${colima_sock}" ]]; then
    export DOCKER_HOST="unix://${colima_sock}"
  fi

  if docker info >/dev/null 2>&1; then
    return 0
  fi

  if command -v colima >/dev/null 2>&1; then
    echo "Docker daemon not ready — starting Colima..."
    colima start
    export DOCKER_HOST="unix://${colima_sock}"
  elif [[ -d "/Applications/Docker.app" ]]; then
    echo "Docker daemon not ready — launching Docker Desktop..."
    open -a Docker
  else
    echo "No Docker runtime found. Install Colima (\`brew install colima docker\`) or Docker Desktop." >&2
    exit 1
  fi

  local i
  for i in $(seq 1 90); do
    if [[ -S "${colima_sock}" ]]; then
      export DOCKER_HOST="unix://${colima_sock}"
    fi
    if docker info >/dev/null 2>&1; then
      echo "Docker is ready."
      return 0
    fi
    sleep 2
  done

  echo "Timed out waiting for Docker. Check Colima/Docker Desktop, then retry \`pnpm start\`." >&2
  exit 1
}
