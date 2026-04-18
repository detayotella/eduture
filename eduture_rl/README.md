# EDUTURE 2.0

Adaptive learning system for ICDL-style training with a FastAPI backend and a React frontend.

## What is included

- FastAPI backend with authentication, learning-style questionnaire, content recommendation, interaction logging, assessment endpoints, and admin analytics
- React/Vite frontend with the requested landing, login, register, questionnaire, dashboard, learning, assessment, progress, and admin views
- Provided contextual bandit and A/B testing logic integrated into the backend
- Seeded sample content and a default admin account

## Quick start

### Backend + PostgreSQL (Docker Compose)

```bash
docker compose up --build
```

Backend API will be available at `http://localhost:8000` and PostgreSQL at `localhost:5432`.

To stop services:

```bash
docker compose down
```

To stop and remove persisted DB volume:

```bash
docker compose down -v
```

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
