#!/usr/bin/env sh
set -eu

export HOST="${HOST:-0.0.0.0}"
export PORT="${PORT:-3187}"
export CANI_USER="${CANI_USER:-canijo}"
export CANI_PASS="${CANI_PASS:-cani1234}"
export CANI_API_TARGET="${CANI_API_TARGET:-http://187.127.72.117:3000}"

exec node server.js
