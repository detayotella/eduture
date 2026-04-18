from __future__ import annotations

import base64
from datetime import datetime, timedelta, timezone
import hashlib
import hmac
from hashlib import sha256
import os
import secrets

from fastapi import HTTPException, status
from jose import jwt, JWTError

from .config import get_settings

settings = get_settings()


def _pbkdf2_hash(password: str, salt: bytes, iterations: int = 310000) -> bytes:
    return hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, iterations)


def hash_password(password: str) -> str:
    salt = os.urandom(16)
    iterations = 310000
    derived_key = _pbkdf2_hash(password, salt, iterations)
    salt_b64 = base64.urlsafe_b64encode(salt).decode("utf-8")
    key_b64 = base64.urlsafe_b64encode(derived_key).decode("utf-8")
    return f"pbkdf2_sha256${iterations}${salt_b64}${key_b64}"


def verify_password(password: str, password_hash: str) -> bool:
    try:
        scheme, iter_raw, salt_b64, key_b64 = password_hash.split("$", 3)
        if scheme != "pbkdf2_sha256":
            return False
        iterations = int(iter_raw)
        salt = base64.urlsafe_b64decode(salt_b64.encode("utf-8"))
        expected_key = base64.urlsafe_b64decode(key_b64.encode("utf-8"))
        computed_key = _pbkdf2_hash(password, salt, iterations)
        return hmac.compare_digest(expected_key, computed_key)
    except (ValueError, TypeError):
        return False


def create_access_token(subject: str, is_admin: bool = False) -> str:
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=settings.access_token_expire_minutes)
    payload = {
        "sub": subject,
        "type": "access",
        "is_admin": is_admin,
        "exp": expires_at,
        "iat": datetime.now(timezone.utc),
    }
    return jwt.encode(payload, settings.secret_key, algorithm=settings.algorithm)


def create_refresh_token() -> str:
    return secrets.token_urlsafe(48)


def hash_refresh_token(token: str) -> str:
    return sha256(token.encode("utf-8")).hexdigest()


def decode_access_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        if payload.get("type") != "access":
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token type")
        return payload
    except JWTError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token") from exc
