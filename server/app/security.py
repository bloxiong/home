import hashlib
import secrets
from datetime import datetime, timedelta, timezone

import jwt
from argon2 import PasswordHasher
from argon2.exceptions import InvalidHashError, VerifyMismatchError
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from .config import settings
from .db import get_db
from .models import Admin, PasswordToken, now

_hasher = PasswordHasher()
_bearer = HTTPBearer(auto_error=False)

MIN_PASSWORD = 10


def hash_password(pw: str) -> str:
    return _hasher.hash(pw)


def verify_password(pw: str, hashed: str | None) -> bool:
    if not hashed:
        return False
    try:
        return _hasher.verify(hashed, pw)
    except (VerifyMismatchError, InvalidHashError):
        return False


def check_strength(pw: str) -> None:
    if len(pw) < MIN_PASSWORD:
        raise HTTPException(400, f"Password must be at least {MIN_PASSWORD} characters.")
    if not (any(c.islower() for c in pw) and any(c.isupper() for c in pw) and any(c.isdigit() for c in pw)):
        raise HTTPException(400, "Use upper and lower case letters and at least one number.")


def make_token(admin: Admin) -> str:
    payload = {
        "sub": str(admin.id),
        "v": admin.token_version,
        "exp": datetime.now(timezone.utc) + timedelta(hours=settings().jwt_hours),
    }
    return jwt.encode(payload, settings().jwt_secret, algorithm="HS256")


def current_admin(
    creds: HTTPAuthorizationCredentials | None = Depends(_bearer),
    db: Session = Depends(get_db),
) -> Admin:
    if not creds:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Sign in required.")
    try:
        payload = jwt.decode(creds.credentials, settings().jwt_secret, algorithms=["HS256"])
    except jwt.PyJWTError:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Session expired. Sign in again.")
    admin = db.get(Admin, int(payload["sub"]))
    if not admin or not admin.active or admin.token_version != payload.get("v"):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Session expired. Sign in again.")
    return admin


def super_admin(admin: Admin = Depends(current_admin)) -> Admin:
    if not admin.is_super:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Only Owen and Austin can manage admins.")
    return admin


# ── set / reset password links ────────────────────────────────────────

def _digest(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()


def new_password_token(db: Session, admin: Admin, purpose: str) -> str:
    """Returns the raw token (only ever sent by email); stores its hash."""
    raw = secrets.token_urlsafe(32)
    hours = 72 if purpose == "invite" else 1
    db.add(PasswordToken(admin_id=admin.id, token_hash=_digest(raw), purpose=purpose,
                         expires_at=now() + timedelta(hours=hours)))
    db.flush()
    return raw


def use_password_token(db: Session, raw: str) -> Admin:
    tok = db.query(PasswordToken).filter_by(token_hash=_digest(raw)).first()
    if not tok or tok.used_at or tok.expires_at.replace(tzinfo=tok.expires_at.tzinfo or timezone.utc) < now():
        raise HTTPException(400, "This link has expired or was already used. Request a new one.")
    tok.used_at = now()
    admin = db.get(Admin, tok.admin_id)
    if not admin or not admin.active:
        raise HTTPException(400, "This account is no longer active.")
    return admin
