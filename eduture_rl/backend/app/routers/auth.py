from __future__ import annotations

from datetime import datetime, timedelta, timezone
import hmac
from urllib.parse import urlencode
import secrets

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from fastapi.responses import RedirectResponse
import httpx
from google.oauth2 import id_token as google_id_token
from google.auth.transport import requests as google_requests
from sqlalchemy.orm import Session

from ..auth import create_access_token, create_refresh_token, hash_password, hash_refresh_token, verify_password
from ..audit import log_audit_event
from ..config import get_settings
from ..database import get_db
from ..dependencies import get_current_user
from ..models import Learner, RefreshToken
from ..schemas import AvatarUpdateRequest, AuthResponse, LoginRequest, LogoutRequest, RefreshRequest, RegisterRequest, ResponseEnvelope

router = APIRouter(prefix="/auth", tags=["auth"])
settings = get_settings()
REFRESH_COOKIE_NAME = "eduture_refresh_token"
REFRESH_COOKIE_PATH = "/auth"
GOOGLE_OAUTH_STATE_COOKIE_NAME = "eduture_google_oauth_state"
GOOGLE_OAUTH_STATE_COOKIE_PATH = "/auth/google"
GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"


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


def _google_oauth_state_cookie_options(request: Request) -> dict[str, object]:
    return {
        "httponly": True,
        "secure": request.url.scheme == "https",
        "samesite": "lax",
        "path": GOOGLE_OAUTH_STATE_COOKIE_PATH,
        "max_age": 600,
    }


def _set_google_oauth_state_cookie(response: Response, request: Request, state: str) -> None:
    response.set_cookie(GOOGLE_OAUTH_STATE_COOKIE_NAME, state, **_google_oauth_state_cookie_options(request))


def _clear_google_oauth_state_cookie(response: Response) -> None:
    response.delete_cookie(GOOGLE_OAUTH_STATE_COOKIE_NAME, path=GOOGLE_OAUTH_STATE_COOKIE_PATH)


def _oauth_error_redirect(request: Request, reason: str) -> RedirectResponse:
    separator = "&" if "?" in settings.google_oauth_frontend_error_url else "?"
    target = f"{settings.google_oauth_frontend_error_url}{separator}reason={reason}"
    response = RedirectResponse(url=target, status_code=status.HTTP_302_FOUND)
    _clear_google_oauth_state_cookie(response)
    _clear_refresh_cookie(response)
    return response


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
        avatar_url=learner.avatar_url,
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


def _is_refresh_token_expired(expires_at: datetime) -> bool:
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    return expires_at < datetime.now(timezone.utc)


@router.get("/google/login")
def google_login(request: Request):
    if not settings.google_oauth_enabled:
        raise HTTPException(status_code=404, detail={"code": "NOT_FOUND", "message": "Google OAuth is not enabled", "details": []})

    state = secrets.token_urlsafe(32)
    query = urlencode(
        {
            "client_id": settings.google_oauth_client_id,
            "redirect_uri": settings.google_oauth_redirect_uri,
            "response_type": "code",
            "scope": "openid email profile",
            "state": state,
            "access_type": "offline",
            "include_granted_scopes": "true",
            "prompt": "select_account",
        }
    )
    response = RedirectResponse(url=f"{GOOGLE_AUTH_URL}?{query}", status_code=status.HTTP_302_FOUND)
    _set_google_oauth_state_cookie(response, request, state)
    return response


