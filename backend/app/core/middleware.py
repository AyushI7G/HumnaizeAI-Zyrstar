"""
Cross-cutting HTTP middleware: secure headers, CSRF enforcement for
state-changing requests, and request-size guarding.
"""
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse

from app.core.config import settings
from app.core.security import validate_csrf_token

SAFE_METHODS = {"GET", "HEAD", "OPTIONS"}
CSRF_EXEMPT_PATHS = {
    f"{settings.API_V1_PREFIX}/auth/login",
    f"{settings.API_V1_PREFIX}/auth/register",
    f"{settings.API_V1_PREFIX}/auth/refresh",
}


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Adds OWASP-recommended security headers to every response."""

    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = (
            "geolocation=(), microphone=(), camera=(), payment=(), usb=()"
        )
        response.headers["X-XSS-Protection"] = "1; mode=block"
        if settings.ENVIRONMENT == "production":
            response.headers["Strict-Transport-Security"] = (
                "max-age=63072000; includeSubDomains; preload"
            )
        # CSP: allow AdSense scripts/frames explicitly, block everything else by default.
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline' https://pagead2.googlesyndication.com "
            "https://www.googletagmanager.com https://adservice.google.com; "
            "style-src 'self' 'unsafe-inline'; "
            "img-src 'self' data: https:; "
            "frame-src https://googleads.g.doubleclick.net https://tpc.googlesyndication.com; "
            "connect-src 'self' https://pagead2.googlesyndication.com; "
            "font-src 'self' data:; "
            "object-src 'none'; "
            "base-uri 'self'; "
            "frame-ancestors 'none'"
        )
        return response


class RequestSizeLimitMiddleware(BaseHTTPMiddleware):
    """Rejects overly large bodies before they hit application logic."""

    def __init__(self, app, max_body_bytes: int = 2_000_000):
        super().__init__(app)
        self.max_body_bytes = max_body_bytes

    async def dispatch(self, request: Request, call_next):
        content_length = request.headers.get("content-length")
        if content_length and int(content_length) > self.max_body_bytes:
            return JSONResponse(status_code=413, content={"detail": "Payload too large"})
        return await call_next(request)


class CSRFMiddleware(BaseHTTPMiddleware):
    """Double-submit-cookie CSRF protection for cookie-authenticated,
    state-changing requests (POST/PUT/PATCH/DELETE)."""

    async def dispatch(self, request: Request, call_next):
        if request.method in SAFE_METHODS or request.url.path in CSRF_EXEMPT_PATHS:
            return await call_next(request)

        # Only enforce for cookie-based sessions; pure bearer-token API
        # clients (mobile apps, server-to-server) are exempt by design.
        session_cookie = request.cookies.get("zyrstar_session")
        if session_cookie is None:
            return await call_next(request)

        csrf_cookie = request.cookies.get("zyrstar_csrf")
        csrf_header = request.headers.get("x-csrf-token")

        if not csrf_cookie or not csrf_header or csrf_cookie != csrf_header:
            return JSONResponse(status_code=403, content={"detail": "CSRF token missing or invalid"})

        if not validate_csrf_token(session_cookie, csrf_header):
            return JSONResponse(status_code=403, content={"detail": "CSRF token missing or invalid"})

        return await call_next(request)
