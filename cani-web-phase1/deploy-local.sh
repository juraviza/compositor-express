#!/usr/bin/env sh
set -eu
cd "$(dirname "$0")"

WEB_PORT="${WEB_PORT:-3187}"
WEB_HOST="${WEB_HOST:-0.0.0.0}"
CANI_USER="${CANI_USER:-canijo}"
CANI_PASS="${CANI_PASS:-cani1234}"
CANI_API_TARGET="${CANI_API_TARGET:-http://187.127.72.117:3000}"
LOG_FILE="${LOG_FILE:-./cani-web.log}"
PID_FILE="${PID_FILE:-./cani-web.pid}"

if [ -f "$PID_FILE" ] && kill -0 "$(cat "$PID_FILE")" 2>/dev/null; then
  echo "Ya está ejecutándose con PID $(cat "$PID_FILE")"
  exit 0
fi

nohup env PORT="$WEB_PORT" HOST="$WEB_HOST" CANI_USER="$CANI_USER" CANI_PASS="$CANI_PASS" CANI_API_TARGET="$CANI_API_TARGET" node server.js >> "$LOG_FILE" 2>&1 &
echo $! > "$PID_FILE"
echo "CANI web lanzada en puerto $WEB_PORT con PID $(cat "$PID_FILE")"