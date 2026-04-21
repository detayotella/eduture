from __future__ import annotations

from datetime import datetime
from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, JSON, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .database import Base


class Learner(Base):
    __tablename__ = "learners"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str] = mapped_column(String(100), nullable=False)
    avatar_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_admin: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    last_login: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    learning_style = relationship("LearningStyle", back_populates="learner", uselist=False)
    assignment = relationship("ABTestAssignment", back_populates="learner", uselist=False)


class LearningStyle(Base):
    __tablename__ = "learning_styles"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    learner_id: Mapped[int] = mapped_column(ForeignKey("learners.id", ondelete="CASCADE"), unique=True, index=True)
    activist_score: Mapped[int] = mapped_column(Integer, default=0)
    reflector_score: Mapped[int] = mapped_column(Integer, default=0)
    theorist_score: Mapped[int] = mapped_column(Integer, default=0)
    pragmatist_score: Mapped[int] = mapped_column(Integer, default=0)
    dominant_style: Mapped[str] = mapped_column(String(20), default="activist", index=True)
    questionnaire_responses: Mapped[dict] = mapped_column(JSON, default=dict)
    assessed_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    learner = relationship("Learner", back_populates="learning_style")


class ABTestAssignment(Base):
    __tablename__ = "ab_test_assignments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    learner_id: Mapped[int] = mapped_column(ForeignKey("learners.id", ondelete="CASCADE"), unique=True, index=True)
    group_assignment: Mapped[str] = mapped_column(String(20), nullable=False, index=True)
    assigned_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    stratified_by_style: Mapped[str | None] = mapped_column(String(20), nullable=True, index=True)

    learner = relationship("Learner", back_populates="assignment")


class ContentFragment(Base):
    __tablename__ = "content_fragments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    module_id: Mapped[str] = mapped_column(String(50), index=True, nullable=False)
    topic_id: Mapped[str] = mapped_column(String(50), index=True, nullable=False)
    content_type: Mapped[str] = mapped_column(String(20), index=True, nullable=False)
    sequence_order: Mapped[int] = mapped_column(Integer, nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    content_data: Mapped[str] = mapped_column(Text, nullable=False)
    difficulty: Mapped[float] = mapped_column(Float, default=0.5, index=True)
    estimated_time_minutes: Mapped[int] = mapped_column(Integer, default=10)
    prerequisites: Mapped[dict] = mapped_column(JSON, default=list)
    tags: Mapped[dict] = mapped_column(JSON, default=list)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)


class Interaction(Base):
    __tablename__ = "interactions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    learner_id: Mapped[int] = mapped_column(ForeignKey("learners.id", ondelete="CASCADE"), index=True)
    content_id: Mapped[int] = mapped_column(ForeignKey("content_fragments.id"), index=True)
    group_assigned: Mapped[str] = mapped_column(String(20), index=True)
    context_time_on_task: Mapped[float] = mapped_column(Float)
    context_error_rate: Mapped[float] = mapped_column(Float)
    context_revisit_count: Mapped[float] = mapped_column(Float)
    context_completion_rate: Mapped[float] = mapped_column(Float)
    context_engagement_score: Mapped[float] = mapped_column(Float)
    context_learning_style: Mapped[str] = mapped_column(String(20))
    context_topic_difficulty: Mapped[float] = mapped_column(Float)
    recommended_content_type: Mapped[str] = mapped_column(String(20))
    completed: Mapped[bool] = mapped_column(Boolean, default=False)
    quiz_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    actual_time_minutes: Mapped[int | None] = mapped_column(Integer, nullable=True)
    is_revisit: Mapped[bool] = mapped_column(Boolean, default=False)
    reward: Mapped[float] = mapped_column(Float, default=0.0)
    scroll_depth: Mapped[float | None] = mapped_column(Float, nullable=True)
    click_count: Mapped[int | None] = mapped_column(Integer, nullable=True)
    timestamp: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    ip_address: Mapped[str | None] = mapped_column(String(50), nullable=True)
    user_agent: Mapped[str | None] = mapped_column(Text, nullable=True)


class Assessment(Base):
    __tablename__ = "assessments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    learner_id: Mapped[int] = mapped_column(ForeignKey("learners.id", ondelete="CASCADE"), index=True)
    content_id: Mapped[int | None] = mapped_column(ForeignKey("content_fragments.id"), nullable=True)
    assessment_type: Mapped[str] = mapped_column(String(20), index=True)
    module_id: Mapped[str | None] = mapped_column(String(50), nullable=True, index=True)
    score: Mapped[float] = mapped_column(Float, nullable=False)
    max_score: Mapped[float] = mapped_column(Float, default=100.0)
    correct_answers: Mapped[int | None] = mapped_column(Integer, nullable=True)
    total_questions: Mapped[int | None] = mapped_column(Integer, nullable=True)
    completion_time_minutes: Mapped[int | None] = mapped_column(Integer, nullable=True)
    passed: Mapped[bool | None] = mapped_column(Boolean, nullable=True)
    responses: Mapped[dict] = mapped_column(JSON, default=dict)
    satisfaction_rating: Mapped[int | None] = mapped_column(Integer, nullable=True)
    taken_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class RefreshToken(Base):
    __tablename__ = "refresh_tokens"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    learner_id: Mapped[int] = mapped_column(ForeignKey("learners.id", ondelete="CASCADE"), index=True)
    token_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    expires_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    revoked_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    ip_address: Mapped[str | None] = mapped_column(String(50), nullable=True)
    user_agent: Mapped[str | None] = mapped_column(Text, nullable=True)

    __table_args__ = (UniqueConstraint("token_hash", name="uq_refresh_token_hash"),)
