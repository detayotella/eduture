from __future__ import annotations

from sqlalchemy import inspect, text

from .auth import hash_password
from .config import get_settings
from .database import SessionLocal, engine
from .models import ContentFragment, Learner
from .sample_data import seed_content_rows


def _ensure_avatar_column() -> None:
    inspector = inspect(engine)
    if "learners" not in inspector.get_table_names():
        return
    column_names = {column["name"] for column in inspector.get_columns("learners")}
    if "avatar_url" in column_names:
        return
    with engine.begin() as conn:
        conn.execute(text("ALTER TABLE learners ADD COLUMN avatar_url TEXT"))


def main() -> None:
    settings = get_settings()
    _ensure_avatar_column()

    db = SessionLocal()
    try:
        if settings.admin_bootstrap_enabled:
            if not settings.admin_bootstrap_email or not settings.admin_bootstrap_password:
                raise RuntimeError("Admin bootstrap is enabled but bootstrap credentials are missing")
            admin_user = db.query(Learner).filter(Learner.email == settings.admin_bootstrap_email).first()
            if admin_user is None:
                db.add(
                    Learner(
                        email=settings.admin_bootstrap_email,
                        password_hash=hash_password(settings.admin_bootstrap_password),
                        full_name=settings.admin_bootstrap_full_name,
                        is_admin=True,
                    )
                )
                db.commit()

        if db.query(ContentFragment).count() == 0:
            for fragment in seed_content_rows():
                db.add(fragment)
            db.commit()
    finally:
        db.close()


if __name__ == "__main__":
    main()
