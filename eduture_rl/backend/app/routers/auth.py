from __future__ import annotations

from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from sqlalchemy.orm import Session

from ..auth import create_access_token, create_refresh_token, hash_password, hash_refresh_token, verify_password
from ..audit import log_audit_event
from ..config import get_settings
from ..database import get_db
from ..dependencies import get_current_user
from ..models import Learner, RefreshToken
from ..schemas import AuthResponse, LoginRequest, LogoutRequest, RefreshRequest, RegisterRequest, ResponseEnvelope

router = APIRouter(prefix="/auth", tags=["auth"])
settings = get_settings()
REFRESH_COOKIE_NAME = "eduture_refresh_token"
REFRESH_COOKIE_PATH = "/auth"


def _cookie_options(request: Request) -> dict[str, object]:
    return {
        "httponly": True,
        "secure": request.url.scheme == "https",
        "samesite": "lax",
        "path": REFRESH_COOKIE_PATH,
        "max_age": settings.refresh_token_expire_days * 24 * 60 * 60,
    }


def _set_refresh_cookie(response: Response, request: Request, refresh_token: str) -> None:
    response.set_cookie(REFRESH_COOKIE_NAME, refresh_token, **_cookie_options(request))


def _clear_refresh_cookie(response: Response) -> None:
    response.delete_cookie(REFRESH_COOKIE_NAME, path=REFRESH_COOKIE_PATH)


def _issue_tokens(db: Session, learner: Learner, request: Request | None = None) -> tuple[AuthResponse, str]:
    access_token = create_access_token(str(learner.id), is_admin=learner.is_admin)
    refresh_token = create_refresh_token()
    token_row = RefreshToken(
        learner_id=learner.id,
        token_hash=hash_refresh_token(refresh_token),
        expires_at=datetime.now(timezone.utc) + timedelta(days=settings.refresh_token_expire_days),
        ip_address=request.client.host if request and request.client else None,
        user_agent=request.headers.get("user-agent") if request else None,
    )
    db.add(token_row)
    learner.last_login = datetime.utcnow()
    db.commit()
    db.refresh(learner)
    return AuthResponse(
        learner_id=learner.id,
        email=learner.email,
        full_name=learner.full_name,
        is_admin=learner.is_admin,
        access_token=access_token,
        refresh_token=refresh_token,
    ), refresh_token


def _cleanup_refresh_tokens(db: Session, learner_id: int) -> None:
    now = datetime.now(timezone.utc)
    (
        db.query(RefreshToken)
        .filter(RefreshToken.learner_id == learner_id)
        .filter((RefreshToken.expires_at < now) | (RefreshToken.revoked_at.is_not(None)))
        .delete(synchronize_session=False)
    )
    db.commit()


