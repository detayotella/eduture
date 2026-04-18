from __future__ import annotations

import json
from pathlib import Path
from functools import lru_cache
from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


DEFAULT_SQLITE_PATH = Path(__file__).resolve().parent.parent / "eduture.db"


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
