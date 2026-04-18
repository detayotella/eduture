from __future__ import annotations

import subprocess
import sys
from pathlib import Path

from sqlalchemy import create_engine, inspect, text

from .config import get_settings


MANAGED_TABLES = {
    "learners",
    "learning_styles",
    "ab_test_assignments",
    "content_fragments",
    "interactions",
    "assessments",
    "refresh_tokens",
}


def main() -> None:
    backend_root = Path(__file__).resolve().parent.parent
    settings = get_settings()
    engine = create_engine(settings.database_url)
    inspector = inspect(engine)
    existing_tables = set(inspector.get_table_names())

    has_legacy_schema = bool(existing_tables.intersection(MANAGED_TABLES))
    has_alembic_version = "alembic_version" in existing_tables
    current_revision: str | None = None

    if has_alembic_version:
        with engine.connect() as conn:
            current_revision = conn.execute(text("SELECT version_num FROM alembic_version LIMIT 1")).scalar_one_or_none()

    # First migration adoption path: existing schema but no alembic version table.
    if has_legacy_schema and (not has_alembic_version or not current_revision):
        subprocess.run([sys.executable, "-m", "alembic", "stamp", "head"], cwd=str(backend_root), check=True)

    subprocess.run([sys.executable, "-m", "alembic", "upgrade", "head"], cwd=str(backend_root), check=True)


if __name__ == "__main__":
    main()
