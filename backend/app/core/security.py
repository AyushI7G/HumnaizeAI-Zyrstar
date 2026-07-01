"""
Security primitives: password hashing (Argon2), JWT issuing/validation,
and CSRF double-submit-cookie tokens.
"""
import hashlib
import hmac
import secrets
import time
from datetime import datetime, timedelta, timezone
from typing import Any, Literal

from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError, InvalidHashError
from jose import JWTError, jwt

from app.core.config import settings

# Argon2id with sane, tuned-for-web cost parameters (server-side hashing,
# not user-facing latency-sensitive path beyond login/register).
_ph = PasswordHasher(
    time_cost=3,
    memory_cost=65536,  # 64 MB
    parallelism=2,
    hash_len=32,
    salt_len=16,
)


def hash_password(plain_password: str) -> str:
    return _ph.hash(plain_password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return _ph.verify(hashed_password, plain_password)
    except (VerifyMismatchError, InvalidHashError):
        return False


def needs_rehash(hashed_password: str) -> bool:
    return _ph.check_needs_rehash(hashed_password)


# ---------------------------------------------------------------------------
# JWT
# ---------------------------------------------------------------------------

TokenType = Literal["access", "refresh"]


def _create_token(subject: str, token_type: TokenType, expires_delta: timedelta, extra: dict | None = None) -> str:
    now = datetime.now(timezone.utc)
    payload: dict[str, Any] = {
        "sub": subject,
        "type": token_type,
        "iat": now,
        "exp": now + expires_delta,
        "jti": secrets.token_hex(16),
    }
    if extra:
        payload.update(extra)
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def create_access_token(user_id: str, extra: dict | None = None) -> str:
    return _create_token(
        user_id, "access", timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES), extra
    )


def create_refresh_token(user_id: str) -> str:
    return _create_token(user_id, "refresh", timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS))


def decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
    except JWTError as exc:
        raise ValueError("Invalid or expired token") from exc


# ---------------------------------------------------------------------------
# CSRF (double-submit cookie pattern, HMAC-signed)
# ---------------------------------------------------------------------------

def generate_csrf_token(session_id: str) -> str:
    nonce = secrets.token_urlsafe(16)
    timestamp = str(int(time.time()))
    message = f"{session_id}:{nonce}:{timestamp}".encode()
    signature = hmac.new(settings.CSRF_SECRET.encode(), message, hashlib.sha256).hexdigest()
    return f"{nonce}:{timestamp}:{signature}"


def validate_csrf_token(session_id: str, token: str, max_age_seconds: int = 3600) -> bool:
    try:
        nonce, timestamp, signature = token.split(":")
    except ValueError:
        return False

    if int(time.time()) - int(timestamp) > max_age_seconds:
        return False

    message = f"{session_id}:{nonce}:{timestamp}".encode()
    expected = hmac.new(settings.CSRF_SECRET.encode(), message, hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, signature)
