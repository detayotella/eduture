Docker development and local run instructions for the backend

Prerequisites
- Docker and Docker Compose installed.

Quick start (development)

1. From the `backend` directory, build and start services:

```bash
docker compose up --build
```

2. The API will be available at http://localhost:8000

3. To run migrations inside the container (one-off):

```bash
docker compose run --rm backend python -m app.bootstrap_migrations
```

Notes
- The compose file exposes Postgres on port 5432 and the backend on 8000.
- Environment values are provided via `.env.docker`. Adjust as needed before starting.
