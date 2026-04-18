from __future__ import annotations

from datetime import datetime
import re
from typing import Any
from pydantic import BaseModel, Field, field_validator


EMAIL_PATTERN = re.compile(r"^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*$")


def normalize_email(value: str) -> str:
    email = value.strip().lower()
    if not email or len(email) > 254:
        raise ValueError("Invalid email address")
    if "@" not in email:
        raise ValueError("Invalid email address")
    local, domain = email.rsplit("@", 1)
    if not local or not domain:
        raise ValueError("Invalid email address")
    if not EMAIL_PATTERN.match(email):
        raise ValueError("Invalid email address")
    return email


class ResponseEnvelope(BaseModel):
    success: bool = True
    data: Any | None = None
    meta: dict[str, Any] | None = None


class ErrorEnvelope(BaseModel):
    success: bool = False
    error: dict[str, Any]


class RegisterRequest(BaseModel):
    email: str
    password: str = Field(min_length=8, max_length=128)
    full_name: str = Field(min_length=2, max_length=100)

    @field_validator("email")
    @classmethod
    def validate_email_address(cls, value: str) -> str:
        return normalize_email(value)

    @field_validator("full_name")
    @classmethod
    def validate_name(cls, value: str) -> str:
        if not all(ch.isalpha() or ch.isspace() or ch in "'-." for ch in value):
            raise ValueError("full_name can contain only letters, spaces, apostrophes, periods, and hyphens")
        return value.strip()


class LoginRequest(BaseModel):
    email: str
    password: str

    @field_validator("email")
    @classmethod
    def validate_email_address(cls, value: str) -> str:
        return normalize_email(value)


class AuthResponse(BaseModel):
    learner_id: int
    email: str
    full_name: str
    is_admin: bool = False
    access_token: str
    refresh_token: str
    token_type: str = "Bearer"
    expires_in: int = 3600


class LearningStyleAnswer(BaseModel):
    question_id: str
    answer: bool


class QuestionnaireSubmitRequest(BaseModel):
    learner_id: int | None = None
    responses: list[LearningStyleAnswer]


class RecommendationRequest(BaseModel):
    learner_id: int | None = None
    time_on_task: float = Field(ge=0, le=1)
    error_rate: float = Field(ge=0, le=1)
    revisit_count: float = Field(ge=0, le=1)
    completion_rate: float = Field(ge=0, le=1)
    engagement_score: float = Field(ge=0, le=1)
    topic_difficulty: float = Field(ge=0, le=1)


class InteractionRequest(BaseModel):
    learner_id: int | None = None
    content_id: int
    completed: bool
    quiz_score: float = Field(ge=0, le=100)
    expected_time: float = Field(ge=0)
    actual_time: float = Field(ge=0)
    is_revisit: bool = False
    scroll_depth: float = Field(default=0.0, ge=0, le=1)
    click_count: int = Field(default=0, ge=0)


class AssessmentRequest(BaseModel):
    learner_id: int
    module_id: str
    content_id: int | None = None
    score: float = Field(ge=0, le=100)
    responses: dict[str, Any]
    completion_time_minutes: int | None = None
    satisfaction_rating: int | None = Field(default=None, ge=1, le=5)


class AssessmentResult(BaseModel):
    learner_id: int
    module_id: str
    assessment_type: str
    score: float
    passed: bool
    completion_time_minutes: int | None = None
    taken_at: datetime


class ContentSummary(BaseModel):
    id: int
    module_id: str
    topic_id: str
    content_type: str
    sequence_order: int
    title: str
    difficulty: float
    estimated_time_minutes: int
    content_data: str


class ContentModuleSummary(BaseModel):
    module_id: str
    title: str
    description: str
    topics: list[str]


class RefreshRequest(BaseModel):
    refresh_token: str = Field(min_length=16, max_length=512)


class LogoutRequest(BaseModel):
    refresh_token: str | None = Field(default=None, max_length=512)
