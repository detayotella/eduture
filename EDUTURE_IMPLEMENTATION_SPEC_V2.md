# EDUTURE 2.0 - Implementation Specification (Agent-Ready)
## Complete Build Guide with Security & Production Standards

**Version:** 2.0  
**Last Updated:** 2025  
**Estimated Build Time:** 3-4 weeks  
**Target:** Production-ready adaptive learning system

---

## Table of Contents
1. [System Architecture](#1-system-architecture)
2. [Database Schema](#2-database-schema)
3. [Backend API Specification](#3-backend-api-specification)
4. [Frontend Specification](#4-frontend-specification)
5. [Security Requirements](#5-security-requirements)
6. [Error Handling](#6-error-handling)
7. [Rate Limiting](#7-rate-limiting)
8. [Input Validation](#8-input-validation)
9. [Deployment](#9-deployment)
10. [Testing Requirements](#10-testing-requirements)

---

## 1. System Architecture

### 1.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐     │
│  │   Learner    │  │    Admin     │  │  Analytics   │  │   Login     │     │
│  │   Portal     │  │   Dashboard  │  │  Dashboard   │  │   Page      │     │
│  └──────────────┘  └──────────────┘  └──────────────┘  └─────────────┘     │
│                         React 18 + Tailwind CSS + Recharts                   │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ HTTPS/JSON
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              API LAYER                                       │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                         FastAPI 0.104+                               │    │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │    │
│  │  │  Auth    │ │ Learning │ │ Content  │ │Analytics │ │  Admin   │  │    │
│  │  │  Router  │ │  Router  │ │  Router  │ │  Router  │ │  Router  │  │    │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘  │    │
│  │  ┌──────────────────────────────────────────────────────────────┐  │    │
│  │  │                    ADAPTATION ENGINES                         │  │    │
│  │  │  ┌───────────────┐         ┌─────────────────────────────┐   │  │    │
│  │  │  │  Rule-Based   │◄────────┤   Hybrid Decision Module    │   │  │    │
│  │  │  │  Engine       │         │   (fallback logic)          │   │  │    │
│  │  │  └───────────────┘         └─────────────────────────────┘   │  │    │
│  │  │  ┌───────────────┐                                           │  │    │
│  │  │  │  RL Engine    │──► LinUCB Contextual Bandit              │  │    │
│  │  │  │  (Contextual  │                                           │  │    │
│  │  │  │   Bandit)     │                                           │  │    │
│  │  │  └───────────────┘                                           │  │    │
│  │  └──────────────────────────────────────────────────────────────┘  │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ SQLAlchemy + Asyncpg
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              DATA LAYER                                      │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                    PostgreSQL 15 + pgvector                          │    │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │    │
│  │  │ Learners │ │ Content  │ │ Interact │ │ Assess   │ │  A/B     │  │    │
│  │  │  Table   │ │  Table   │ │  Table   │ │  Table   │ │  Table   │  │    │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘  │    │
│  │  ┌──────────────────────────────────────────────────────────────┐  │    │
│  │  │              Learning Styles + History Table                  │  │    │
│  │  └──────────────────────────────────────────────────────────────┘  │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Technology Stack

| Layer | Technology | Version | Purpose |
|-------|------------|---------|---------|
| **Frontend** | React | 18.x | UI framework |
| | React Router | 6.x | Navigation |
| | Axios | 1.x | HTTP client |
| | Tailwind CSS | 3.x | Styling |
| | Recharts | 2.x | Charts |
| **Backend** | Python | 3.11+ | Runtime |
| | FastAPI | 0.104+ | API framework |
| | SQLAlchemy | 2.x | ORM |
| | Pydantic | 2.x | Validation |
| | Asyncpg | 0.29+ | Async PostgreSQL |
| | Uvicorn | 0.24+ | ASGI server |
| | PyJWT | 2.x | Authentication |
| | Passlib | 1.x | Password hashing |
| | Slowapi | 0.1+ | Rate limiting |
| **Database** | PostgreSQL | 15.x | Primary DB |
| | pgvector | 0.5+ | Vector storage |
| **ML/RL** | NumPy | 1.24+ | Numerical computing |
| | SciPy | 1.11+ | Statistics |

### 1.3 Project Structure

```
eduture-rl/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                 # FastAPI entry
│   │   ├── config.py               # Settings
│   │   ├── database.py             # DB connection
│   │   ├── models.py               # SQLAlchemy models
│   │   ├── auth.py                 # JWT + password
│   │   ├── dependencies.py         # FastAPI deps
│   │   ├── exceptions.py           # Custom exceptions
│   │   ├── logging_config.py       # Logging setup
│   │   ├── routers/
│   │   │   ├── __init__.py
│   │   │   ├── auth.py             # /auth/*
│   │   │   ├── learning_style.py   # /learning-style/*
│   │   │   ├── content.py          # /content/*
│   │   │   ├── interaction.py      # /interaction/*
│   │   │   ├── assessment.py       # /assessment/*
│   │   │   └── admin.py            # /admin/*
│   │   ├── engines/
│   │   │   ├── __init__.py
│   │   │   ├── rule_based.py       # Original algorithm
│   │   │   ├── contextual_bandit.py # RL engine (provided)
│   │   │   └── hybrid.py           # Hybrid decision module
│   │   └── utils/
│   │       ├── __init__.py
│   │       ├── reward.py           # Reward calculation
│   │       ├── ab_testing.py       # A/B testing (provided)
│   │       └── validators.py       # Input validators
│   ├── alembic/                    # Migrations
│   ├── tests/                      # Test files
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   └── index.js
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## 2. Database Schema

### 2.1 Entity Relationship Diagram

```
┌─────────────────┐       ┌──────────────────┐       ┌─────────────────┐
│    learners     │       │ content_fragments│       │   interactions  │
├─────────────────┤       ├──────────────────┤       ├─────────────────┤
│ id (PK)         │       │ id (PK)          │       │ id (PK)         │
│ email (UQ)      │       │ module_id        │       │ learner_id (FK) │
│ password_hash   │       │ topic_id         │       │ content_id (FK) │
│ full_name       │       │ content_type     │       │ group_assigned  │
│ is_active       │       │ sequence_order   │       │ context_vector  │
│ created_at      │       │ title            │       │ reward          │
│ last_login      │       │ content_data     │       │ timestamp       │
└─────────────────┘       │ difficulty       │       └─────────────────┘
         │                └──────────────────┘                │
         │                         │                          │
         │ 1:1                     │                          │
         ▼                         │                          │
┌─────────────────┐                │                          │
│ learning_styles │                │                          │
├─────────────────┤                │                          │
│ id (PK)         │                │                          │
│ learner_id (FK) │                │                          │
│ activist_score  │                │                          │
│ reflector_score │                │                          │
│ theorist_score  │                │                          │
│ pragmatist_score│                │                          │
│ dominant_style  │                │                          │
│ responses (JSON)│                │                          │
│ assessed_at     │                │                          │
└─────────────────┘                │                          │
         │                         │                          │
         │                         │                          │
         ▼                         ▼                          ▼
┌─────────────────┐       ┌──────────────────┐       ┌─────────────────┐
│ ab_test_assign  │       │   assessments    │       │     (RL state)  │
├─────────────────┤       ├──────────────────┤       │   stored in     │
│ id (PK)         │       │ id (PK)          │       │   JSONB or      │
│ learner_id (FK) │       │ learner_id (FK)  │       │   separate table│
│ group (enum)    │       │ content_id (FK)  │       └─────────────────┘
│ assigned_at     │       │ type (pre/post)  │
│ stratified_by   │       │ score            │
└─────────────────┘       │ completion_time  │
                          │ passed           │
                          │ satisfaction     │
                          └──────────────────┘
```

### 2.2 Complete SQL Schema

```sql
-- ============================================
-- EXTENSIONS
-- ============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgvector";

-- ============================================
-- TABLE: learners
-- ============================================
CREATE TABLE learners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    is_admin BOOLEAN DEFAULT FALSE,
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE,
    login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_learners_email ON learners(email);
CREATE INDEX idx_learners_active ON learners(is_active);

COMMENT ON TABLE learners IS 'User accounts with authentication tracking';

-- ============================================
-- TABLE: learning_styles
-- ============================================
CREATE TABLE learning_styles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    learner_id UUID REFERENCES learners(id) ON DELETE CASCADE,
    activist_score INTEGER NOT NULL CHECK (activist_score BETWEEN 0 AND 20),
    reflector_score INTEGER NOT NULL CHECK (reflector_score BETWEEN 0 AND 20),
    theorist_score INTEGER NOT NULL CHECK (theorist_score BETWEEN 0 AND 20),
    pragmatist_score INTEGER NOT NULL CHECK (pragmatist_score BETWEEN 0 AND 20),
    dominant_style VARCHAR(20) NOT NULL CHECK (
        dominant_style IN ('activist', 'reflector', 'theorist', 'pragmatist')
    ),
    questionnaire_responses JSONB NOT NULL,
    assessed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_learning_styles_learner ON learning_styles(learner_id);
CREATE INDEX idx_learning_styles_dominant ON learning_styles(dominant_style);

COMMENT ON TABLE learning_styles IS 'Honey & Mumford assessment results';

-- ============================================
-- TABLE: ab_test_assignments
-- ============================================
CREATE TABLE ab_test_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    learner_id UUID REFERENCES learners(id) ON DELETE CASCADE,
    group_assignment VARCHAR(20) NOT NULL CHECK (
        group_assignment IN ('rule_based', 'rl_based')
    ),
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    stratified_by_style VARCHAR(20),
    
    UNIQUE(learner_id)
);

CREATE INDEX idx_ab_test_group ON ab_test_assignments(group_assignment);
CREATE INDEX idx_ab_test_stratified ON ab_test_assignments(stratified_by_style);

COMMENT ON TABLE ab_test_assignments IS 'A/B test group assignments';

-- ============================================
-- TABLE: content_fragments
-- ============================================
CREATE TABLE content_fragments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    module_id VARCHAR(50) NOT NULL,
    topic_id VARCHAR(50) NOT NULL,
    content_type VARCHAR(20) NOT NULL CHECK (
        content_type IN ('theory', 'example', 'activity', 'exercise')
    ),
    sequence_order INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    content_data TEXT NOT NULL,
    difficulty FLOAT NOT NULL CHECK (difficulty BETWEEN 0 AND 1),
    estimated_time_minutes INTEGER NOT NULL DEFAULT 10,
    prerequisites JSONB DEFAULT '[]',
    tags JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_content_module ON content_fragments(module_id);
CREATE INDEX idx_content_topic ON content_fragments(topic_id);
CREATE INDEX idx_content_type ON content_fragments(content_type);
CREATE INDEX idx_content_active ON content_fragments(is_active);
CREATE INDEX idx_content_difficulty ON content_fragments(difficulty);

COMMENT ON TABLE content_fragments IS 'Learning content organized by module/topic';

-- ============================================
-- TABLE: interactions
-- ============================================
CREATE TABLE interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    learner_id UUID NOT NULL REFERENCES learners(id) ON DELETE CASCADE,
    content_id UUID NOT NULL REFERENCES content_fragments(id),
    group_assigned VARCHAR(20) NOT NULL,
    
    -- Context features at time of recommendation
    context_time_on_task FLOAT NOT NULL CHECK (context_time_on_task BETWEEN 0 AND 1),
    context_error_rate FLOAT NOT NULL CHECK (context_error_rate BETWEEN 0 AND 1),
    context_revisit_count FLOAT NOT NULL CHECK (context_revisit_count BETWEEN 0 AND 1),
    context_completion_rate FLOAT NOT NULL CHECK (context_completion_rate BETWEEN 0 AND 1),
    context_engagement_score FLOAT NOT NULL CHECK (context_engagement_score BETWEEN 0 AND 1),
    context_learning_style VARCHAR(20) NOT NULL,
    context_topic_difficulty FLOAT NOT NULL CHECK (context_topic_difficulty BETWEEN 0 AND 1),
    context_vector vector(10),  -- pgvector for similarity search
    
    -- Recommendation made
    recommended_content_type VARCHAR(20) NOT NULL,
    
    -- Outcome
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    quiz_score FLOAT CHECK (quiz_score BETWEEN 0 AND 100),
    actual_time_minutes INTEGER,
    is_revisit BOOLEAN NOT NULL DEFAULT FALSE,
    reward FLOAT NOT NULL CHECK (reward BETWEEN 0 AND 1),
    
    -- Engagement signals
    scroll_depth FLOAT CHECK (scroll_depth BETWEEN 0 AND 1),
    click_count INTEGER CHECK (click_count >= 0),
    
    -- Metadata
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ip_address INET,
    user_agent TEXT
);

CREATE INDEX idx_interactions_learner ON interactions(learner_id);
CREATE INDEX idx_interactions_timestamp ON interactions(timestamp);
CREATE INDEX idx_interactions_group ON interactions(group_assigned);
CREATE INDEX idx_interactions_content ON interactions(content_id);
CREATE INDEX idx_interactions_vector ON interactions USING ivfflat (context_vector vector_cosine_ops);

COMMENT ON TABLE interactions IS 'Learner-content interactions with context for RL';

-- ============================================
-- TABLE: assessments
-- ============================================
CREATE TABLE assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    learner_id UUID NOT NULL REFERENCES learners(id) ON DELETE CASCADE,
    content_id UUID REFERENCES content_fragments(id),
    assessment_type VARCHAR(20) NOT NULL CHECK (
        assessment_type IN ('pre_test', 'post_test', 'quiz')
    ),
    module_id VARCHAR(50),
    score FLOAT NOT NULL CHECK (score BETWEEN 0 AND 100),
    max_score FLOAT NOT NULL DEFAULT 100,
    correct_answers INTEGER,
    total_questions INTEGER,
    completion_time_minutes INTEGER,
    passed BOOLEAN,
    responses JSONB NOT NULL,
    satisfaction_rating INTEGER CHECK (satisfaction_rating BETWEEN 1 AND 5),
    taken_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_assessments_learner ON assessments(learner_id);
CREATE INDEX idx_assessments_type ON assessments(assessment_type);
CREATE INDEX idx_assessments_module ON assessments(module_id);
CREATE INDEX idx_assessments_taken_at ON assessments(taken_at);

COMMENT ON TABLE assessments IS 'Quiz and test results';

-- ============================================
-- TABLE: rl_model_state (for persisting RL models)
-- ============================================
CREATE TABLE rl_model_state (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    arm VARCHAR(20) NOT NULL,  -- 'theory', 'example', 'activity', 'exercise'
    a_matrix JSONB NOT NULL,   -- A matrix for LinUCB
    b_vector JSONB NOT NULL,   -- b vector for LinUCB
    interaction_count INTEGER DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX idx_rl_model_arm ON rl_model_state(arm);

COMMENT ON TABLE rl_model_state IS 'Persisted state for Contextual Bandit models';

-- ============================================
-- TABLE: refresh_tokens (for JWT refresh)
-- ============================================
CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    learner_id UUID NOT NULL REFERENCES learners(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    revoked_at TIMESTAMP WITH TIME ZONE,
    ip_address INET,
    user_agent TEXT
);

CREATE INDEX idx_refresh_tokens_learner ON refresh_tokens(learner_id);
CREATE INDEX idx_refresh_tokens_expires ON refresh_tokens(expires_at);

COMMENT ON TABLE refresh_tokens IS 'JWT refresh token storage';

-- ============================================
-- TABLE: audit_logs (for security)
-- ============================================
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    learner_id UUID REFERENCES learners(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id UUID,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_learner ON audit_logs(learner_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp);

COMMENT ON TABLE audit_logs IS 'Security audit trail';
```

---

## 3. Backend API Specification

### 3.1 Response Format Standard

**Success Response:**
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "per_page": 20,
    "total": 100
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message",
    "details": [
      {"field": "email", "message": "Invalid email format"}
    ]
  }
}
```

### 3.2 Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Invalid input data |
| `AUTHENTICATION_ERROR` | 401 | Not authenticated |
| `AUTHORIZATION_ERROR` | 403 | Not authorized |
| `NOT_FOUND` | 404 | Resource not found |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |

### 3.3 API Endpoints

#### Authentication

**POST /auth/register**
```
Request:
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "full_name": "John Doe"
}

Response (201):
{
  "success": true,
  "data": {
    "learner_id": "uuid",
    "email": "user@example.com",
    "access_token": "jwt-token",
    "refresh_token": "refresh-token",
    "token_type": "Bearer",
    "expires_in": 3600
  }
}
```

**POST /auth/login**
```
Request:
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}

Response (200):
{
  "success": true,
  "data": {
    "learner_id": "uuid",
    "email": "user@example.com",
    "full_name": "John Doe",
    "access_token": "jwt-token",
    "refresh_token": "refresh-token",
    "token_type": "Bearer",
    "expires_in": 3600,
    "has_completed_questionnaire": false
  }
}
```

**POST /auth/refresh**
```
Request:
{
  "refresh_token": "refresh-token"
}

Response (200):
{
  "success": true,
  "data": {
    "access_token": "new-jwt-token",
    "expires_in": 3600
  }
}
```

**POST /auth/logout**
```
Headers: Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "message": "Logged out successfully"
}
```

#### Learning Style Assessment

**GET /learning-style/questionnaire**
```
Headers: Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "data": {
    "instructions": "Answer Yes or No to each statement...",
    "total_questions": 80,
    "questions": [
      {
        "id": 1,
        "text": "I like to try things out for myself",
        "category": "activist"
      }
    ]
  }
}
```

**POST /learning-style/submit**
```
Headers: Authorization: Bearer <token>

Request:
{
  "responses": [
    {"question_id": 1, "answer": "yes"},
    {"question_id": 2, "answer": "no"}
  ]
}

Response (200):
{
  "success": true,
  "data": {
    "dominant_style": "activist",
    "scores": {
      "activist": 15,
      "reflector": 8,
      "theorist": 6,
      "pragmatist": 10
    },
    "group_assignment": "rl_based",
    "message": "You have been assigned to the RL-based adaptation group"
  }
}
```

#### Content Delivery

**GET /content/modules**
```
Headers: Authorization: Bearer <token>
Query: ?page=1&per_page=20

Response (200):
{
  "success": true,
  "data": {
    "modules": [
      {
        "id": "icdl-computer-essentials",
        "title": "Computer Essentials",
        "description": "Basic computer concepts",
        "progress": 0.3
      }
    ]
  },
  "meta": {
    "page": 1,
    "per_page": 20,
    "total": 5
  }
}
```

**GET /content/recommend**
```
Headers: Authorization: Bearer <token>
Query: ?topic_id=intro-to-computers

Response (200):
{
  "success": true,
  "data": {
    "recommendation": {
      "content_id": "uuid",
      "content_type": "activity",
      "title": "Hands-on: Exploring the Desktop",
      "content": "...",
      "estimated_time": 15,
      "adaptation_mode": "rl_based",
      "reasoning": "Based on your activist learning style"
    },
    "progress": {
      "completed": 1,
      "total": 4,
      "percentage": 25
    }
  }
}
```

#### Interaction Recording

**POST /interaction/record**
```
Headers: Authorization: Bearer <token>

Request:
{
  "content_id": "uuid",
  "completed": true,
  "quiz_score": 85,
  "actual_time_minutes": 18,
  "is_revisit": false,
  "engagement_signals": {
    "scroll_depth": 0.95,
    "click_count": 24
  }
}

Response (200):
{
  "success": true,
  "data": {
    "interaction_id": "uuid",
    "reward": 0.82,
    "next_recommendation": {
      "content_id": "uuid",
      "content_type": "example"
    }
  }
}
```

#### Assessment

**POST /assessment/post-test**
```
Headers: Authorization: Bearer <token>

Request:
{
  "module_id": "icdl-computer-essentials",
  "responses": [
    {"question_id": 1, "answer": "B", "correct": true}
  ],
  "completion_time_minutes": 25
}

Response (200):
{
  "success": true,
  "data": {
    "score": 83.3,
    "correct_answers": 15,
    "total_questions": 18,
    "passed": true,
    "icdl_threshold": 75
  }
}
```

#### Admin

**GET /admin/stats**
```
Headers: Authorization: Bearer <admin-token>

Response (200):
{
  "success": true,
  "data": {
    "overview": {
      "total_learners": 60,
      "rule_based": 30,
      "rl_based": 30
    },
    "pass_rates": {
      "rule_based": 0.87,
      "rl_based": 0.93,
      "p_value": 0.042,
      "significant": true
    },
    "scores": {
      "rule_based": 78.5,
      "rl_based": 82.1,
      "p_value": 0.038,
      "effect_size": "medium",
      "cohens_d": 0.42
    }
  }
}
```

---

## 4. Frontend Specification

### 4.1 Page Routes

| Route | Component | Access | Description |
|-------|-----------|--------|-------------|
| `/` | LandingPage | Public | Project intro |
| `/login` | LoginPage | Public | User login |
| `/register` | RegisterPage | Public | Registration |
| `/questionnaire` | QuestionnairePage | Auth | 80-question assessment |
| `/dashboard` | DashboardPage | Auth | Learner home |
| `/learn/:topicId` | LearningPage | Auth | Content viewer |
| `/assessment/:type` | AssessmentPage | Auth | Tests |
| `/progress` | ProgressPage | Auth | Personal stats |
| `/admin` | AdminDashboard | Admin | System analytics |

### 4.2 State Management

```javascript
// Global State Structure
{
  auth: {
    user: {
      id: string,
      email: string,
      full_name: string,
      is_admin: boolean
    } | null,
    access_token: string | null,
    refresh_token: string | null,
    isAuthenticated: boolean,
    loading: boolean
  },
  learning: {
    learningStyle: {
      dominant: string,
      scores: object
    } | null,
    currentModule: string | null,
    currentTopic: string | null,
    progress: object
  },
  content: {
    modules: array,
    currentFragment: object | null
  }
}
```

---

## 5. Security Requirements

See **SECURITY.md** for complete security specification.

### 5.1 Quick Security Checklist

- [ ] Passwords hashed with bcrypt (12 rounds)
- [ ] JWT tokens with 1-hour expiry
- [ ] Refresh tokens with 7-day expiry
- [ ] Rate limiting on auth endpoints
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS protection (output encoding)
- [ ] CSRF protection
- [ ] Security headers (HSTS, CSP, X-Frame-Options)
- [ ] HTTPS only
- [ ] Audit logging

---

## 6. Error Handling

### 6.1 Exception Hierarchy

```python
# app/exceptions.py

class EDUTUREException(Exception):
    """Base exception"""
    def __init__(self, message, code, status_code=500):
        self.message = message
        self.code = code
        self.status_code = status_code
        super().__init__(message)

class ValidationError(EDUTUREException):
    def __init__(self, message, details=None):
        super().__init__(message, "VALIDATION_ERROR", 400)
        self.details = details or []

class AuthenticationError(EDUTUREException):
    def __init__(self, message="Authentication required"):
        super().__init__(message, "AUTHENTICATION_ERROR", 401)

class AuthorizationError(EDUTUREException):
    def __init__(self, message="Not authorized"):
        super().__init__(message, "AUTHORIZATION_ERROR", 403)

class NotFoundError(EDUTUREException):
    def __init__(self, resource="Resource"):
        super().__init__(f"{resource} not found", "NOT_FOUND", 404)

class RateLimitError(EDUTUREException):
    def __init__(self, retry_after=60):
        super().__init__("Rate limit exceeded", "RATE_LIMIT_EXCEEDED", 429)
        self.retry_after = retry_after
```

---

## 7. Rate Limiting

### 7.1 Rate Limit Configuration

| Endpoint | Requests | Window | Key |
|----------|----------|--------|-----|
| `POST /auth/login` | 5 | 1 minute | IP + email |
| `POST /auth/register` | 3 | 5 minutes | IP |
| `POST /auth/refresh` | 10 | 1 minute | IP |
| API (authenticated) | 100 | 1 minute | user_id |
| Admin endpoints | 50 | 1 minute | user_id |

### 7.2 Rate Limit Response

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests",
    "retry_after": 45
  }
}
```

---

## 8. Input Validation

### 8.1 Validation Rules

| Field | Type | Min | Max | Pattern | Required |
|-------|------|-----|-----|---------|----------|
| email | string | 5 | 255 | RFC 5322 | Yes |
| password | string | 8 | 128 | 1 upper, 1 lower, 1 digit, 1 special | Yes |
| full_name | string | 2 | 100 | `^[a-zA-Z\s'-]+$` | Yes |
| quiz_score | number | 0 | 100 | - | Yes |
| content_id | UUID | - | - | UUID v4 format | Yes |

### 8.2 Password Requirements

- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 digit
- At least 1 special character (!@#$%^&*)

---

## 9. Deployment

### 9.1 Environment Variables

```bash
# Required
DATABASE_URL=postgresql://user:pass@localhost:5432/eduture_db
SECRET_KEY=your-secret-key-min-32-characters
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
REFRESH_TOKEN_EXPIRE_DAYS=7

# Optional
DEBUG=false
LOG_LEVEL=INFO
CORS_ORIGINS=http://localhost:3000,https://yourdomain.com
RATE_LIMIT_ENABLED=true

# Admin
INITIAL_ADMIN_EMAIL=admin@eduture.com
INITIAL_ADMIN_PASSWORD=change-me-immediately
```

### 9.2 Docker Compose

```yaml
version: '3.8'

services:
  db:
    image: postgres:15
    environment:
      POSTGRES_USER: ${DB_USER:-eduture}
      POSTGRES_PASSWORD: ${DB_PASSWORD:-password}
      POSTGRES_DB: ${DB_NAME:-eduture_db}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER:-eduture}"]
      interval: 5s
      timeout: 5s
      retries: 5

  backend:
    build: ./backend
    environment:
      DATABASE_URL: ${DATABASE_URL}
      SECRET_KEY: ${SECRET_KEY}
    ports:
      - "8000:8000"
    depends_on:
      db:
        condition: service_healthy

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    depends_on:
      - backend

volumes:
  postgres_data:
```

---

## 10. Testing Requirements

### 10.1 Test Coverage

| Component | Minimum Coverage |
|-----------|------------------|
| Models | 90% |
| Routers | 80% |
| Engines | 85% |
| Utils | 80% |

### 10.2 Required Tests

- [ ] User registration/login
- [ ] Questionnaire submission
- [ ] A/B assignment balance (50/50)
- [ ] Content recommendation (both engines)
- [ ] Interaction recording
- [ ] Reward calculation
- [ ] Statistical comparison
- [ ] Rate limiting
- [ ] Input validation
- [ ] Authentication/authorization

---

## Appendix: Agent Checklist

Before delivery, verify:

- [ ] All database tables created with proper indexes
- [ ] All API endpoints implemented with correct responses
- [ ] Authentication working (JWT + refresh tokens)
- [ ] Rate limiting configured
- [ ] Input validation on all endpoints
- [ ] Error handling consistent
- [ ] Frontend pages functional
- [ ] RL engine integrated and learning
- [ ] A/B testing working
- [ ] Security measures implemented
- [ ] Tests passing (80%+ coverage)
- [ ] Docker setup working
- [ ] README with setup instructions

---

**End of Specification**
