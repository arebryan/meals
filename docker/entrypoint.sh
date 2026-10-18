#!/bin/sh
set -eu

if [ -n "${DATABASE_URL:-}" ]; then
  echo "Running database migrations..."
  npx drizzle-kit migrate || echo "Migration step skipped or failed (check drizzle meta)."
fi

exec "$@"
