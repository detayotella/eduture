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
- The root-level `docker-compose.yml` now starts the frontend too; use that file from the repo root when you want the full stack.

Troubleshooting: "permission denied" when starting containers

- If you mount the repository into the container (the compose file uses a bind `./:/app`), the mounted files keep the host filesystem permissions. If `entrypoint.sh` is not executable on your host, you can get an error like:

  ```text
  exec: "/app/entrypoint.sh": permission denied
  ```

  Fix options:
  1.  Make the script executable on the host:

  ```bash
  chmod +x backend/entrypoint.sh
  ```

  2.  Or run the script through a shell via the compose file (already applied in `docker-compose.yml`) so an executable bit isn't required: the backend service runs `sh /app/entrypoint.sh`.

  3.  Alternatively avoid mounting the repo (remove the `volumes:` line) so the image's baked-in permissions are used.
