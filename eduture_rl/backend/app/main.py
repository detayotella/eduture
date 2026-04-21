from __future__ import annotations

from uuid import uuid4

from fastapi import FastAPI
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import inspect, text
from starlette.middleware.trustedhost import TrustedHostMiddleware
from slowapi.errors import RateLimitExceeded
from slowapi.extension import _rate_limit_exceeded_handler
from slowapi.middleware import SlowAPIMiddleware

from .config import get_settings
from .auth import hash_password
from .database import SessionLocal, engine
from .limiter import limiter
from .logging_config import setup_logging
from .models import ContentFragment, Learner
from .routers import admin, assessment, auth, content, interaction, learning_style
from .sample_data import seed_content_rows

settings = get_settings()
setup_logging()
app = FastAPI(title=settings.app_name)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)

if settings.trusted_hosts:
    app.add_middleware(TrustedHostMiddleware, allowed_hosts=settings.trusted_hosts)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials="*" not in settings.cors_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _ensure_avatar_column() -> None:
    inspector = inspect(engine)
    if "learners" not in inspector.get_table_names():
        return
    column_names = {column["name"] for column in inspector.get_columns("learners")}
    if "avatar_url" in column_names:
        return
    with engine.begin() as conn:
        conn.execute(text("ALTER TABLE learners ADD COLUMN avatar_url TEXT"))


@app.middleware("http")
async def add_request_id(request, call_next):
    request_id = request.headers.get("X-Request-ID") or str(uuid4())
    request.state.request_id = request_id
    response = await call_next(request)
    response.headers["X-Request-ID"] = request_id
    return response


@app.middleware("http")
async def add_security_headers(request, call_next):
    response = await call_next(request)
    if not settings.security_headers_enabled:
        return response
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["X-XSS-Protection"] = "0"
    response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
    response.headers["Cache-Control"] = "no-store"
    return response

app.include_router(auth.router)
app.include_router(learning_style.router)
app.include_router(content.router)
app.include_router(interaction.router)
app.include_router(assessment.router)
app.include_router(admin.router)


@app.on_event("startup")
def startup_event() -> None:
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


@app.get("/")
def root():
    return {"success": True, "data": {"message": "EDUTURE 2.0 API is running", "docs": "/docs"}}


@app.get("/health")
def health():
    return JSONResponse({"success": True, "data": {"status": "ok"}})
