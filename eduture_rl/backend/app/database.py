from __future__ import annotations

from urllib.parse import urlsplit, urlunsplit

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from .config import get_settings

settings = get_settings()


def normalize_database_url(database_url: str) -> str:
    if database_url.startswith(("postgres://", "postgresql://")) and "+" not in database_url.split("://", 1)[0]:
        parts = urlsplit(database_url)
        return urlunsplit(("postgresql+psycopg", parts.netloc, parts.path, parts.query, parts.fragment))
    return database_url


database_url = normalize_database_url(settings.database_url)
connect_args = {"check_same_thread": False} if database_url.startswith("sqlite") else {}

engine_kwargs: dict = {"future": True, "connect_args": connect_args}
if not database_url.startswith("sqlite"):
    engine_kwargs.update(
        {
            "pool_pre_ping": True,
            "pool_size": settings.db_pool_size,
            "max_overflow": settings.db_max_overflow,
            "pool_recycle": settings.db_pool_recycle_seconds,
        }
    )

engine = create_engine(database_url, **engine_kwargs)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine, future=True)


class Base(DeclarativeBase):
    pass



def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
