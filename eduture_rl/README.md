cke# EDUTURE 2.0

Adaptive learning system for ICDL-style training with a FastAPI backend and a React frontend.

## What is included

- FastAPI backend with authentication, learning-style questionnaire, content recommendation, interaction logging, assessment endpoints, and admin analytics
- React/Vite frontend with the requested landing, login, register, questionnaire, dashboard, learning, assessment, progress, and admin views
- Provided contextual bandit and A/B testing logic integrated into the backend
- Seeded sample content and a default admin account

## Quick start

### Full stack (Docker Compose)

```bash
docker compose up --build
```

Frontend will be available at `http://localhost:5173`, the backend API at `http://localhost:8000`, and PostgreSQL at `localhost:5432`.

To stop services:

```bash
docker compose down
```

To stop and remove persisted DB volume:

```bash
docker compose down -v
```

If you only want the backend and database, use `docker compose -f backend/docker-compose.yml up --build` from the repo root or run the commands in `backend/DOCKER.md`.

### Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
alembic upgrade head
uvicorn app.main:app --reload
```

### Database migrations (Alembic)

Create a migration:

```bash
cd backend
alembic revision --autogenerate -m "describe change"
```

Apply migrations:

```bash
cd backend
alembic upgrade head
```

If you already have an existing local schema created before Alembic, stamp it once:

```bash
cd backend
alembic stamp head
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Vercel deployment

This repository can run with the frontend and backend in one Vercel project:

1. Set the frontend API base to `/api` so browser requests stay on the same origin.
2. Deploy the repo with the root `vercel.json` and `api/index.py` entrypoint.
3. Set backend environment variables in Vercel, especially:
   - `SECRET_KEY`
   - `DATABASE_URL`
   - `CORS_ORIGINS` to your deployed frontend origin
   - `TRUSTED_HOSTS` to include your Vercel domain, for example `*.vercel.app`
   - `GOOGLE_OAUTH_ENABLED=true`
   - `GOOGLE_OAUTH_REDIRECT_URI=https://<your-domain>/api/auth/google/callback`
   - `GOOGLE_OAUTH_FRONTEND_SUCCESS_URL=https://<your-domain>/login?oauth=success`
   - `GOOGLE_OAUTH_FRONTEND_ERROR_URL=https://<your-domain>/login?oauth=error`

Google Sign-In must use the deployed callback URL exactly as registered in Google Cloud Console. If you use a custom Vercel domain, register that exact domain too.

For local development, the frontend still proxies `/api` to `http://localhost:8000`.

## Default admin

- Email: `admin@eduture.local`
- Password: `Admin123!`

## Notes

- The backend can run with SQLite or PostgreSQL via `DATABASE_URL`.
- Docker Compose is configured to run the backend against PostgreSQL by default.
- Security hardening is enabled: trusted-host filtering, API rate limiting, and secure response headers.
- Configure `TRUSTED_HOSTS`, `CORS_ORIGINS`, and rate-limit variables in `backend/.env` for your deployment.
- Database schema management is migration-driven through Alembic (no startup `create_all`).
- Structured audit logs are emitted for auth and admin actions, including request correlation via `X-Request-ID`.
