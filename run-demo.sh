#!/bin/sh
set -eu

IMAGE="${DEMO_IMAGE:-ghcr.io/amrabdelhalim-labs/desktop-todolist-e1:v1.0.1}"
DEFAULT_PORT="${DEMO_PORT:-6080}"
CONTAINER_PORT="6080"
READY_PATH="/vnc_lite.html"
PREVIEW_PATH="/vnc_lite.html?autoconnect=true&resize=scale"

command -v docker >/dev/null 2>&1 || {
  echo "Docker is required but was not found." >&2
  exit 1
}
command -v curl >/dev/null 2>&1 || {
  echo "curl is required but was not found." >&2
  exit 1
}

if ! docker image inspect "$IMAGE" >/dev/null 2>&1; then
  echo "Pulling $IMAGE..."
  docker pull "$IMAGE"
fi

port="$DEFAULT_PORT"
last_port=$((DEFAULT_PORT + 100))
container_name=""
container_id=""

while [ "$port" -le "$last_port" ]; do
  container_name="desktop-todolist-e1-demo-${port}-$$"
  if container_id=$(docker run -d \
    --name "$container_name" \
    -p "127.0.0.1:${port}:${CONTAINER_PORT}" \
    "$IMAGE" 2>/tmp/"$container_name".log); then
    break
  fi

  docker rm -f "$container_name" >/dev/null 2>&1 || true
  port=$((port + 1))
  container_id=""
done

if [ -z "$container_id" ]; then
  echo "Unable to start the demo on ports ${DEFAULT_PORT}-${last_port}." >&2
  exit 1
fi

ready_url="http://127.0.0.1:${port}${READY_PATH}"
preview_url="http://127.0.0.1:${port}${PREVIEW_PATH}"

ready=false
attempt=1
while [ "$attempt" -le 120 ]; do
  if curl -fsS "$ready_url" >/dev/null 2>&1; then
    ready=true
    break
  fi

  if [ "$(docker inspect -f '{{.State.Running}}' "$container_id" 2>/dev/null || true)" != "true" ]; then
    echo "The demo container stopped before becoming ready." >&2
    docker logs "$container_id" >&2 || true
    docker rm -f "$container_id" >/dev/null 2>&1 || true
    exit 1
  fi

  attempt=$((attempt + 1))
  sleep 1
done

if [ "$ready" != true ]; then
  echo "The demo did not become ready within 120 seconds." >&2
  docker logs "$container_id" >&2 || true
  docker rm -f "$container_id" >/dev/null 2>&1 || true
  exit 1
fi

echo "CONTAINER_NAME=$container_name"
echo "PREVIEW_URL=$preview_url"
echo "STOP_COMMAND=docker rm -f $container_name"

if [ -n "${DEMO_OPEN_COMMAND:-}" ]; then
  "$DEMO_OPEN_COMMAND" "$preview_url"
elif [ "$(uname -s)" = "Darwin" ]; then
  open "$preview_url"
elif command -v xdg-open >/dev/null 2>&1; then
  xdg-open "$preview_url"
else
  echo "No supported browser opener was found; open $preview_url manually." >&2
  exit 1
fi
