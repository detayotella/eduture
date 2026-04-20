# EDUTURE 2.0 - Security Specification
## Comprehensive Security Guide for Agents

---

## Table of Contents
1. [Authentication Security](#1-authentication-security)
2. [Authorization (RBAC)](#2-authorization-rbac)
3. [Password Security](#3-password-security)
4. [Session Management](#4-session-management)
5. [Input Validation](#5-input-validation)
6. [Rate Limiting](#6-rate-limiting)
7. [Data Protection](#7-data-protection)
8. [API Security](#8-api-security)
9. [Database Security](#9-database-security)
10. [Logging & Monitoring](#10-logging--monitoring)
11. [Security Headers](#11-security-headers)
12. [Deployment Security](#12-deployment-security)
13. [Security Checklist](#13-security-checklist)

---

## 1. Authentication Security

### 1.1 JWT Token Configuration

```python
# config.py

# Token settings
ACCESS_TOKEN_EXPIRE_MINUTES = 60      # 1 hour
REFRESH_TOKEN_EXPIRE_DAYS = 7          # 7 days
ALGORITHM = "HS256"

# Secret key requirements:
# - Minimum 32 characters
# - Randomly generated
# - Stored in environment variable
# - Never committed to version control
```

### 1.2 Token Implementation

```python
# auth.py

from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
import secrets

# Password hashing
pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
    bcrypt__rounds=12  # 12 rounds = ~250ms per hash
)

def create_access_token(data: dict, expires_delta: timedelta = None):
    """Create short-lived access token"""
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({
        "exp": expire,
        "iat": datetime.utcnow(),
        "type": "access"
    })
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def create_refresh_token(learner_id: str):
    """Create long-lived refresh token"""
    # Generate cryptographically secure random token
    token = secrets.token_urlsafe(32)
    
    # Store hash in database
    token_hash = pwd_context.hash(token)
    expires_at = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    
    save_refresh_token(learner_id, token_hash, expires_at)
    
    return token

def verify_token(token: str, token_type: str = "access"):
    """Verify and decode JWT token"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        
        # Verify token type
        if payload.get("type") != token_type:
            return None
            
        # Check expiration
        exp = payload.get("exp")
        if exp is None or datetime.utcnow() > datetime.fromtimestamp(exp):
            return None
            
        return payload
        
    except JWTError:
        return None
```

### 1.3 Token Refresh Flow

```
┌──────────┐                    ┌──────────┐
│  Client  │───1. POST /refresh──►│  Server  │
│          │    {refresh_token}   │          │
│          │◄──2. New tokens─────│          │
│          │    {access_token,    │          │
│          │     refresh_token}   │          │
└──────────┘                    └──────────┘

Security:
- Refresh token single-use (rotate on refresh)
- Old refresh token invalidated
- New refresh token issued
- Refresh token bound to device (optional)
```

---

## 2. Authorization (RBAC)

### 2.1 Role Definitions

| Role | Permissions |
|------|-------------|
| `learner` | View content, take assessments, view own progress |
| `admin` | All learner permissions + view all data, export, manage |

### 2.2 Role-Based Access Control

```python
# dependencies.py

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

security = HTTPBearer()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Get authenticated user"""
    token = credentials.credentials
    payload = verify_token(token)
    
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    user = get_user_by_id(payload["sub"])
    if user is None or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive"
        )
    
    return user

async def require_admin(current_user: User = Depends(get_current_user)):
    """Require admin role"""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user
```

### 2.3 Route Protection

```python
# routers/admin.py

from fastapi import APIRouter, Depends
from dependencies import require_admin

router = APIRouter()

@router.get("/stats")
async def get_stats(admin: User = Depends(require_admin)):
    """Only admins can access"""
    return calculate_stats()

# routers/content.py

@router.get("/recommend")
async def get_recommendation(user: User = Depends(get_current_user)):
    """Any authenticated user can access"""
    return get_content_recommendation(user.id)
```

---

## 3. Password Security

### 3.1 Password Requirements

```python
# validators.py

import re
from pydantic import validator

PASSWORD_REGEX = re.compile(
    r'^(?=.*[a-z])'      # At least one lowercase
    r'(?=.*[A-Z])'       # At least one uppercase
    r'(?=.*\d)'          # At least one digit
    r'(?=.*[@$!%*?&])'   # At least one special char
    r'[A-Za-z\d@$!%*?&]' # Allowed characters
    r'{8,128}$'          # Length 8-128
)

def validate_password(password: str) -> bool:
    """Validate password strength"""
    if not password:
        return False
    if len(password) < 8 or len(password) > 128:
        return False
    return bool(PASSWORD_REGEX.match(password))

def get_password_errors(password: str) -> list:
    """Get specific password validation errors"""
    errors = []
    
    if len(password) < 8:
        errors.append("Password must be at least 8 characters")
    if len(password) > 128:
        errors.append("Password must be less than 128 characters")
    if not re.search(r'[a-z]', password):
        errors.append("Password must contain a lowercase letter")
    if not re.search(r'[A-Z]', password):
        errors.append("Password must contain an uppercase letter")
    if not re.search(r'\d', password):
        errors.append("Password must contain a digit")
    if not re.search(r'[@$!%*?&]', password):
        errors.append("Password must contain a special character")
    
    return errors
```

### 3.2 Password Hashing

```python
# auth.py

def hash_password(password: str) -> str:
    """Hash password with bcrypt"""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password against hash"""
    return pwd_context.verify(plain_password, hashed_password)
```

### 3.3 Account Lockout

```python
# Account lockout after failed attempts
MAX_LOGIN_ATTEMPTS = 5
LOCKOUT_DURATION_MINUTES = 30

async def check_account_lockout(user: User):
    """Check if account is locked"""
    if user.locked_until and datetime.utcnow() < user.locked_until:
        remaining = (user.locked_until - datetime.utcnow()).seconds // 60
        raise HTTPException(
            status_code=status.HTTP_423_LOCKED,
            detail=f"Account locked. Try again in {remaining} minutes."
        )

async def record_failed_login(user: User):
    """Record failed login attempt"""
    user.login_attempts += 1
    
    if user.login_attempts >= MAX_LOGIN_ATTEMPTS:
        user.locked_until = datetime.utcnow() + timedelta(
            minutes=LOCKOUT_DURATION_MINUTES
        )
    
    db.commit()

async def reset_login_attempts(user: User):
    """Reset after successful login"""
    user.login_attempts = 0
    user.locked_until = None
    db.commit()
```

---

## 4. Session Management

### 4.1 Session Security

```python
# Session configuration
SESSION_CONFIG = {
    "cookie_secure": True,        # HTTPS only
    "cookie_httponly": True,      # No JavaScript access
    "cookie_samesite": "lax",     # CSRF protection
    "max_age": 3600,              # 1 hour
}
```

### 4.2 Logout Handling

```python
@router.post("/logout")
async def logout(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    current_user: User = Depends(get_current_user)
):
    """Logout user and invalidate tokens"""
    token = credentials.credentials
    
    # Add token to blacklist (optional)
    blacklist_token(token)
    
    # Revoke refresh tokens
    revoke_refresh_tokens(current_user.id)
    
    # Log the action
    audit_log(
        user_id=current_user.id,
        action="LOGOUT",
        details={"ip": request.client.host}
    )
    
    return {"success": True, "message": "Logged out successfully"}
```

---

## 5. Input Validation

### 5.1 Pydantic Validators

```python
# schemas.py

from pydantic import BaseModel, validator, EmailStr
import re

class UserRegister(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    
    @validator('password')
    def validate_password_strength(cls, v):
        errors = get_password_errors(v)
        if errors:
            raise ValueError(f"Password requirements: {', '.join(errors)}")
        return v
    
    @validator('full_name')
    def validate_name(cls, v):
        if not v or len(v) < 2:
            raise ValueError("Name must be at least 2 characters")
        if len(v) > 100:
            raise ValueError("Name must be less than 100 characters")
        if not re.match(r'^[a-zA-Z\s\'-]+$', v):
            raise ValueError("Name contains invalid characters")
        return v.strip()

class InteractionCreate(BaseModel):
    content_id: UUID
    completed: bool
    quiz_score: Optional[float] = None
    actual_time_minutes: Optional[int] = None
    
    @validator('quiz_score')
    def validate_score(cls, v):
        if v is not None and (v < 0 or v > 100):
            raise ValueError("Score must be between 0 and 100")
        return v
    
    @validator('actual_time_minutes')
    def validate_time(cls, v):
        if v is not None and v < 0:
            raise ValueError("Time cannot be negative")
        if v is not None and v > 480:  # Max 8 hours
            raise ValueError("Time seems unusually long")
        return v
```

### 5.2 SQL Injection Prevention

```python
# GOOD: Parameterized queries
result = db.execute(
    "SELECT * FROM learners WHERE email = :email",
    {"email": user_email}
)

# BAD: String formatting (NEVER DO THIS)
result = db.execute(
    f"SELECT * FROM learners WHERE email = '{user_email}'"  # SQL INJECTION!
)
```

### 5.3 XSS Prevention

```python
# Sanitize user input before displaying
from markupsafe import Markup, escape

# Escape HTML characters
user_input = '<script>alert("xss")</script>'
safe_input = escape(user_input)
# Result: &lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;

# Frontend: React automatically escapes (don't use dangerouslySetInnerHTML)
```

---

## 6. Rate Limiting

### 6.1 Rate Limit Configuration

```python
# rate_limiter.py

from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["100/minute"]
)

# Apply to FastAPI app
app = FastAPI()
app.state.limiter = limiter
```

### 6.2 Endpoint-Specific Limits

```python
# routers/auth.py

from slowapi.util import get_remote_address

@router.post("/login")
@limiter.limit("5/minute")  # 5 login attempts per minute
def login(request: Request, credentials: LoginCredentials):
    ...

@router.post("/register")
@limiter.limit("3/5minutes")  # 3 registrations per 5 minutes
def register(request: Request, data: UserRegister):
    ...

# routers/content.py

@router.get("/recommend")
@limiter.limit("30/minute")  # 30 recommendations per minute
def get_recommendation(request: Request, user: User = Depends(get_current_user)):
    ...
```

### 6.3 Rate Limit Response

```python
@app.exception_handler(RateLimitExceeded)
async def rate_limit_handler(request: Request, exc: RateLimitExceeded):
    return JSONResponse(
        status_code=429,
        content={
            "success": False,
            "error": {
                "code": "RATE_LIMIT_EXCEEDED",
                "message": "Too many requests",
                "retry_after": exc.retry_after
            }
        },
        headers={"Retry-After": str(exc.retry_after)}
    )
```

---

## 7. Data Protection

### 7.1 Sensitive Data Handling

| Data Type | Storage | Transmission | Display |
|-----------|---------|--------------|---------|
| Passwords | bcrypt hash | Never | Never |
| Email | Plain (encrypted at rest) | TLS | Masked (j***@example.com) |
| Quiz scores | Plain | TLS | To owner only |
| IP addresses | Plain | N/A | Admin only |

### 7.2 Data Encryption at Rest (Optional)

```python
# For highly sensitive fields
from cryptography.fernet import Fernet

# Generate key once, store securely
encryption_key = Fernet.generate_key()
cipher = Fernet(encryption_key)

def encrypt_field(data: str) -> bytes:
    return cipher.encrypt(data.encode())

def decrypt_field(encrypted: bytes) -> str:
    return cipher.decrypt(encrypted).decode()
```

### 7.3 Data Retention

```python
# Automatically delete old data
DATA_RETENTION_DAYS = {
    "audit_logs": 365,      # 1 year
    "interactions": 730,    # 2 years
    "refresh_tokens": 7,    # 7 days after expiry
}

async def cleanup_old_data():
    """Run as scheduled job"""
    for table, days in DATA_RETENTION_DAYS.items():
        cutoff = datetime.utcnow() - timedelta(days=days)
        db.execute(f"""
            DELETE FROM {table} 
            WHERE created_at < :cutoff
        """, {"cutoff": cutoff})
```

---

## 8. API Security

### 8.1 CORS Configuration

```python
# main.py

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Development
        "https://eduture.app"     # Production
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
    max_age=600  # 10 minutes
)
```

### 8.2 Request Size Limits

```python
# Limit request body size
@app.middleware("http")
async def limit_request_size(request: Request, call_next):
    body = await request.body()
    if len(body) > 10 * 1024 * 1024:  # 10 MB limit
        return JSONResponse(
            status_code=413,
            content={"error": "Request too large"}
        )
    return await call_next(request)
```

### 8.3 API Versioning

```python
# Version in URL path
app = FastAPI(version="2.0.0")

# Include versioned routers
app.include_router(auth.router, prefix="/api/v2/auth")
app.include_router(content.router, prefix="/api/v2/content")
```

---

## 9. Database Security

### 9.1 Connection Security

```python
# database.py

from sqlalchemy import create_engine
from sqlalchemy.pool import QueuePool

engine = create_engine(
    DATABASE_URL,
    poolclass=QueuePool,
    pool_size=10,
    max_overflow=20,
    pool_pre_ping=True,  # Verify connections before use
    connect_args={
        "sslmode": "require",  # Require SSL
        "connect_timeout": 10
    }
)
```

### 9.2 Database User Permissions

```sql
-- Create limited privilege user
CREATE USER eduture_app WITH PASSWORD 'strong_password';

-- Grant only necessary permissions
GRANT CONNECT ON DATABASE eduture_db TO eduture_app;
GRANT USAGE ON SCHEMA public TO eduture_app;
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO eduture_app;

-- No DELETE permission on critical tables
REVOKE DELETE ON learners, learning_styles FROM eduture_app;
```

---

## 10. Logging & Monitoring

### 10.1 Audit Logging

```python
# audit.py

import logging
from datetime import datetime

audit_logger = logging.getLogger("audit")

def audit_log(
    action: str,
    user_id: str = None,
    resource_type: str = None,
    resource_id: str = None,
    details: dict = None,
    request: Request = None
):
    """Log security-relevant events"""
    
    log_entry = {
        "timestamp": datetime.utcnow().isoformat(),
        "action": action,
        "user_id": user_id,
        "resource_type": resource_type,
        "resource_id": resource_id,
        "details": details or {},
        "ip_address": request.client.host if request else None,
        "user_agent": request.headers.get("user-agent") if request else None
    }
    
    # Log to database
    db.execute("""
        INSERT INTO audit_logs 
        (learner_id, action, resource_type, resource_id, details, ip_address, user_agent)
        VALUES (:user_id, :action, :resource_type, :resource_id, :details, :ip, :ua)
    """, log_entry)
    
    # Also log to file
    audit_logger.info(f"AUDIT: {log_entry}")

# Usage
@router.post("/login")
def login(credentials: LoginCredentials, request: Request):
    result = authenticate(credentials)
    
    audit_log(
        action="LOGIN" if result.success else "LOGIN_FAILED",
        user_id=result.user_id,
        details={"email": credentials.email},
        request=request
    )
    
    return result
```

### 10.2 Events to Log

| Event | Level | Details |
|-------|-------|---------|
| User registration | INFO | email, ip |
| Login success | INFO | user_id, ip |
| Login failure | WARNING | email, ip, reason |
| Password change | INFO | user_id |
| Content access | DEBUG | user_id, content_id |
| Admin action | INFO | admin_id, action, target |
| Rate limit hit | WARNING | ip, endpoint |
| Permission denied | WARNING | user_id, resource |

---

## 11. Security Headers

### 11.1 Required Headers

```python
# middleware.py

from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        
        # Prevent MIME type sniffing
        response.headers["X-Content-Type-Options"] = "nosniff"
        
        # Prevent clickjacking
        response.headers["X-Frame-Options"] = "DENY"
        
        # XSS protection
        response.headers["X-XSS-Protection"] = "1; mode=block"
        
        # Strict transport security (HTTPS only)
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        
        # Content security policy
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline'; "
            "style-src 'self' 'unsafe-inline'; "
            "img-src 'self' data: https:; "
            "font-src 'self'; "
            "connect-src 'self' https://api.eduture.com;"
        )
        
        # Referrer policy
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        
        # Permissions policy
        response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
        
        return response

# Apply to app
app.add_middleware(SecurityHeadersMiddleware)
```

---

## 12. Deployment Security

### 12.1 Environment Variables

```bash
# .env.example (safe to commit)
DEBUG=false
LOG_LEVEL=INFO
RATE_LIMIT_ENABLED=true

# .env (NEVER commit)
DATABASE_URL=postgresql://user:password@host:5432/db
SECRET_KEY=your-32-char-minimum-secret-key-here
INITIAL_ADMIN_PASSWORD=change-immediately-after-setup
```

### 12.2 Docker Security

```dockerfile
# Dockerfile
FROM python:3.11-slim

# Create non-root user
RUN useradd -m -u 1000 appuser

# Set working directory
WORKDIR /app

# Copy requirements first (for caching)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY ./app ./app

# Change ownership
RUN chown -R appuser:appuser /app

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Run application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### 12.3 Production Checklist

- [ ] HTTPS enabled with valid certificate
- [ ] DEBUG mode disabled
- [ ] Strong SECRET_KEY set
- [ ] Database using SSL
- [ ] Non-root Docker user
- [ ] Rate limiting enabled
- [ ] Logging configured
- [ ] Health checks configured
- [ ] Secrets in environment variables
- [ ] No sensitive data in logs

---

## 13. Security Checklist

### 13.1 Implementation Checklist

#### Authentication
- [ ] Passwords hashed with bcrypt (12+ rounds)
- [ ] JWT access tokens (1-hour expiry)
- [ ] JWT refresh tokens (7-day expiry)
- [ ] Token rotation on refresh
- [ ] Account lockout after 5 failed attempts
- [ ] Login attempt tracking

#### Authorization
- [ ] Role-based access control (RBAC)
- [ ] Admin endpoints protected
- [ ] User can only access own data
- [ ] API keys for service accounts (if needed)

#### Input Validation
- [ ] All inputs validated with Pydantic
- [ ] Email format validation
- [ ] Password strength requirements
- [ ] SQL injection prevention
- [ ] XSS prevention
- [ ] File upload validation (if applicable)

#### Rate Limiting
- [ ] Login endpoint: 5/minute
- [ ] Register endpoint: 3/5minutes
- [ ] General API: 100/minute
- [ ] Rate limit headers in responses

#### Data Protection
- [ ] HTTPS only
- [ ] Secure cookies
- [ ] Sensitive data encrypted at rest (optional)
- [ ] Data retention policies
- [ ] GDPR compliance (if applicable)

#### API Security
- [ ] CORS configured
- [ ] Request size limits
- [ ] API versioning
- [ ] Security headers
- [ ] Error messages don't leak info

#### Database Security
- [ ] Connection pooling
- [ ] SSL connections
- [ ] Limited user permissions
- [ ] No SQL injection vulnerabilities

#### Logging & Monitoring
- [ ] Audit logs for security events
- [ ] Failed login attempts logged
- [ ] Admin actions logged
- [ ] Log rotation configured

#### Deployment
- [ ] Environment variables for secrets
- [ ] Non-root Docker user
- [ ] Health checks
- [ ] Secrets not in version control
- [ ] Production settings

---

## 14. Common Vulnerabilities & Prevention

| Vulnerability | Prevention |
|---------------|------------|
| SQL Injection | Parameterized queries |
| XSS | Output encoding, CSP headers |
| CSRF | SameSite cookies, CSRF tokens |
| Brute Force | Rate limiting, account lockout |
| Session Hijacking | HTTPS, secure cookies, short expiry |
| Information Leakage | Generic error messages |
| Insecure Deserialization | Validate all input |
| Security Misconfiguration | Environment-specific configs |

---

## 15. Security Testing

### 15.1 Automated Security Tests

```python
# tests/security/test_auth.py

def test_password_hashing():
    """Passwords must be hashed, not stored plain"""
    password = "SecurePass123!"
    hashed = hash_password(password)
    
    assert hashed != password
    assert verify_password(password, hashed)
    assert not verify_password("wrong", hashed)

def test_sql_injection_prevention():
    """SQL injection attempts should fail"""
    malicious_email = "'; DROP TABLE learners; --"
    
    # Should not execute malicious SQL
    result = get_user_by_email(malicious_email)
    assert result is None

def test_xss_prevention():
    """XSS attempts should be escaped"""
    malicious_input = '<script>alert("xss")</script>'
    safe_output = escape(malicious_input)
    
    assert '<script>' not in safe_output

def test_rate_limiting():
    """Rate limits should be enforced"""
    for _ in range(6):  # Exceed limit
        response = client.post("/auth/login", json={...})
    
    assert response.status_code == 429
```

---

**End of Security Specification**

*For questions or clarifications, refer to the main implementation specification.*
