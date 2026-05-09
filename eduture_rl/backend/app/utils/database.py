from __future__ import annotations

import time

from sqlalchemy.exc import OperationalError


def wait_for_database(engine, *, timeout_seconds: int = 30, initial_delay_seconds: float = 0.5) -> None:
    deadline = time.monotonic() + timeout_seconds
    delay = initial_delay_seconds
    last_error: Exception | None = None

    while True:
        try:
            with engine.connect() as connection:
                connection.exec_driver_sql("SELECT 1")
            return
        except OperationalError as exc:
            last_error = exc

        if time.monotonic() >= deadline:
            if last_error is not None:
                raise last_error
            raise TimeoutError("Timed out waiting for the database to become available")

        time.sleep(delay)
        delay = min(delay * 2, 5.0)