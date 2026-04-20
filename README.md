# EDUTURE 2.0

> An adaptive learning platform powered by reinforcement learning and contextual bandits. Personalized education that evolves with your learning style.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-2.0.0-green.svg)

## 🎯 Overview

EDUTURE 2.0 is a modern, full-stack adaptive learning management system designed for ICDL-style certification training. It combines:

- **Intelligent Content Recommendations** via contextual bandit algorithms
- **Learning Style Personalization** (Kolb model: Activist, Theorist, Pragmatist, Reflector)
- **Real-time Progress Tracking** with activity heatmaps and streak analytics
- **Comprehensive Assessment System** with pre/post-tests and checkpoint tracking
- **Admin Analytics Dashboard** for instructor oversight and learner metrics
- **Role-based Access Control** with secure authentication

## 🏗️ Architecture

### Tech Stack

**Backend:**

- FastAPI (modern async Python framework)
- PostgreSQL (persistent relational DB)
- SQLAlchemy ORM + Alembic migrations
- Reinforcement Learning Engine (Contextual Bandit)
- JWT-based authentication with secure token refresh

**Frontend:**

- React 18 + Vite (fast build tooling)
- React Router 6 (client-side routing)
- Axios (HTTP client with interceptors)
- CSS3 (component-scoped styling)

**Deployment:**

- Docker + Docker Compose
- Alembic for database schema management
- Environment-based configuration

### Project Structure

```
eduture_rl/
├── backend/                    # FastAPI application
│   ├── app/
│   │   ├── main.py            # Application entry point
│   │   ├── models.py          # SQLAlchemy ORM models
│   │   ├── schemas.py         # Pydantic request/response schemas
│   │   ├── auth.py            # Authentication logic
│   │   ├── engines/           # RL algorithm implementations
│   │   ├── routers/           # API endpoints (auth, content, assessment, etc.)
│   │   └── utils/             # Helper modules (A/B testing, reward calculation)
│   ├── alembic/               # Database migrations
│   ├── requirements.txt        # Python dependencies
│   └── Dockerfile
├── frontend/                   # React application
│   ├── src/
│   │   ├── pages/             # Page components
│   │   ├── components/        # Reusable UI components
│   │   ├── services/          # API integration
│   │   ├── context/           # React Context (auth state)
│   │   ├── constants/         # Application data
│   │   └── styles.css         # Global & component styles
│   ├── package.json           # Node dependencies
│   └── vite.config.js
├── docker-compose.yml         # Multi-container orchestration
└── README.md                  # Detailed documentation
```

## 🚀 Quick Start

### Prerequisites

- Docker & Docker Compose (recommended)
- OR Node.js 18+ and Python 3.9+

### Option 1: Docker Compose (Recommended)

```bash
cd eduture_rl
docker compose up --build
```

- Backend API: http://localhost:8000
- Frontend: http://localhost:5173
- PostgreSQL: localhost:5432

### Option 2: Manual Setup

**Backend:**

```bash
cd eduture_rl/backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
alembic upgrade head
uvicorn app.main:app --reload
```

**Frontend:**

```bash
cd eduture_rl/frontend
npm install
npm run dev
```

## 🔐 Default Credentials

| Role  | Email               | Password      |
| ----- | ------------------- | ------------- |
| Admin | admin@eduture.local | Admin123!     |
| User  | (Register via UI)   | (Your choice) |

## 📋 Features

### 🎓 Learner Experience

- **Intelligent Dashboard** with activity heatmap and streak tracking
- **Dynamic Questionnaire** to assess learning style (Kolb model)
- **Adaptive Content Recommendations** based on performance and style
- **Interactive Assessments** with auto-submission on timeout
- **Progress Analytics** with timeline and achievement tracking
- **Mastery Badges** and cohort ranking

### 👨‍💼 Admin Experience

- **Learner Management** and progress oversight
- **Assessment Analytics** with score distributions
- **Content Management** and A/B test configuration
- **Audit Logs** for security and compliance
- **Activity Monitoring** with detailed interaction records

### 🔧 Backend Capabilities

- JWT authentication with refresh token rotation
- Content recommendation engine (contextual bandit)
- Learning style assessment via questionnaire
- Assessment and interaction logging
- Structured audit trails
- Rate limiting and security headers
- Database migrations with Alembic

## 📖 Documentation

For comprehensive setup, configuration, and API documentation, see:

- **[Detailed README](eduture_rl/README.md)** – Installation, configuration, migration details
- **[API Endpoints](eduture_rl/README.md)** – RESTful API reference
- **[Security](SECURITY.md)** – Authentication, authorization, and best practices (in parent directory)

## 🧪 Testing

### Backend Tests

```bash
cd eduture_rl/backend
pytest
```

### Frontend Build

```bash
cd eduture_rl/frontend
npm run build
```

## 🔒 Security

- **Password Hashing:** PBKDF2 (configurable rounds)
- **Token Auth:** JWT with configurable expiration
- **CORS:** Configurable origin restrictions
- **Trusted Hosts:** Request validation by hostname
- **Rate Limiting:** SlowAPI integration
- **Secure Headers:** Content-Security-Policy, X-Frame-Options, etc.
- **Audit Logging:** Structured JSON logs for auth/admin actions
- **Request Correlation:** X-Request-ID header for traceability

## 🛠️ Configuration

All configuration is environment-driven via `.env`:

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost/eduture

# Security
SECRET_KEY=your-secret-key-here
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
TRUSTED_HOSTS=localhost,127.0.0.1

# Rate Limiting
RATE_LIMIT_ENABLED=true
RATE_LIMIT_CALLS=100
RATE_LIMIT_PERIOD=3600

# Logging
AUDIT_LOGGING_ENABLED=true
DEBUG=false
```

See `eduture_rl/backend/.env.example` for all available options.

## 📊 API Overview

### Authentication

- `POST /auth/register` – Create learner account
- `POST /auth/login` – Authenticate and get tokens
- `POST /auth/refresh` – Refresh access token
- `POST /auth/logout` – Invalidate refresh token

### Content & Recommendations

- `POST /learning-style/submit` – Submit questionnaire responses
- `GET /content/recommend` – Get personalized content recommendations
- `GET /content/summary/:module_id` – Fetch module details

### Interactions & Analytics

- `POST /interaction/record` – Log learner interaction
- `GET /interaction/summary` – Get learner summary (streak, activity, time estimates)

### Assessments

- `POST /assessment/pre-test` – Submit pre-assessment
- `POST /assessment/post-test` – Submit post-assessment

### Admin

- `GET /admin/analytics` – Learner and assessment analytics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/improvement`)
3. Commit changes (`git commit -m "Add feature"`)
4. Push to branch (`git push origin feature/improvement`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License – see LICENSE file for details.

## 👤 Author

Created with ❤️ for adaptive learning research and development.

---

**Questions or Issues?** Open an issue on GitHub or check the [Detailed README](eduture_rl/README.md) for troubleshooting.
