from __future__ import annotations

import json
import logging
from datetime import datetime, timezone
from typing import Any

from fastapi import Request

from .config import get_settings

settings = get_settings()
audit_logger = logging.getLogger("eduture.audit")


def log_audit_event(
    event: str,
    outcome: str,
    request: Request | None = None,
    actor_id: int | None = None,
    target_id: int | None = None,
    details: dict[str, Any] | None = None,
) -> None:
    if not settings.audit_log_enabled:
        return

    payload: dict[str, Any] = {
        "ts": datetime.now(timezone.utc).isoformat(),
        "event": event,
        "outcome": outcome,
    }

    if actor_id is not None:
        payload["actor_id"] = actor_id
    if target_id is not None:
        payload["target_id"] = target_id
    if details:
        payload["details"] = details

    if request is not None:
        payload["request_id"] = getattr(request.state, "request_id", None)
        payload["path"] = request.url.path
        payload["method"] = request.method
        payload["ip"] = request.client.host if request.client else None
        payload["user_agent"] = request.headers.get("user-agent")

    audit_logger.info(json.dumps(payload, separators=(",", ":")))
