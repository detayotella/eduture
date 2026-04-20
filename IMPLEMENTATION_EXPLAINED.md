# EDUTURE 2.0 - Complete Implementation Explained
## A Detailed Technical Breakdown

---

## Table of Contents
1. [System Architecture Overview](#1-system-architecture-overview)
2. [Database Design Deep Dive](#2-database-design-deep-dive)
3. [Backend Implementation](#3-backend-implementation)
4. [Frontend Implementation](#4-frontend-implementation)
5. [RL Engine Integration](#5-rl-engine-integration)
6. [A/B Testing System](#6-ab-testing-system)
7. [Data Flow Walkthrough](#7-data-flow-walkthrough)
8. [Step-by-Step Build Guide](#8-step-by-step-build-guide)

---

## 1. System Architecture Overview

### 1.1 The Big Picture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              EDUTURE 2.0                                     │
│                    Adaptive Learning with A/B Testing                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   LEARNER JOURNEY:                                                          │
│                                                                              │
│   1. Register ──► 2. Questionnaire ──► 3. A/B Assignment ──► 4. Learn      │
│        │                │                    │                  │           │
│        ▼                ▼                    ▼                  ▼           │
│   ┌─────────┐    ┌──────────────┐    ┌─────────────┐    ┌─────────────┐    │
│   │ Create  │    │ 80 questions │    │ 50% Rule    │    │ Get content │    │
│   │ account │    │ H&M styles   │    │ 50% RL      │    │ sequence    │    │
│   └─────────┘    └──────────────┘    └─────────────┘    └─────────────┘    │
│                                                               │             │
│                                                               ▼             │
│   5. Interact ◄──────────────────────────────────────── 6. Take Test      │
│        │                                                        │          │
│        ▼                                                        ▼          │
│   ┌─────────────┐                                        ┌─────────────┐   │
│   │ System logs │                                        │ Pre/Post    │   │
│   │ & learns    │                                        │ assessments │   │
│   └─────────────┘                                        └─────────────┘   │
│                                                                              │
│   ADMIN VIEW:                                                               │
│   ┌─────────────────────────────────────────────────────────────────────┐  │
│   │ Compare: Rule-Based vs RL-Based                                     │  │
│   │ • Pass rates: 87% vs 93% (p=0.042) ✓                               │  │
│   │ • Avg scores: 78.5 vs 82.1 (p=0.038) ✓                             │  │
│   │ • Effect size: Medium (d=0.42)                                      │  │
│   └─────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Three Core Components

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        THREE PILLARS OF EDUTURE 2.0                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐        │
│   │   ADAPTATION    │    │   LEARNING      │    │   EVALUATION    │        │
│   │   ENGINE        │    │   TRACKING      │    │   FRAMEWORK     │        │
│   ├─────────────────┤    ├─────────────────┤    ├─────────────────┤        │
│   │                 │    │                 │    │                 │        │
│   │ Rule-Based:     │    │ Context:        │    │ A/B Assignment: │        │
│   │ • Predefined    │    │ • Time on task  │    │ • Random 50/50  │        │
│   │   sequences     │    │ • Error rate    │    │ • Stratified    │        │
│   │ • H&M styles    │    │ • Revisit count │    │   by style      │        │
│   │                 │    │ • Completion    │    │                 │        │
│   │ RL-Based:       │    │ • Engagement    │    │ Statistics:     │        │
│   │ • Contextual    │    │                 │    │ • t-tests       │        │
│   │   Bandit        │    │ Reward:         │    │ • p-values      │        │
│   │ • Learns from   │    │ • Completion    │    │ • Effect sizes  │        │
│   │   interactions  │    │ • Performance   │    │ • Reports       │        │
│   │                 │    │ • Engagement    │    │                 │        │
│   └─────────────────┘    └─────────────────┘    └─────────────────┘        │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Database Design Deep Dive

### 2.1 Why These Tables?

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         DATABASE TABLES EXPLAINED                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────┐                                                             │
│  │  learners   │  WHO: Stores user accounts                                  │
│  ├─────────────┤                                                             │
│  │ id          │  UUID primary key                                           │
│  │ email       │  Login identifier (unique)                                  │
│  │ password_hash│ Bcrypt hashed password                                     │
│  │ full_name   │  Display name                                               │
│  │ created_at  │  When account was created                                   │
│  └─────────────┘                                                             │
│         │                                                                    │
│         │ 1:1 relationship                                                   │
│         ▼                                                                    │
│  ┌─────────────────┐  WHAT: Stores Honey & Mumford assessment results        │
│  │ learning_styles │                                                         │
│  ├─────────────────┤                                                         │
│  │ activist_score  │  0-20 (count of "yes" answers)                          │
│  │ reflector_score │  0-20                                                   │
│  │ theorist_score  │  0-20                                                   │
│  │ pragmatist_score│  0-20                                                   │
│  │ dominant_style  │  Highest score determines this                          │
│  │ responses       │  JSON: {q1: "yes", q2: "no", ...}                       │
│  └─────────────────┘                                                         │
│         │                                                                    │
│         │ 1:1 relationship                                                   │
│         ▼                                                                    │
│  ┌──────────────────┐  WHICH: Stores A/B test group assignment               │
│  │ ab_test_assign   │                                                         │
│  ├──────────────────┤                                                         │
│  │ group_assignment │  "rule_based" OR "rl_based"                             │
│  │ stratified_by    │  Learning style used for stratification                 │
│  │ assigned_at      │  Timestamp                                              │
│  └──────────────────┘                                                         │
│                                                                              │
│  ┌──────────────────┐  CONTENT: Stores ICDL learning materials                │
│  │ content_fragments│                                                         │
│  ├──────────────────┤                                                         │
│  │ module_id        │  "icdl-computer-essentials"                             │
│  │ topic_id         │  "intro-to-computers"                                   │
│  │ content_type     │  "theory"/"example"/"activity"/"exercise"               │
│  │ sequence_order   │  Position in default sequence                           │
│  │ content_data     │  HTML/text of the content                               │
│  │ difficulty       │  0.0-1.0                                                │
│  └──────────────────┘                                                         │
│                                                                              │
│  ┌──────────────────┐  INTERACTIONS: Every learner action is logged           │
│  │ interactions     │                                                         │
│  ├──────────────────┤                                                         │
│  │ learner_id       │  Who                                                    │
│  │ content_id       │  What content                                           │
│  │ group_assigned   │  Which group they were in                               │
│  │ context_vector   │  JSON: [time, errors, revisits, ...]                    │
│  │ recommended_type │  What was recommended                                   │
│  │ reward           │  Calculated 0-1 score                                   │
│  │ completed        │  Did they finish?                                       │
│  │ quiz_score       │  Assessment score                                       │
│  │ timestamp        │  When                                                   │
│  └──────────────────┘                                                         │
│                                                                              │
│  ┌──────────────────┐  ASSESSMENTS: Pre/post test scores                      │
│  │ assessments      │                                                         │
│  ├──────────────────┤                                                         │
│  │ assessment_type  │  "pre_test" or "post_test"                              │
│  │ score            │  0-100                                                  │
│  │ responses        │  JSON: {q1: "A", q2: "B", ...}                          │
│  └──────────────────┘                                                         │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 SQL Table Creation (Explained)

```sql
-- ============================================
-- TABLE: learners
-- ============================================
-- Purpose: Store user account information
-- Why UUID? Better for distributed systems, harder to guess
-- Why UNIQUE on email? Prevents duplicate accounts

CREATE TABLE learners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,  -- Never store plain text!
    full_name VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,       -- Can disable accounts
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP                  -- Track engagement
);

-- Index on email for fast login lookups
CREATE INDEX idx_learners_email ON learners(email);

-- ============================================
-- TABLE: learning_styles
-- ============================================
-- Purpose: Store Honey & Mumford questionnaire results
-- Why separate table? Optional - some learners might not complete it
-- Why JSONB for responses? Flexible schema, can query individual answers

CREATE TABLE learning_styles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    learner_id UUID REFERENCES learners(id) ON DELETE CASCADE,
    
    -- Each style scored 0-20 (20 questions each)
    activist_score INTEGER CHECK (activist_score BETWEEN 0 AND 20),
    reflector_score INTEGER CHECK (reflector_score BETWEEN 0 AND 20),
    theorist_score INTEGER CHECK (theorist_score BETWEEN 0 AND 20),
    pragmatist_score INTEGER CHECK (pragmatist_score BETWEEN 0 AND 20),
    
    -- Highest score = dominant style
    dominant_style VARCHAR(20) CHECK (
        dominant_style IN ('activist', 'reflector', 'theorist', 'pragmatist')
    ),
    
    -- Store all responses for analysis
    questionnaire_responses JSONB,
    assessed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for analysis queries
CREATE INDEX idx_learning_styles_learner ON learning_styles(learner_id);
CREATE INDEX idx_learning_styles_dominant ON learning_styles(dominant_style);

-- ============================================
-- TABLE: ab_test_assignments
-- ============================================
-- Purpose: Track which learners are in which group
-- Why UNIQUE on learner_id? One assignment per learner
-- Why stratified_by_style? Ensures balanced groups across learning styles

CREATE TABLE ab_test_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    learner_id UUID REFERENCES learners(id) ON DELETE CASCADE,
    
    -- The two experimental conditions
    group_assignment VARCHAR(20) CHECK (
        group_assignment IN ('rule_based', 'rl_based')
    ),
    
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    stratified_by_style VARCHAR(20),  -- For balanced assignment
    
    UNIQUE(learner_id)  -- One assignment per learner
);

CREATE INDEX idx_ab_test_group ON ab_test_assignments(group_assignment);

-- ============================================
-- TABLE: content_fragments
-- ============================================
-- Purpose: Store all learning content
-- Why fragments? Can reorder them for different learners
-- Why content_type enum? Ensures data integrity

CREATE TABLE content_fragments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_id VARCHAR(50) NOT NULL,      -- "icdl-computer-essentials"
    topic_id VARCHAR(50) NOT NULL,       -- "intro-to-computers"
    
    -- Four types of content
    content_type VARCHAR(20) CHECK (
        content_type IN ('theory', 'example', 'activity', 'exercise')
    ),
    
    sequence_order INTEGER NOT NULL,     -- Default order position
    title VARCHAR(255) NOT NULL,
    content_data TEXT NOT NULL,          -- HTML/markdown content
    
    -- Metadata for adaptation
    difficulty FLOAT CHECK (difficulty BETWEEN 0 AND 1),
    estimated_time_minutes INTEGER DEFAULT 10,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for content retrieval
CREATE INDEX idx_content_module ON content_fragments(module_id);
CREATE INDEX idx_content_topic ON content_fragments(topic_id);
CREATE INDEX idx_content_type ON content_fragments(content_type);

-- ============================================
-- TABLE: interactions
-- ============================================
-- Purpose: Log every learner-content interaction
-- Why so many columns? Need context at time of recommendation
-- Why context_vector JSONB? Flexible feature engineering

CREATE TABLE interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    learner_id UUID REFERENCES learners(id) ON DELETE CASCADE,
    content_id UUID REFERENCES content_fragments(id),
    group_assigned VARCHAR(20),          -- Which group at time of interaction
    
    -- CONTEXT: Features used for recommendation
    context_time_on_task FLOAT,          -- Normalized 0-1
    context_error_rate FLOAT,            -- 0-1
    context_revisit_count FLOAT,         -- Normalized
    context_completion_rate FLOAT,       -- 0-1
    context_engagement_score FLOAT,      -- 0-1
    context_learning_style VARCHAR(20),
    context_topic_difficulty FLOAT,      -- 0-1
    context_vector JSONB,                -- Full feature vector
    
    -- RECOMMENDATION: What was suggested
    recommended_content_type VARCHAR(20),
    
    -- OUTCOME: What happened
    completed BOOLEAN DEFAULT FALSE,
    quiz_score FLOAT,                    -- 0-100
    actual_time_minutes INTEGER,
    is_revisit BOOLEAN DEFAULT FALSE,
    reward FLOAT CHECK (reward BETWEEN 0 AND 1),  -- Calculated
    
    -- ENGAGEMENT: Additional signals
    scroll_depth FLOAT,                  -- 0-1
    click_count INTEGER,
    
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Critical indexes for analysis
CREATE INDEX idx_interactions_learner ON interactions(learner_id);
CREATE INDEX idx_interactions_timestamp ON interactions(timestamp);
CREATE INDEX idx_interactions_group ON interactions(group_assigned);

-- ============================================
-- TABLE: assessments
-- ============================================
-- Purpose: Store pre-test and post-test scores
-- Why separate from interactions? Different analysis needs

CREATE TABLE assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    learner_id UUID REFERENCES learners(id) ON DELETE CASCADE,
    
    assessment_type VARCHAR(20) CHECK (
        assessment_type IN ('pre_test', 'post_test', 'quiz')
    ),
    
    module_id VARCHAR(50),
    score FLOAT CHECK (score BETWEEN 0 AND 100),
    max_score FLOAT DEFAULT 100,
    completion_time_minutes INTEGER,
    responses JSONB,                     -- Full answer data
    
    taken_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_assessments_learner ON assessments(learner_id);
CREATE INDEX idx_assessments_type ON assessments(assessment_type);
```

---

## 3. Backend Implementation

### 3.1 Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                    # FastAPI entry point
│   ├── config.py                  # Configuration settings
│   ├── database.py                # Database connection
│   ├── models.py                  # SQLAlchemy ORM models
│   ├── auth.py                    # JWT authentication
│   ├── dependencies.py            # FastAPI dependencies
│   │
│   ├── routers/                   # API route handlers
│   │   ├── __init__.py
│   │   ├── auth.py               # /auth/* endpoints
│   │   ├── learning_style.py     # /learning-style/* endpoints
│   │   ├── content.py            # /content/* endpoints
│   │   ├── interaction.py        # /interaction/* endpoints
│   │   ├── assessment.py         # /assessment/* endpoints
│   │   └── admin.py              # /admin/* endpoints
│   │
│   ├── engines/                   # Adaptation engines
│   │   ├── __init__.py
│   │   ├── rule_based.py         # Original EDUTURE algorithm
│   │   └── contextual_bandit.py  # RL engine (from provided file)
│   │
│   └── utils/                     # Helper functions
│       ├── __init__.py
│       ├── reward.py             # Reward calculation
│       └── ab_testing.py         # A/B testing (from provided file)
│
├── alembic/                       # Database migrations
│   └── versions/
│
├── tests/                         # Test files
├── requirements.txt
└── Dockerfile
```

### 3.2 Core Files Explained

#### config.py - Configuration Management

```python
"""
config.py - Application Configuration
======================================
Centralizes all configuration settings.
Uses environment variables for sensitive data.
"""

from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    """Application settings loaded from environment variables"""
    
    # Database
    DATABASE_URL: str = "postgresql://user:password@localhost/eduture_db"
    
    # Security
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    
    # A/B Testing
    DEFAULT_EXPLORATION_RATE: float = 1.0  # Alpha for LinUCB
    
    # Application
    APP_NAME: str = "EDUTURE 2.0"
    DEBUG: bool = False
    
    class Config:
        env_file = ".env"

@lru_cache()
def get_settings():
    """Cache settings to avoid reloading"""
    return Settings()
```

**Why this pattern?**
- `BaseSettings` automatically loads from `.env` file
- `lru_cache()` prevents reloading on every request
- Centralized configuration = easier maintenance

---

#### database.py - Database Connection

```python
"""
database.py - Database Connection
==================================
Sets up SQLAlchemy for database operations.
"""

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.config import get_settings

settings = get_settings()

# Create database engine
engine = create_engine(settings.DATABASE_URL)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for ORM models
Base = declarative_base()

# Dependency for FastAPI
def get_db():
    """Get database session - used as FastAPI dependency"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

**Key concepts:**
- `engine` - Connection pool to PostgreSQL
- `SessionLocal` - Factory for database sessions
- `Base` - Parent class for all ORM models
- `get_db()` - FastAPI dependency for route handlers

---

#### models.py - ORM Models

```python
"""
models.py - SQLAlchemy ORM Models
==================================
Python classes that map to database tables.
"""

from sqlalchemy import Column, String, Float, Boolean, DateTime, Integer, ForeignKey, JSON, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database import Base
import uuid
from datetime import datetime

class Learner(Base):
    """Maps to 'learners' table"""
    __tablename__ = "learners"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_login = Column(DateTime)
    
    # Relationships (one-to-one)
    learning_style = relationship("LearningStyle", back_populates="learner", uselist=False)
    ab_assignment = relationship("ABTestAssignment", back_populates="learner", uselist=False)

class LearningStyle(Base):
    """Maps to 'learning_styles' table"""
    __tablename__ = "learning_styles"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    learner_id = Column(UUID(as_uuid=True), ForeignKey("learners.id"), unique=True)
    
    activist_score = Column(Integer)
    reflector_score = Column(Integer)
    theorist_score = Column(Integer)
    pragmatist_score = Column(Integer)
    dominant_style = Column(String(20))
    questionnaire_responses = Column(JSON)
    assessed_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationship
    learner = relationship("Learner", back_populates="learning_style")

class ABTestAssignment(Base):
    """Maps to 'ab_test_assignments' table"""
    __tablename__ = "ab_test_assignments"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    learner_id = Column(UUID(as_uuid=True), ForeignKey("learners.id"), unique=True)
    group_assignment = Column(String(20))
    assigned_at = Column(DateTime, default=datetime.utcnow)
    stratified_by_style = Column(String(20))
    
    # Relationship
    learner = relationship("Learner", back_populates="ab_assignment")

class ContentFragment(Base):
    """Maps to 'content_fragments' table"""
    __tablename__ = "content_fragments"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    module_id = Column(String(50), nullable=False)
    topic_id = Column(String(50), nullable=False)
    content_type = Column(String(20), nullable=False)
    sequence_order = Column(Integer, nullable=False)
    title = Column(String(255), nullable=False)
    content_data = Column(Text, nullable=False)
    difficulty = Column(Float)
    estimated_time_minutes = Column(Integer, default=10)
    created_at = Column(DateTime, default=datetime.utcnow)

class Interaction(Base):
    """Maps to 'interactions' table"""
    __tablename__ = "interactions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    learner_id = Column(UUID(as_uuid=True), ForeignKey("learners.id"))
    content_id = Column(UUID(as_uuid=True), ForeignKey("content_fragments.id"))
    group_assigned = Column(String(20))
    
    # Context features
    context_time_on_task = Column(Float)
    context_error_rate = Column(Float)
    context_revisit_count = Column(Float)
    context_completion_rate = Column(Float)
    context_engagement_score = Column(Float)
    context_learning_style = Column(String(20))
    context_topic_difficulty = Column(Float)
    context_vector = Column(JSON)
    
    # Recommendation
    recommended_content_type = Column(String(20))
    
    # Outcome
    completed = Column(Boolean, default=False)
    quiz_score = Column(Float)
    actual_time_minutes = Column(Integer)
    is_revisit = Column(Boolean, default=False)
    reward = Column(Float)
    
    # Engagement
    scroll_depth = Column(Float)
    click_count = Column(Integer)
    
    timestamp = Column(DateTime, default=datetime.utcnow)

class Assessment(Base):
    """Maps to 'assessments' table"""
    __tablename__ = "assessments"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    learner_id = Column(UUID(as_uuid=True), ForeignKey("learners.id"))
    assessment_type = Column(String(20))
    module_id = Column(String(50))
    score = Column(Float)
    max_score = Column(Float, default=100)
    completion_time_minutes = Column(Integer)
    responses = Column(JSON)
    taken_at = Column(DateTime, default=datetime.utcnow)
```

**Why ORM?**
- Write Python code, not SQL
- Automatic type conversion
- Relationship handling
- Database agnostic (can switch to MySQL easily)

---

#### auth.py - Authentication

```python
"""
auth.py - JWT Authentication
============================
Handles user registration, login, and token validation.
"""

from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.models import Learner
from app.config import get_settings
from app.database import get_db

settings = get_settings()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Check if password matches hash"""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Hash a password"""
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: timedelta = None):
    """Create JWT token"""
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

def decode_token(token: str) -> dict:
    """Decode and validate JWT token"""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError:
        return None

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> Learner:
    """FastAPI dependency to get current user from token"""
    token = credentials.credentials
    payload = decode_token(token)
    
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials"
        )
    
    user_id = payload.get("sub")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )
    
    user = db.query(Learner).filter(Learner.id == user_id).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    
    return user

async def get_current_active_user(current_user: Learner = Depends(get_current_user)):
    """Ensure user is active"""
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user
```

**Authentication flow:**
1. User registers → password hashed with bcrypt
2. User logs in → verify password → create JWT token
3. User makes request → send token in header
4. Server validates token → extract user ID → fetch user

---

#### main.py - FastAPI Application

```python
"""
main.py - FastAPI Application Entry Point
==========================================
Sets up the FastAPI app and includes all routers.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routers import auth, learning_style, content, interaction, assessment, admin

# Create database tables
Base.metadata.create_all(bind=engine)

# Create FastAPI app
app = FastAPI(
    title="EDUTURE 2.0 API",
    description="Adaptive Learning System with A/B Testing",
    version="2.0.0"
)

# Enable CORS (for frontend to call backend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(learning_style.router, prefix="/learning-style", tags=["Learning Style"])
app.include_router(content.router, prefix="/content", tags=["Content"])
app.include_router(interaction.router, prefix="/interaction", tags=["Interaction"])
app.include_router(assessment.router, prefix="/assessment", tags=["Assessment"])
app.include_router(admin.router, prefix="/admin", tags=["Admin"])

@app.get("/")
def root():
    return {"message": "EDUTURE 2.0 API is running", "version": "2.0.0"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}
```

---

### 3.3 Router Examples

#### content.py - Content Delivery Router

```python
"""
content.py - Content Delivery Routes
=====================================
Handles content recommendations and delivery.
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from uuid import UUID

from app.database import get_db
from app.auth import get_current_active_user
from app.models import Learner, ContentFragment, Interaction, ABTestAssignment, LearningStyle
from app.engines.contextual_bandit_implementation import AdaptiveEngine, LearnerState
from app.utils.reward import RewardCalculator

router = APIRouter()

# Initialize engines (singleton pattern)
rule_engine = AdaptiveEngine(mode='rule')
rl_engine = AdaptiveEngine(mode='rl', alpha=1.0)

@router.get("/modules")
def get_modules(
    current_user: Learner = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get all available modules with progress"""
    # Get unique modules from content fragments
    modules = db.query(
        ContentFragment.module_id
    ).distinct().all()
    
    result = []
    for (module_id,) in modules:
        # Get topics in this module
        topics = db.query(
            ContentFragment.topic_id
        ).filter(
            ContentFragment.module_id == module_id
        ).distinct().all()
        
        # Calculate progress for each topic
        topic_data = []
        for (topic_id,) in topics:
            total = db.query(ContentFragment).filter(
                ContentFragment.topic_id == topic_id
            ).count()
            
            completed = db.query(Interaction).filter(
                Interaction.learner_id == current_user.id,
                Interaction.content_id.in_(
                    db.query(ContentFragment.id).filter(
                        ContentFragment.topic_id == topic_id
                    )
                ),
                Interaction.completed == True
            ).count()
            
            topic_data.append({
                "id": topic_id,
                "progress": completed / total if total > 0 else 0,
                "completed_items": completed,
                "total_items": total
            })
        
        result.append({
            "id": module_id,
            "topics": topic_data
        })
    
    return {"success": True, "data": {"modules": result}}

@router.get("/recommend")
def get_recommendation(
    topic_id: str = Query(..., description="Topic ID"),
    current_user: Learner = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get next content recommendation for learner.
    Uses either rule-based or RL-based engine depending on A/B assignment.
    """
    
    # 1. Get learner's A/B group assignment
    assignment = db.query(ABTestAssignment).filter(
        ABTestAssignment.learner_id == current_user.id
    ).first()
    
    if not assignment:
        raise HTTPException(status_code=400, detail="Learning style assessment required")
    
    group = assignment.group_assignment
    
    # 2. Get learner's learning style
    learning_style = db.query(LearningStyle).filter(
        LearningStyle.learner_id == current_user.id
    ).first()
    
    if not learning_style:
        raise HTTPException(status_code=400, detail="Learning style not found")
    
    # 3. Build learner state (context for RL)
    state = build_learner_state(current_user.id, topic_id, db)
    
    # 4. Select engine based on group
    if group == 'rule_based':
        engine = rule_engine
        content_type = engine.get_next_content(state)
        mode = "rule_based"
    else:
        engine = rl_engine
        content_type = engine.get_next_content(state)
        mode = "rl_based"
    
    # 5. Get actual content fragment
    # Find content of this type in this topic that hasn't been completed
    completed_ids = [
        i.content_id for i in db.query(Interaction).filter(
            Interaction.learner_id == current_user.id,
            Interaction.completed == True
        ).all()
    ]
    
    content = db.query(ContentFragment).filter(
        ContentFragment.topic_id == topic_id,
        ContentFragment.content_type == content_type,
        ~ContentFragment.id.in_(completed_ids) if completed_ids else True
    ).order_by(ContentFragment.sequence_order).first()
    
    if not content:
        # Topic completed or no content of this type
        return {
            "success": True,
            "data": {
                "recommendation": None,
                "message": "No more content available for this topic",
                "topic_completed": True
            }
        }
    
    # 6. Calculate progress
    total_in_topic = db.query(ContentFragment).filter(
        ContentFragment.topic_id == topic_id
    ).count()
    
    completed_in_topic = db.query(Interaction).filter(
        Interaction.learner_id == current_user.id,
        Interaction.content_id.in_(
            db.query(ContentFragment.id).filter(
                ContentFragment.topic_id == topic_id
            )
        ),
        Interaction.completed == True
    ).count()
    
    # 7. Return recommendation
    return {
        "success": True,
        "data": {
            "recommendation": {
                "content_id": str(content.id),
                "content_type": content.content_type,
                "title": content.title,
                "sequence_number": content.sequence_order,
                "estimated_time": content.estimated_time_minutes,
                "adaptation_mode": mode,
                "content": content.content_data
            },
            "progress": {
                "topic_completed": completed_in_topic / total_in_topic if total_in_topic > 0 else 0,
                "items_completed": completed_in_topic,
                "items_total": total_in_topic
            }
        }
    }

def build_learner_state(learner_id: UUID, topic_id: str, db: Session) -> LearnerState:
    """
    Build learner state from database records.
    This creates the context vector for RL recommendations.
    """
    
    # Get recent interactions for this learner
    recent_interactions = db.query(Interaction).filter(
        Interaction.learner_id == learner_id
    ).order_by(Interaction.timestamp.desc()).limit(10).all()
    
    # Calculate features
    if recent_interactions:
        avg_time = sum(i.actual_time_minutes or 0 for i in recent_interactions) / len(recent_interactions)
        max_time = max((i.actual_time_minutes or 0) for i in recent_interactions)
        time_on_task = avg_time / max_time if max_time > 0 else 0.5
        
        quiz_scores = [i.quiz_score for i in recent_interactions if i.quiz_score is not None]
        error_rate = 1 - (sum(quiz_scores) / len(quiz_scores) / 100) if quiz_scores else 0.2
        
        revisit_count = sum(1 for i in recent_interactions if i.is_revisit) / len(recent_interactions)
        
        engagement_scores = [i.context_engagement_score or 0.5 for i in recent_interactions]
        engagement_score = sum(engagement_scores) / len(engagement_scores)
    else:
        # Default values for new learners
        time_on_task = 0.5
        error_rate = 0.2
        revisit_count = 0.0
        engagement_score = 0.5
    
    # Get completion rate for this topic
    total_in_topic = db.query(ContentFragment).filter(
        ContentFragment.topic_id == topic_id
    ).count()
    
    completed_in_topic = db.query(Interaction).filter(
        Interaction.learner_id == learner_id,
        Interaction.completed == True,
        Interaction.content_id.in_(
            db.query(ContentFragment.id).filter(
                ContentFragment.topic_id == topic_id
            )
        )
    ).count()
    
    completion_rate = completed_in_topic / total_in_topic if total_in_topic > 0 else 0
    
    # Get learning style
    learning_style = db.query(LearningStyle).filter(
        LearningStyle.learner_id == learner_id
    ).first()
    
    style = learning_style.dominant_style if learning_style else 'activist'
    
    # Get topic difficulty (average of content difficulties)
    contents = db.query(ContentFragment).filter(
        ContentFragment.topic_id == topic_id
    ).all()
    
    topic_difficulty = sum(c.difficulty or 0.5 for c in contents) / len(contents) if contents else 0.5
    
    return LearnerState(
        learner_id=str(learner_id),
        time_on_task=min(1.0, time_on_task),
        error_rate=min(1.0, error_rate),
        revisit_count=min(1.0, revisit_count),
        completion_rate=completion_rate,
        engagement_score=engagement_score,
        learning_style=style,
        topic_difficulty=topic_difficulty
    )

@router.get("/{content_id}")
def get_content(
    content_id: UUID,
    current_user: Learner = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get specific content by ID"""
    content = db.query(ContentFragment).filter(ContentFragment.id == content_id).first()
    
    if not content:
        raise HTTPException(status_code=404, detail="Content not found")
    
    return {
        "success": True,
        "data": {
            "id": str(content.id),
            "title": content.title,
            "type": content.content_type,
            "content": content.content_data,
            "estimated_time": content.estimated_time_minutes,
            "difficulty": content.difficulty
        }
    }
```

---

## 4. Frontend Implementation

### 4.1 React Project Structure

```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── components/          # Reusable components
│   │   ├── Layout.jsx       # App layout with navigation
│   │   ├── QuestionnaireForm.jsx
│   │   ├── ContentViewer.jsx
│   │   ├── ProgressBar.jsx
│   │   └── StatsCard.jsx
│   │
│   ├── pages/               # Page components
│   │   ├── LoginPage.jsx
│   │   ├── RegisterPage.jsx
│   │   ├── QuestionnairePage.jsx
│   │   ├── DashboardPage.jsx
│   │   ├── LearningPage.jsx
│   │   ├── AssessmentPage.jsx
│   │   ├── ProgressPage.jsx
│   │   └── AdminPage.jsx
│   │
│   ├── context/             # React context for state
│   │   └── AuthContext.jsx
│   │
│   ├── hooks/               # Custom hooks
│   │   ├── useAuth.js
│   │   └── useApi.js
│   │
│   ├── services/            # API calls
│   │   └── api.js
│   │
│   ├── App.jsx              # Main app component
│   ├── index.js             # Entry point
│   └── index.css            # Global styles
│
├── package.json
├── tailwind.config.js
└── Dockerfile
```

### 4.2 Key Components Explained

#### AuthContext.jsx - Global Authentication State

```jsx
// context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored token on mount
    const token = localStorage.getItem('token');
    if (token) {
      fetchUser(token);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async (token) => {
    try {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const response = await api.get('/auth/me');
      setUser(response.data.data);
    } catch (error) {
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const { token, ...userData } = response.data.data;
    localStorage.setItem('token', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(userData);
    return userData;
  };

  const register = async (email, password, fullName) => {
    const response = await api.post('/auth/register', {
      email,
      password,
      full_name: fullName
    });
    const { token, ...userData } = response.data.data;
    localStorage.setItem('token', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
```

**Why context?**
- Global auth state accessible anywhere
- Automatic token management
- Persistent login across page refreshes

---

#### QuestionnairePage.jsx - Learning Style Assessment

```jsx
// pages/QuestionnairePage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const QuestionnairePage = () => {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const response = await api.get('/learning-style/questionnaire');
      setQuestions(response.data.data.questions);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch questions:', error);
    }
  };

  const handleAnswer = (questionId, answer) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmit = async () => {
    // Validate all questions answered
    if (Object.keys(answers).length < questions.length) {
      alert('Please answer all questions');
      return;
    }

    setSubmitting(true);
    try {
      const responses = Object.entries(answers).map(([id, answer]) => ({
        question_id: parseInt(id),
        answer: answer
      }));

      const response = await api.post('/learning-style/submit', { responses });
      
      alert(`Your learning style: ${response.data.data.dominant_style}`);
      navigate('/dashboard');
    } catch (error) {
      console.error('Failed to submit:', error);
      alert('Failed to submit questionnaire');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-8">Loading questions...</div>;

  return (
    <div className="max-w-3xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-4">Learning Style Assessment</h1>
      <p className="text-gray-600 mb-8">
        Answer Yes or No to each statement. This helps us personalize your learning experience.
      </p>

      {/* Progress bar */}
      <div className="mb-8">
        <div className="bg-gray-200 rounded-full h-4">
          <div 
            className="bg-blue-500 rounded-full h-4 transition-all"
            style={{ width: `${(Object.keys(answers).length / questions.length) * 100}%` }}
          />
        </div>
        <p className="text-sm text-gray-600 mt-2">
          {Object.keys(answers).length} of {questions.length} answered
        </p>
      </div>

      {/* Questions */}
      <div className="space-y-6">
        {questions.map((q, index) => (
          <div key={q.id} className="bg-white p-6 rounded-lg shadow">
            <p className="font-medium mb-4">
              {index + 1}. {q.text}
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => handleAnswer(q.id, 'yes')}
                className={`px-6 py-2 rounded ${
                  answers[q.id] === 'yes'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                Yes
              </button>
              <button
                onClick={() => handleAnswer(q.id, 'no')}
                className={`px-6 py-2 rounded ${
                  answers[q.id] === 'no'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                No
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Submit button */}
      <button
        onClick={handleSubmit}
        disabled={submitting}
        className="mt-8 w-full bg-green-500 text-white py-3 rounded-lg font-medium hover:bg-green-600 disabled:bg-gray-400"
      >
        {submitting ? 'Submitting...' : 'Submit Assessment'}
      </button>
    </div>
  );
};

export default QuestionnairePage;
```

---

#### LearningPage.jsx - Content Viewer

```jsx
// pages/LearningPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

const LearningPage = () => {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [startTime, setStartTime] = useState(null);

  useEffect(() => {
    fetchRecommendation();
    setStartTime(Date.now());
  }, [topicId]);

  const fetchRecommendation = async () => {
    try {
      const response = await api.get(`/content/recommend?topic_id=${topicId}`);
      setContent(response.data.data.recommendation);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch content:', error);
    }
  };

  const handleComplete = async (quizScore = null) => {
    const endTime = Date.now();
    const actualTime = Math.round((endTime - startTime) / 60000); // Convert to minutes

    try {
      await api.post('/interaction/record', {
        content_id: content.content_id,
        completed: true,
        quiz_score: quizScore,
        actual_time_minutes: actualTime,
        is_revisit: false,
        engagement_signals: {
          scroll_depth: 1.0,  // In real app, track this
          click_count: 10     // In real app, track this
        }
      });

      // Fetch next recommendation
      fetchRecommendation();
    } catch (error) {
      console.error('Failed to record interaction:', error);
    }
  };

  if (loading) return <div className="p-8">Loading content...</div>;
  
  if (!content) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Topic Completed!</h2>
        <p className="text-gray-600 mb-4">You've finished all content in this topic.</p>
        <button
          onClick={() => navigate('/dashboard')}
          className="bg-blue-500 text-white px-6 py-2 rounded"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className={`px-3 py-1 rounded text-sm ${
            content.adaptation_mode === 'rl_based'
              ? 'bg-purple-100 text-purple-700'
              : 'bg-blue-100 text-blue-700'
          }`}>
            {content.adaptation_mode === 'rl_based' ? 'AI-Powered' : 'Standard'} Adaptation
          </span>
          <span className="px-3 py-1 bg-gray-100 rounded text-sm capitalize">
            {content.content_type}
          </span>
        </div>
        <h1 className="text-3xl font-bold">{content.title}</h1>
        <p className="text-gray-600 mt-2">
          Estimated time: {content.estimated_time} minutes
        </p>
      </div>

      {/* Content */}
      <div 
        className="bg-white p-8 rounded-lg shadow mb-8 prose max-w-none"
        dangerouslySetInnerHTML={{ __html: content.content }}
      />

      {/* Completion button */}
      <div className="flex justify-between">
        <button
          onClick={() => navigate('/dashboard')}
          className="px-6 py-2 border rounded hover:bg-gray-50"
        >
          Save & Exit
        </button>
        <button
          onClick={() => handleComplete()}
          className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Mark as Complete
        </button>
      </div>
    </div>
  );
};

export default LearningPage;
```

---

## 5. RL Engine Integration

### 5.1 How the Contextual Bandit Works

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    CONTEXTUAL BANDIT ALGORITHM EXPLAINED                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   WHAT IS A CONTEXTUAL BANDIT?                                              │
│   ─────────────────────────────                                             │
│   Imagine a slot machine with 4 arms:                                        │
│   • Arm 1: Theory content                                                    │
│   • Arm 2: Example content                                                   │
│   • Arm 3: Activity content                                                  │
│   • Arm 4: Exercise content                                                  │
│                                                                              │
│   Each learner pulls an arm (gets content), and we observe the reward.      │
│   The "contextual" part: which arm is best DEPENDS on the learner's state.  │
│                                                                              │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                    LEARNER STATE (CONTEXT)                           │   │
│   │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │   │
│   │  │Time on   │ │ Error    │ │ Revisit  │ │Completion│ │Engagement│  │   │
│   │  │Task      │ │ Rate     │ │ Count    │ │ Rate     │ │ Score    │  │   │
│   │  │  0.5     │ │  0.2     │ │  0.1     │ │  0.3     │ │  0.7     │  │   │
│   │  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘  │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                         │
│                                    ▼                                         │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                    BANDIT DECISION                                   │   │
│   │                                                                      │   │
│   │   Context + History → Predict reward for each arm                    │   │
│   │                                                                      │   │
│   │   Theory:    0.65 ←── Select this one (highest)                      │   │
│   │   Example:   0.58                                                    │   │
│   │   Activity:  0.72 ←── Actually this one!                             │   │
│   │   Exercise:  0.45                                                    │   │
│   │                                                                      │   │
│   │   (With 20% probability, explore randomly instead)                   │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                         │
│                                    ▼                                         │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                    OBSERVE REWARD                                    │   │
│   │                                                                      │   │
│   │   Learner completes activity → Reward = 0.85                         │   │
│   │                                                                      │   │
│   │   UPDATE: "For learners like this, Activity works well"              │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│   OVER TIME: The bandit learns which content types work best for which      │
│   types of learners, PERSONALIZING beyond just learning styles.             │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 5.2 Integration in the Backend

```python
# From contextual_bandit_implementation.py (provided)

class LinUCB:
    """
    Linear Upper Confidence Bound Algorithm
    
    Key insight: Model reward as linear function of context
    reward = θ · context + confidence_bound
    
    θ is learned from observed (context, action, reward) triples
    """
    
    def __init__(self, n_features: int, alpha: float = 1.0):
        """
        Args:
            n_features: Dimension of context vector (10 in our case)
            alpha: Exploration parameter (higher = more exploration)
        """
        self.n_features = n_features
        self.alpha = alpha  # Controls exploration vs exploitation
        
        # One model per arm (content type)
        self.arms = ['theory', 'example', 'activity', 'exercise']
        
        # A and b are sufficient statistics for linear regression
        # A = X^T X (covariance matrix)
        # b = X^T y (correlation vector)
        self.A = {arm: np.eye(n_features) for arm in self.arms}
        self.b = {arm: np.zeros(n_features) for arm in self.arms}
    
    def select_arm(self, context: np.ndarray) -> str:
        """
        Select best arm using Upper Confidence Bound
        
        UCB = predicted_reward + confidence_interval
        
        This balances:
        - Exploitation: Choose arms with high predicted reward
        - Exploration: Choose arms with high uncertainty (large CI)
        """
        p = {}  # UCB scores for each arm
        
        for arm in self.arms:
            # Compute theta (estimated coefficients)
            # θ = A^(-1) b
            A_inv = np.linalg.inv(self.A[arm])
            theta = A_inv @ self.b[arm]
            
            # Predicted reward
            predicted_reward = theta @ context
            
            # Confidence interval (uncertainty)
            # Higher when we've seen less data for this arm
            confidence_interval = self.alpha * np.sqrt(context @ A_inv @ context)
            
            # Upper confidence bound
            p[arm] = predicted_reward + confidence_interval
        
        # Select arm with highest UCB
        return max(p, key=p.get)
    
    def update(self, arm: str, context: np.ndarray, reward: float):
        """
        Update model after observing reward
        
        Uses online linear regression update:
        A_new = A_old + context · context^T
        b_new = b_old + reward · context
        """
        self.A[arm] += np.outer(context, context)
        self.b[arm] += reward * context
```

### 5.3 How It Integrates

```python
# In your backend (content.py router)

from app.engines.contextual_bandit_implementation import AdaptiveEngine, LearnerState

# Initialize engines once (singleton)
rule_engine = AdaptiveEngine(mode='rule')
rl_engine = AdaptiveEngine(mode='rl', alpha=1.0)

@router.get("/recommend")
def get_recommendation(topic_id: str, current_user: Learner, db: Session):
    
    # 1. Get A/B group
    group = get_user_group(current_user.id, db)
    
    # 2. Build learner state (context vector)
    state = LearnerState(
        learner_id=str(current_user.id),
        time_on_task=0.5,      # From recent interactions
        error_rate=0.2,        # From quiz scores
        revisit_count=0.1,     # From interaction history
        completion_rate=0.3,   # Progress in current topic
        engagement_score=0.7,  # From scroll depth, clicks
        learning_style='activist',
        topic_difficulty=0.5
    )
    
    # 3. Select engine and get recommendation
    if group == 'rule_based':
        content_type = rule_engine.get_next_content(state)
    else:
        content_type = rl_engine.get_next_content(state)
    
    # 4. Fetch actual content from database
    content = get_content_by_type(topic_id, content_type, db)
    
    return content

@router.post("/interaction")
def record_interaction(data: InteractionData, current_user: Learner, db: Session):
    
    # 1. Calculate reward
    reward = RewardCalculator.calculate({
        'completed': data.completed,
        'quiz_score': data.quiz_score,
        'expected_time': data.expected_time,
        'actual_time': data.actual_time,
        'is_revisit': data.is_revisit
    })
    
    # 2. Store in database
    store_interaction(current_user.id, data, reward, db)
    
    # 3. Update RL engine (only for RL group)
    group = get_user_group(current_user.id, db)
    if group == 'rl_based':
        state = build_learner_state(current_user.id, data.topic_id, db)
        rl_engine.record_interaction(state, data.content_type, reward)
    
    return {"reward": reward}
```

---

## 6. A/B Testing System

### 6.1 Random Assignment

```python
# From ab_testing_framework.py (provided)

class ABTestManager:
    """
    Manages random assignment of learners to control/treatment groups
    
    Uses stratified randomization to ensure balanced groups
    across learning styles.
    """
    
    def assign_learner(self, learner_id: str, learning_style: str) -> str:
        """
        Assign learner to group with stratification
        
        Stratification ensures we have equal numbers of each
        learning style in both groups (prevents bias).
        """
        # Check if already assigned
        existing = self.get_assignment(learner_id)
        if existing:
            return existing
        
        # Count current assignments for this learning style
        rule_count = count_by_style(learning_style, 'rule_based')
        rl_count = count_by_style(learning_style, 'rl_based')
        
        # Assign to balance groups
        if rule_count <= rl_count:
            group = 'rule_based'
        else:
            group = 'rl_based'
        
        # Record assignment
        save_assignment(learner_id, group, learning_style)
        
        return group
```

### 6.2 Statistical Comparison

```python
class StatisticalAnalyzer:
    """
    Performs statistical tests to compare groups
    """
    
    @staticmethod
    def two_sample_t_test(group1: List[float], group2: List[float]) -> Dict:
        """
        Compare means of two groups
        
        Null hypothesis: Both groups have same mean
        If p < 0.05, reject null (groups are different)
        """
        from scipy import stats
        
        t_stat, p_value = stats.ttest_ind(group1, group2)
        
        # Effect size (Cohen's d)
        # Small: 0.2, Medium: 0.5, Large: 0.8
        pooled_std = np.sqrt((np.std(group1)**2 + np.std(group2)**2) / 2)
        cohens_d = (np.mean(group1) - np.mean(group2)) / pooled_std
        
        return {
            't_statistic': t_stat,
            'p_value': p_value,
            'significant': p_value < 0.05,
            'cohens_d': cohens_d,
            'effect_size': interpret_effect_size(cohens_d)
        }
```

### 6.3 Example Results

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         A/B TEST RESULTS                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Sample Sizes:                                                               │
│  • Control (Rule-Based):  30 learners                                        │
│  • Treatment (RL-Based):  30 learners                                        │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ METRIC              │ CONTROL │ TREATMENT │ P-VALUE  │ SIGNIFICANT │    │
│  ├─────────────────────────────────────────────────────────────────────┤    │
│  │ Pass Rate (≥75%)    │  87%    │   93%     │  0.042   │     ✓       │    │
│  │ Post-Test Score     │  78.5   │   82.1    │  0.038   │     ✓       │    │
│  │ Learning Improvement│  33.2   │   37.8    │  0.045   │     ✓       │    │
│  │ Completion Time     │  48.2   │   44.1    │  0.067   │     ✗       │    │
│  │ Satisfaction (1-5)  │  3.9    │   4.2     │  0.089   │     ✗       │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  Effect Sizes:                                                               │
│  • Pass Rate: Medium (d = 0.38)                                              │
│  • Post-Test: Medium (d = 0.42)                                              │
│  • Improvement: Medium (d = 0.39)                                            │
│                                                                              │
│  CONCLUSION: The RL-based approach shows statistically significant          │
│  improvements in learning outcomes compared to rule-based adaptation.       │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 7. Data Flow Walkthrough

### 7.1 Complete User Journey

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    COMPLETE DATA FLOW: USER JOURNEY                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  STEP 1: REGISTRATION                                                        │
│  ───────────────────                                                         │
│  Frontend: POST /auth/register                                               │
│  │                                                                           │
│  Backend: Create learner record in 'learners' table                          │
│  │  id: uuid, email: "student@example.com", password_hash: "..."            │
│  │                                                                           │
│  Response: JWT token + learner_id                                            │
│                                                                              │
│  STEP 2: QUESTIONNAIRE                                                       │
│  ─────────────────────                                                       │
│  Frontend: GET /learning-style/questionnaire                                 │
│  │                                                                           │
│  Backend: Return 80 questions from hardcoded list                            │
│  │                                                                           │
│  Frontend: User answers all 80 (Yes/No)                                      │
│  │                                                                           │
│  Frontend: POST /learning-style/submit                                       │
│  │  {responses: [{q1: "yes"}, {q2: "no"}, ...]}                              │
│  │                                                                           │
│  Backend:                                                                    │
│  │  1. Count scores per style (20 questions each)                           │
│  │  2. Determine dominant style (highest score)                             │
│  │  3. Save to 'learning_styles' table                                      │
│  │  4. Assign to A/B group (50/50 random, stratified)                       │
│  │  5. Save to 'ab_test_assignments' table                                  │
│  │                                                                           │
│  Response: {dominant_style: "activist", group_assignment: "rl_based"}        │
│                                                                              │
│  STEP 3: GET RECOMMENDATION                                                  │
│  ──────────────────────────                                                  │
│  Frontend: GET /content/recommend?topic_id=intro-to-computers                │
│  │                                                                           │
│  Backend:                                                                    │
│  │  1. Get A/B group from 'ab_test_assignments'                             │
│  │  2. Get learning style from 'learning_styles'                            │
│  │  3. Build learner state (context vector):                                │
│  │     - Query recent interactions from 'interactions' table                │
│  │     - Calculate: time_on_task, error_rate, etc.                          │
│  │  4. Select engine based on group:                                        │
│  │     - If 'rule_based': Use predefined sequence                           │
│  │     - If 'rl_based': Use Contextual Bandit                               │
│  │  5. Get content type recommendation                                      │
│  │  6. Query 'content_fragments' for actual content                         │
│  │  7. Return content + adaptation_mode                                     │
│  │                                                                           │
│  Response: {content_id, content_type, title, content_data, mode}             │
│                                                                              │
│  STEP 4: LEARNER INTERACTS                                                   │
│  ─────────────────────────                                                   │
│  Frontend: Display content to learner                                        │
│  │                                                                           │
│  Frontend: Track engagement (scroll depth, clicks)                           │
│  │                                                                           │
│  Frontend: User completes content, takes quiz                                │
│  │                                                                           │
│  Frontend: POST /interaction/record                                          │
│  │  {content_id, completed: true, quiz_score: 85, ...}                      │
│  │                                                                           │
│  Backend:                                                                    │
│  │  1. Calculate reward using RewardCalculator                              │
│  │     reward = completion*0.35 + performance*0.35 + ...                     │
│  │  2. Save to 'interactions' table with context vector                     │
│  │  3. If RL group: Update Contextual Bandit model                          │
│  │     bandit.update(arm, context, reward)                                  │
│  │                                                                           │
│  Response: {reward: 0.82, next_recommendation: {...}}                        │
│                                                                              │
│  STEP 5: POST-TEST                                                           │
│  ────────────────                                                            │
│  Frontend: POST /assessment/post-test                                        │
│  │  {responses: [...], completion_time: 25}                                 │
│  │                                                                           │
│  Backend:                                                                    │
│  │  1. Calculate score (e.g., 15/18 correct = 83.3%)                        │
│  │  2. Save to 'assessments' table                                          │
│  │  3. Compare to ICDL threshold (75%)                                      │
│  │                                                                           │
│  Response: {score: 83.3, passed: true, threshold: 75}                        │
│                                                                              │
│  STEP 6: ADMIN ANALYSIS                                                      │
│  ─────────────────────                                                       │
│  Admin: GET /admin/stats                                                     │
│  │                                                                           │
│  Backend:                                                                    │
│  │  1. Query 'assessments' for pass rates by group                          │
│  │  2. Query 'interactions' for engagement metrics                          │
│  │  3. Run statistical tests (t-test, chi-square)                           │
│  │  4. Calculate effect sizes (Cohen's d)                                   │
│  │                                                                           │
│  Response: Comparison table with p-values and significance                   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 8. Step-by-Step Build Guide

### Week 1: Foundation

#### Day 1-2: Setup & Database
```bash
# 1. Create project structure
mkdir eduture-rl && cd eduture-rl
mkdir -p backend/app/routers backend/app/engines backend/app/utils
mkdir -p frontend/src/{components,pages,context,hooks,services}

# 2. Setup Python environment
cd backend
python -m venv venv
source venv/bin/activate
pip install fastapi uvicorn sqlalchemy psycopg2-binary pydantic pyjwt passlib numpy scipy

# 3. Create database
docker run -d --name eduture-db \
  -e POSTGRES_USER=eduture \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=eduture_db \
  -p 5432:5432 postgres:15

# 4. Create tables (run SQL from section 2.2)
```

#### Day 3-4: Backend Core
- Create `config.py`, `database.py`, `models.py`
- Implement `auth.py` with JWT
- Create `main.py` with router structure

#### Day 5-7: Auth & Questionnaire
- Implement `/auth/register` and `/auth/login`
- Create 80-question Honey & Mumford list
- Implement `/learning-style/questionnaire` and `/learning-style/submit`
- Add A/B assignment logic

### Week 2: Content Delivery

#### Day 8-10: Content System
- Create `content_fragments` table with sample ICDL content
- Implement `/content/modules` and `/content/recommend`
- Implement rule-based adaptation engine

#### Day 11-12: Interaction Logging
- Create `/interaction/record` endpoint
- Implement `RewardCalculator`
- Test reward calculation

#### Day 13-14: Frontend Setup
```bash
cd frontend
npx create-react-app .
npm install axios react-router-dom recharts tailwindcss
```
- Create `AuthContext`
- Build Login and Register pages

### Week 3: RL Engine & Frontend

#### Day 15-17: RL Integration
- Copy `contextual_bandit_implementation.py` to `engines/`
- Integrate into `/content/recommend`
- Test that RL engine updates after interactions

#### Day 18-19: Frontend Pages
- Build Questionnaire page
- Build Dashboard page
- Build Learning page with content viewer

#### Day 20-21: Assessment System
- Create pre-test and post-test questions
- Implement `/assessment/pre-test` and `/assessment/post-test`
- Build assessment UI

### Week 4: A/B Testing & Polish

#### Day 22-24: A/B Testing
- Copy `ab_testing_framework.py` to `utils/`
- Create `/admin/stats` endpoint
- Build admin dashboard with charts

#### Day 25-26: Testing
- Test A/B assignment balance (should be 50/50)
- Test RL engine learning
- Test statistical calculations

#### Day 27-28: Documentation & Deployment
- Write README
- Create Docker configuration
- Deploy to cloud (optional)

---

## Summary

You now have a complete understanding of:

1. **Database Design** - 6 tables with relationships
2. **Backend Architecture** - FastAPI with routers, models, engines
3. **Frontend Structure** - React with context and hooks
4. **RL Integration** - Contextual Bandit algorithm
5. **A/B Testing** - Random assignment + statistical comparison
6. **Data Flow** - Complete user journey
7. **Build Process** - 4-week timeline

**Next step:** Start with Week 1, Day 1 (setup & database)!

---

*This is a comprehensive guide. Take it one step at a time, and you'll have a working system in 4 weeks.*
