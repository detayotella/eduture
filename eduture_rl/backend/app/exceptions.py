from __future__ import annotations

from fastapi import HTTPException, status


def validation_error(message: str, details: list[dict] | None = None) -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail={"code": "VALIDATION_ERROR", "message": message, "details": details or []},
    )


def not_found_error(message: str = "Resource not found") -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail={"code": "NOT_FOUND", "message": message, "details": []},
    )
