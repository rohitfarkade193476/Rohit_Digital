#!/bin/sh
set -e

# Apply pending migrations before serving. Runs here, not at build time,
# because the database is only reachable at runtime.
npx prisma migrate deploy

exec "$@"
