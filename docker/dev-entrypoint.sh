#!/bin/sh
set -e

cd /app
bun install

PORT="${PORT:-3000}"
exec bun run dev:docker -- -H 0.0.0.0 -p "$PORT"