@router.get("/google/callback")
async def google_callback(
    request: Request,
    code: str | None = None,
    state: str | None = None,
    error: str | None = None,
    db: Session = Depends(get_db),
):
    if not settings.google_oauth_enabled:
        raise HTTPException(status_code=404, detail={"code": "NOT_FOUND", "message": "Google OAuth is not enabled", "details": []})

    if error:
        log_audit_event("auth.google", "failure", request=request, details={"reason": f"google_error:{error}"})
        return _oauth_error_redirect(request, "google_error")

    expected_state = request.cookies.get(GOOGLE_OAUTH_STATE_COOKIE_NAME)
    if not expected_state or not state or not hmac.compare_digest(expected_state, state):
        log_audit_event("auth.google", "failure", request=request, details={"reason": "invalid_state"})
        return _oauth_error_redirect(request, "invalid_state")

    if not code:
        log_audit_event("auth.google", "failure", request=request, details={"reason": "missing_code"})
        return _oauth_error_redirect(request, "missing_code")

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            token_response = await client.post(
                GOOGLE_TOKEN_URL,
                data={
                    "code": code,
                    "client_id": settings.google_oauth_client_id,
                    "client_secret": settings.google_oauth_client_secret,
                    "redirect_uri": settings.google_oauth_redirect_uri,
                    "grant_type": "authorization_code",
                },
            )
    except httpx.HTTPError:
        log_audit_event("auth.google", "failure", request=request, details={"reason": "token_exchange_network_error"})
        return _oauth_error_redirect(request, "token_exchange_error")

    if token_response.status_code != 200:
        log_audit_event("auth.google", "failure", request=request, details={"reason": "token_exchange_rejected", "status": token_response.status_code})
        return _oauth_error_redirect(request, "token_exchange_rejected")

    token_payload = token_response.json()
    raw_id_token = token_payload.get("id_token")
    if not raw_id_token:
        log_audit_event("auth.google", "failure", request=request, details={"reason": "missing_id_token"})
        return _oauth_error_redirect(request, "missing_id_token")

    try:
        identity = google_id_token.verify_oauth2_token(raw_id_token, google_requests.Request(), settings.google_oauth_client_id)
    except ValueError:
        log_audit_event("auth.google", "failure", request=request, details={"reason": "invalid_id_token"})
        return _oauth_error_redirect(request, "invalid_id_token")

    if identity.get("iss") not in {"accounts.google.com", "https://accounts.google.com"}:
        log_audit_event("auth.google", "failure", request=request, details={"reason": "invalid_issuer"})
        return _oauth_error_redirect(request, "invalid_issuer")

    if not identity.get("email_verified"):
        log_audit_event("auth.google", "failure", request=request, details={"reason": "email_not_verified"})
        return _oauth_error_redirect(request, "email_not_verified")

    email = str(identity.get("email", "")).strip().lower()
    if not email:
        log_audit_event("auth.google", "failure", request=request, details={"reason": "missing_email"})
        return _oauth_error_redirect(request, "missing_email")

    full_name = str(identity.get("name") or email.split("@", 1)[0]).strip()[:100] or "Google User"
    avatar_url = str(identity.get("picture") or "").strip() or None

    learner = db.query(Learner).filter(Learner.email == email).first()
    if learner is None:
        learner = Learner(
            email=email,
            password_hash=hash_password(secrets.token_urlsafe(32)),
            full_name=full_name,
            avatar_url=avatar_url,
            is_active=True,
            is_admin=False,
        )
        db.add(learner)
        db.commit()
        db.refresh(learner)
    elif avatar_url and not learner.avatar_url:
        learner.avatar_url = avatar_url
        db.commit()
        db.refresh(learner)

    _cleanup_refresh_tokens(db, learner.id)
    _, refresh_token = _issue_tokens(db, learner, request)
    response = RedirectResponse(url=settings.google_oauth_frontend_success_url, status_code=status.HTTP_302_FOUND)
    _set_refresh_cookie(response, request, refresh_token)
    _clear_google_oauth_state_cookie(response)
    log_audit_event("auth.google", "success", request=request, actor_id=learner.id, details={"email": learner.email})
    return response


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
        avatar_url=None,
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
            "avatar_url": current_user.avatar_url,
            "is_admin": current_user.is_admin,
            "created_at": current_user.created_at,
        }
    )


@router.put("/me/avatar", response_model=ResponseEnvelope)
def update_avatar(payload: AvatarUpdateRequest, current_user: Learner = Depends(get_current_user), db: Session = Depends(get_db)):
    current_user.avatar_url = payload.avatar_url
    db.commit()
    db.refresh(current_user)
    return ResponseEnvelope(
        data={
            "learner_id": current_user.id,
            "email": current_user.email,
            "full_name": current_user.full_name,
            "avatar_url": current_user.avatar_url,
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
    if stored is None or _is_refresh_token_expired(stored.expires_at):
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
