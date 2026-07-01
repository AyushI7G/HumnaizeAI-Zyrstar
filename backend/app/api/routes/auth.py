import uuid
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from slowapi import Limiter
from slowapi.util import get_remote_address
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.config import settings
from app.core.database import get_db
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    generate_csrf_token,
    hash_password,
    verify_password,
)
from app.models.user import RefreshToken, User
from app.schemas.auth import RefreshRequest, TokenResponse, UserLogin, UserOut, UserRegister

router = APIRouter(prefix="/auth", tags=["auth"])
limiter = Limiter(key_func=get_remote_address)


def _set_auth_cookies(response: Response, access_token: str) -> None:
    csrf_token = generate_csrf_token(access_token)
    response.set_cookie(
        key="zyrstar_session",
        value=access_token,
        httponly=True,
        secure=settings.COOKIE_SECURE,
        samesite="lax",
        domain=settings.COOKIE_DOMAIN,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        path="/",
    )
    response.set_cookie(
        key="zyrstar_csrf",
        value=csrf_token,
        httponly=False,  # must be readable by JS to echo back in X-CSRF-Token header
        secure=settings.COOKIE_SECURE,
        samesite="lax",
        domain=settings.COOKIE_DOMAIN,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        path="/",
    )


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit(settings.RATE_LIMIT_AUTH)
async def register(
    request: Request,
    response: Response,
    payload: UserRegister,
    db: AsyncSession = Depends(get_db),
):
    existing = await db.execute(select(User).where(User.email == payload.email.lower()))
    if existing.scalar_one_or_none():
        # Generic message avoids user enumeration.
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Registration failed")

    user = User(
        email=payload.email.lower(),
        full_name=payload.full_name,
        hashed_password=hash_password(payload.password),
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    access_token = create_access_token(str(user.id))
    refresh_token = create_refresh_token(str(user.id))
    await _store_refresh_token(db, user.id, refresh_token, request)

    _set_auth_cookies(response, access_token)

    return TokenResponse(access_token=access_token, user=UserOut.model_validate(user))


@router.post("/login", response_model=TokenResponse)
@limiter.limit(settings.RATE_LIMIT_AUTH)
async def login(
    request: Request,
    response: Response,
    payload: UserLogin,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(User).where(User.email == payload.email.lower()))
    user = result.scalar_one_or_none()

    # Constant-time-ish: always run verify_password to reduce timing signal
    # for user enumeration, even against a dummy hash.
    dummy_hash = "$argon2id$v=19$m=65536,t=3,p=2$c29tZXNhbHQ$c29tZWhhc2g"
    valid = verify_password(payload.password, user.hashed_password if user else dummy_hash)

    if not user or not valid or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

    access_token = create_access_token(str(user.id))
    refresh_token = create_refresh_token(str(user.id))
    await _store_refresh_token(db, user.id, refresh_token, request)

    _set_auth_cookies(response, access_token)

    return TokenResponse(access_token=access_token, user=UserOut.model_validate(user))


@router.post("/refresh", response_model=TokenResponse)
@limiter.limit(settings.RATE_LIMIT_AUTH)
async def refresh(
    request: Request,
    response: Response,
    payload: RefreshRequest,
    db: AsyncSession = Depends(get_db),
):
    try:
        decoded = decode_token(payload.refresh_token)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")

    if decoded.get("type") != "refresh":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token type")

    jti = decoded.get("jti")
    result = await db.execute(select(RefreshToken).where(RefreshToken.jti == jti))
    stored = result.scalar_one_or_none()

    if not stored or stored.revoked or stored.expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token revoked or expired")

    user_result = await db.execute(select(User).where(User.id == uuid.UUID(decoded["sub"])))
    user = user_result.scalar_one_or_none()
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found or inactive")

    # Rotate refresh token
    stored.revoked = True
    new_refresh = create_refresh_token(str(user.id))
    await _store_refresh_token(db, user.id, new_refresh, request)
    await db.commit()

    access_token = create_access_token(str(user.id))
    _set_auth_cookies(response, access_token)

    return TokenResponse(access_token=access_token, user=UserOut.model_validate(user))


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(response: Response, current_user: User = Depends(get_current_user)):
    response.delete_cookie("zyrstar_session", path="/")
    response.delete_cookie("zyrstar_csrf", path="/")
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get("/me", response_model=UserOut)
async def me(current_user: User = Depends(get_current_user)):
    return UserOut.model_validate(current_user)


async def _store_refresh_token(db: AsyncSession, user_id: uuid.UUID, token: str, request: Request) -> None:
    decoded = decode_token(token)
    record = RefreshToken(
        user_id=user_id,
        jti=decoded["jti"],
        expires_at=datetime.fromtimestamp(decoded["exp"], tz=timezone.utc),
        user_agent=request.headers.get("user-agent", "")[:512],
        ip_address=request.client.host if request.client else "",
    )
    db.add(record)
    await db.commit()