@router.post("/register", status_code=status.HTTP_201_CREATED, response_model=ResponseEnvelope)
def register(request: Request, response: Response, payload: RegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(Learner).filter(Learner.email == payload.email).first()
    if existing:
        log_audit_event("auth.register", "failure", request=request, details={"email": payload.email.lower(), "reason": "email_exists"})
        raise HTTPException(status_code=400, detail={"code": "VALIDATION_ERROR", "message": "Email already exists", "details": []})
    learner = Learner(
        email=payload.email.lower(),
        password_hash=hash_password(payload.password),
        full_name=payload.full_name,
        is_active=True,
        is_admin=False,
    )
    db.add(learner)
    db.commit()
    db.refresh(learner)
    _cleanup_refresh_tokens(db, learner.id)
    auth, refresh_token = _issue_tokens(db, learner, request)
    _set_refresh_cookie(response, request, refresh_token)
    log_audit_event("auth.register", "success", request=request, actor_id=learner.id, details={"email": learner.email})
    return ResponseEnvelope(data=auth.model_copy(update={"refresh_token": None}).model_dump(exclude_none=True))


@router.post("/login", response_model=ResponseEnvelope)
def login(request: Request, response: Response, payload: LoginRequest, db: Session = Depends(get_db)):
    learner = db.query(Learner).filter(Learner.email == payload.email.lower()).first()
    if learner is None or not verify_password(payload.password, learner.password_hash):
        log_audit_event("auth.login", "failure", request=request, details={"email": payload.email.lower(), "reason": "invalid_credentials"})
        raise HTTPException(status_code=401, detail={"code": "AUTHENTICATION_ERROR", "message": "Invalid credentials", "details": []})
    _cleanup_refresh_tokens(db, learner.id)
    auth, refresh_token = _issue_tokens(db, learner, request)
    _set_refresh_cookie(response, request, refresh_token)
    log_audit_event("auth.login", "success", request=request, actor_id=learner.id)
    return ResponseEnvelope(data=auth.model_copy(update={"refresh_token": None}).model_dump(exclude_none=True))


@router.get("/me", response_model=ResponseEnvelope)
def me(current_user: Learner = Depends(get_current_user)):
    return ResponseEnvelope(
        data={
            "learner_id": current_user.id,
            "email": current_user.email,
            "full_name": current_user.full_name,
            "is_admin": current_user.is_admin,
            "created_at": current_user.created_at,
        }
    )


@router.post("/refresh", response_model=ResponseEnvelope)
def refresh(request: Request, response: Response, payload: RefreshRequest, db: Session = Depends(get_db)):
    refresh_token = payload.refresh_token or request.cookies.get(REFRESH_COOKIE_NAME)
    if not refresh_token:
        _clear_refresh_cookie(response)
        log_audit_event("auth.refresh", "failure", request=request, details={"reason": "missing_refresh_token"})
        raise HTTPException(status_code=401, detail={"code": "AUTHENTICATION_ERROR", "message": "Refresh token expired or invalid", "details": []})

    token_hash = hash_refresh_token(refresh_token)
    stored = (
        db.query(RefreshToken)
        .filter(RefreshToken.token_hash == token_hash, RefreshToken.revoked_at.is_(None))
        .first()
    )
    if stored is None or stored.expires_at < datetime.now(timezone.utc):
        _clear_refresh_cookie(response)
        log_audit_event("auth.refresh", "failure", request=request, details={"reason": "invalid_or_expired_refresh_token"})
        raise HTTPException(status_code=401, detail={"code": "AUTHENTICATION_ERROR", "message": "Refresh token expired or invalid", "details": []})

    learner = db.query(Learner).filter(Learner.id == stored.learner_id).first()
    if learner is None:
        log_audit_event("auth.refresh", "failure", request=request, details={"reason": "learner_not_found"})
        raise HTTPException(status_code=404, detail={"code": "NOT_FOUND", "message": "Learner not found", "details": []})

    stored.revoked_at = datetime.now(timezone.utc)
    db.commit()
    _cleanup_refresh_tokens(db, learner.id)
    auth, new_refresh_token = _issue_tokens(db, learner, request)
    _set_refresh_cookie(response, request, new_refresh_token)
    log_audit_event("auth.refresh", "success", request=request, actor_id=learner.id)
    return ResponseEnvelope(data=auth.model_copy(update={"refresh_token": None}).model_dump(exclude_none=True))


@router.post("/logout", response_model=ResponseEnvelope)
def logout(request: Request, response: Response, payload: LogoutRequest, current_user: Learner = Depends(get_current_user), db: Session = Depends(get_db)):
    refresh_token = payload.refresh_token or request.cookies.get(REFRESH_COOKIE_NAME)
    if refresh_token:
        token_hash = hash_refresh_token(refresh_token)
        stored = (
            db.query(RefreshToken)
            .filter(RefreshToken.learner_id == current_user.id, RefreshToken.token_hash == token_hash, RefreshToken.revoked_at.is_(None))
            .first()
        )
        if stored:
            stored.revoked_at = datetime.now(timezone.utc)
            db.commit()
    _clear_refresh_cookie(response)
    log_audit_event("auth.logout", "success", request=request, actor_id=current_user.id)
    return ResponseEnvelope(data={"message": "Logged out"})
