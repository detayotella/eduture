from __future__ import annotations

import json
from pathlib import Path
from functools import lru_cache
from pydantic import Field, field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


DEFAULT_SQLITE_PATH = Path(__file__).resolve().parent.parent / "eduture.db"
DEFAULT_BANDIT_STATE_PATH = Path(__file__).resolve().parent.parent / "var" / "bandit_state.json"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    app_name: str = "EDUTURE 2.0"
    api_v1_prefix: str = "/api"
    secret_key: str = Field(default="change-me-in-env")
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60
    refresh_token_expire_days: int = 7
    database_url: str = f"sqlite:///{DEFAULT_SQLITE_PATH}"
    cors_origins: list[str] = ["*"]
    rate_limit_login: str = "5/minute"
    rate_limit_register: str = "3/5minute"
    rate_limit_general: str = "100/minute"
    db_pool_size: int = 5
    db_max_overflow: int = 10
    db_pool_recycle_seconds: int = 1800
    trusted_hosts: list[str] = ["localhost", "127.0.0.1"]
    security_headers_enabled: bool = True
    audit_log_enabled: bool = True
    log_level: str = "INFO"
    bandit_state_path: Path = DEFAULT_BANDIT_STATE_PATH
    admin_bootstrap_enabled: bool = False
    admin_bootstrap_email: str | None = None
    admin_bootstrap_password: str | None = None
    admin_bootstrap_full_name: str = "EDUTURE Admin"
    google_oauth_enabled: bool = False
    google_oauth_client_id: str | None = None
    google_oauth_client_secret: str | None = None
    google_oauth_redirect_uri: str = "http://localhost:8000/auth/google/callback"
    google_oauth_frontend_success_url: str = "http://localhost:5173/login?oauth=success"
    google_oauth_frontend_error_url: str = "http://localhost:5173/login?oauth=error"

    @field_validator("secret_key")
    @classmethod
    def validate_secret_key(cls, value: str) -> str:
        secret_key = value.strip()
        if not secret_key or secret_key.startswith("change-me") or secret_key.startswith("change-this"):
            raise ValueError("SECRET_KEY must be set to a strong random value")
        return secret_key

    @field_validator("admin_bootstrap_email")
    @classmethod
    def normalize_admin_bootstrap_email(cls, value: str | None) -> str | None:
        if value is None:
            return None
        email = value.strip().lower()
        return email or None

    @field_validator("admin_bootstrap_password")
    @classmethod
    def validate_admin_bootstrap_password(cls, value: str | None) -> str | None:
        if value is None:
            return None
        password = value.strip()
        return password or None

    @field_validator("google_oauth_client_id", "google_oauth_client_secret", mode="before")
    @classmethod
    def normalize_optional_secret_fields(cls, value: object) -> object:
        if isinstance(value, str):
            cleaned = value.strip()
            return cleaned or None
        return value

    @model_validator(mode="after")
    def validate_google_oauth_config(self) -> "Settings":
        if not self.google_oauth_enabled:
            return self
        if not self.google_oauth_client_id or not self.google_oauth_client_secret:
            raise ValueError("Google OAuth is enabled but GOOGLE_OAUTH_CLIENT_ID/GOOGLE_OAUTH_CLIENT_SECRET are missing")
        return self

    @field_validator("cors_origins", mode="before")
    @classmethod
    def parse_cors_origins(cls, value: object) -> object:
        if isinstance(value, str):
            value = value.strip()
            if not value:
                return []
            if value.startswith("["):
                return json.loads(value)
            return [origin.strip() for origin in value.split(",") if origin.strip()]
        return value

    @field_validator("trusted_hosts", mode="before")
    @classmethod
    def parse_trusted_hosts(cls, value: object) -> object:
        if isinstance(value, str):
            value = value.strip()
            if not value:
                return []
            if value.startswith("["):
                return json.loads(value)
            return [host.strip() for host in value.split(",") if host.strip()]
        return value


@lru_cache
def get_settings() -> Settings:
    return Settings()
