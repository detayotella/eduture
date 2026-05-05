#!/usr/bin/env sh
set -e

python -m app.bootstrap_migrations
python -m app.bootstrap_data
exec uvicorn app.main:app --host 0.0.0.0 --port 8000
