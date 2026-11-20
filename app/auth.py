"""Password hashing, admin session and CSRF helpers."""
import hashlib
import hmac
import secrets

from fastapi import HTTPException, Request

ITERATIONS = 240_000


def hash_password(password: str) -> str:
    salt = secrets.token_hex(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), salt.encode(), ITERATIONS).hex()
    return f"pbkdf2${ITERATIONS}${salt}${digest}"


def verify_password(password: str, stored: str) -> bool:
    try:
        _, iterations, salt, digest = stored.split("$")
    except ValueError:
        return False
    candidate = hashlib.pbkdf2_hmac("sha256", password.encode(), salt.encode(), int(iterations)).hex()
    return hmac.compare_digest(candidate, digest)


def current_user(request: Request) -> str | None:
    return request.session.get("user")


class LoginRequired(Exception):
    """Raised when an admin page is opened without a session; redirects to login."""


def require_user(request: Request) -> str:
    user = current_user(request)
    if not user:
        raise LoginRequired()
    return user


def csrf_token(request: Request) -> str:
    token = request.session.get("csrf")
    if not token:
        token = secrets.token_urlsafe(24)
        request.session["csrf"] = token
    return token


def check_csrf(request: Request, token: str | None) -> None:
    expected = request.session.get("csrf")
    if not expected or not token or not hmac.compare_digest(expected, token):
        raise HTTPException(status_code=400, detail="This form expired. Reload the page and try again.")
