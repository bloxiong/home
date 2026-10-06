from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

from .. import audit, mailer
from ..config import settings
from ..db import get_db
from ..models import Admin, now
from ..security import (check_strength, current_admin, hash_password, make_token, new_password_token,
                        use_password_token, verify_password)

router = APIRouter(prefix="/auth", tags=["auth"])


def admin_out(a: Admin) -> dict:
    return {"id": a.id, "email": a.email, "name": a.name, "is_super": a.is_super, "active": a.active,
            "has_password": bool(a.password_hash), "created_at": a.created_at, "created_by": a.created_by,
            "last_login_at": a.last_login_at}


class LoginIn(BaseModel):
    email: EmailStr
    password: str


@router.post("/login")
def login(body: LoginIn, db: Session = Depends(get_db)):
    a = db.query(Admin).filter(Admin.email == str(body.email).lower()).first()
    if not a or not a.active or not verify_password(body.password, a.password_hash):
        raise HTTPException(401, "Wrong email or password.")
    a.last_login_at = now()
    db.commit()
    return {"token": make_token(a), "admin": admin_out(a)}


@router.get("/me")
def me(a: Admin = Depends(current_admin)):
    return admin_out(a)


def send_password_link(db: Session, a: Admin, purpose: str, invited_by: str | None = None,
                       sent_by: str | None = None) -> None:
    raw = new_password_token(db, a, purpose)
    link = f"{settings().admin_url}/reset?token={raw}"
    if purpose == "invite":
        subject, title = "You have been added as a BLOXio admin", "Welcome to the BLOXio admin"
        text = (f"{invited_by or 'A founder'} added you as an admin. Choose your password to sign in.\n\n"
                "This link works once and expires in 72 hours.")
    else:
        subject, title = "Reset your BLOXio admin password", "Reset your password"
        text = ("Someone asked to reset the password for this admin account. If it was you, choose a new "
                "password below. The link works once and expires in 1 hour.\n\nIf it wasn't you, ignore this email.")
    mailer.send(db, to=[a.email], kind=purpose, subject=subject, title=title, sent_by=sent_by,
                body_html=mailer.text_to_html(text)
                + f"<p style=\"margin:16px 0\"><a href=\"{link}\" style=\"display:inline-block;background:#5FCB93;color:#0B0D0C;"
                  f"padding:10px 18px;border-radius:10px;text-decoration:none;font-weight:bold\">Set my password</a></p>")


class ForgotIn(BaseModel):
    email: EmailStr


@router.post("/forgot")
def forgot(body: ForgotIn, db: Session = Depends(get_db)):
    a = db.query(Admin).filter(Admin.email == str(body.email).lower(), Admin.active.is_(True)).first()
    if a:
        send_password_link(db, a, "reset")
        db.commit()
    # Same answer either way, so the form can't be used to discover admin emails
    return {"ok": True}


class ResetIn(BaseModel):
    token: str
    password: str


@router.post("/reset")
def reset(body: ResetIn, db: Session = Depends(get_db)):
    check_strength(body.password)
    a = use_password_token(db, body.token)
    a.password_hash = hash_password(body.password)
    a.token_version += 1  # signs out every old session
    a.last_login_at = now()
    audit.record(db, a, "auth.password_set", entity="admin", entity_id=a.id, summary="Set a new password from an email link")
    db.commit()
    return {"token": make_token(a), "admin": admin_out(a)}


class ChangeIn(BaseModel):
    current_password: str
    new_password: str


@router.post("/change-password")
def change_password(body: ChangeIn, a: Admin = Depends(current_admin), db: Session = Depends(get_db)):
    if not verify_password(body.current_password, a.password_hash):
        raise HTTPException(400, "Your current password is not right.")
    check_strength(body.new_password)
    a = db.merge(a)
    a.password_hash = hash_password(body.new_password)
    a.token_version += 1
    audit.record(db, a, "auth.password_change", entity="admin", entity_id=a.id, summary="Changed their password")
    db.commit()
    return {"token": make_token(a), "admin": admin_out(a)}
