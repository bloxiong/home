from datetime import datetime, timezone

from sqlalchemy import JSON, Boolean, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from .db import Base


def now() -> datetime:
    return datetime.now(timezone.utc)


class Admin(Base):
    __tablename__ = "admins"
    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(120), default="")
    password_hash: Mapped[str | None] = mapped_column(String(255), nullable=True)
    is_super: Mapped[bool] = mapped_column(Boolean, default=False)  # may add/remove admins
    active: Mapped[bool] = mapped_column(Boolean, default=True)
    token_version: Mapped[int] = mapped_column(Integer, default=0)  # bumps on password change
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now)
    created_by: Mapped[str | None] = mapped_column(String(255), nullable=True)
    last_login_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)


class PasswordToken(Base):
    """Single-use link to set or reset a password (stored hashed)."""
    __tablename__ = "password_tokens"
    id: Mapped[int] = mapped_column(primary_key=True)
    admin_id: Mapped[int] = mapped_column(ForeignKey("admins.id", ondelete="CASCADE"), index=True)
    token_hash: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    purpose: Mapped[str] = mapped_column(String(20))  # invite | reset
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    used_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)


class SurveyResponse(Base):
    __tablename__ = "survey_responses"
    id: Mapped[int] = mapped_column(primary_key=True)
    data: Mapped[dict] = mapped_column(JSON)
    email: Mapped[str | None] = mapped_column(String(255), nullable=True, index=True)
    respondent_type: Mapped[str | None] = mapped_column(String(120), nullable=True)
    location: Mapped[str | None] = mapped_column(String(255), nullable=True)
    wants_updates: Mapped[bool] = mapped_column(Boolean, default=False)  # consent to be contacted
    status: Mapped[str] = mapped_column(String(20), default="new")  # new | reviewed | contacted | archived
    notes: Mapped[str] = mapped_column(Text, default="")
    source: Mapped[str] = mapped_column(String(40), default="site")  # site | sheet-import
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now, index=True)


class Enquiry(Base):
    __tablename__ = "enquiries"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(160))
    email: Mapped[str] = mapped_column(String(255), index=True)
    phone: Mapped[str] = mapped_column(String(60), default="")
    org: Mapped[str] = mapped_column(String(200), default="")
    topic: Mapped[str] = mapped_column(String(60), default="")
    message: Mapped[str] = mapped_column(Text)
    status: Mapped[str] = mapped_column(String(20), default="new")  # new | replied | closed
    notes: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now, index=True)


class ContentDoc(Base):
    """One editable section of site content (e.g. PRODUCTS, FAQS)."""
    __tablename__ = "content"
    key: Mapped[str] = mapped_column(String(60), primary_key=True)
    draft: Mapped[dict | list] = mapped_column(JSON)
    published: Mapped[dict | list] = mapped_column(JSON)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now)
    updated_by: Mapped[str | None] = mapped_column(String(255), nullable=True)
    published_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    published_by: Mapped[str | None] = mapped_column(String(255), nullable=True)


class EmailLog(Base):
    __tablename__ = "email_log"
    id: Mapped[int] = mapped_column(primary_key=True)
    kind: Mapped[str] = mapped_column(String(40))  # notify | confirm | compose | invite | reset
    to: Mapped[list] = mapped_column(JSON)
    subject: Mapped[str] = mapped_column(String(300))
    body: Mapped[str] = mapped_column(Text, default="")
    status: Mapped[str] = mapped_column(String(20))  # sent | failed | logged
    error: Mapped[str] = mapped_column(Text, default="")
    sent_by: Mapped[str | None] = mapped_column(String(255), nullable=True)  # admin email, or None = system
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now, index=True)


class AuditLog(Base):
    """Who changed what, and when. Visible to every admin."""
    __tablename__ = "audit_log"
    id: Mapped[int] = mapped_column(primary_key=True)
    admin_email: Mapped[str] = mapped_column(String(255), index=True)
    action: Mapped[str] = mapped_column(String(60))  # e.g. content.update, admin.create
    entity: Mapped[str] = mapped_column(String(60), default="")
    entity_id: Mapped[str] = mapped_column(String(120), default="")
    summary: Mapped[str] = mapped_column(String(500), default="")
    before: Mapped[dict | list | None] = mapped_column(JSON, nullable=True)
    after: Mapped[dict | list | None] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now, index=True)


class Visit(Base):
    """One page view. No cookies and no IP addresses: `visitor` is a hash of
    IP + browser + day + a server secret, so the same person counts once per
    day and can't be traced across days. Location is approximate (city level,
    from Vercel's edge)."""
    __tablename__ = "visits"
    id: Mapped[int] = mapped_column(primary_key=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now, index=True)
    host: Mapped[str] = mapped_column(String(80), default="", index=True)
    path: Mapped[str] = mapped_column(String(300), default="/")
    referrer: Mapped[str] = mapped_column(String(200), default="")  # host only, e.g. google.com
    country: Mapped[str] = mapped_column(String(2), default="", index=True)
    region: Mapped[str] = mapped_column(String(80), default="")
    city: Mapped[str] = mapped_column(String(120), default="")
    device: Mapped[str] = mapped_column(String(10), default="")  # mobile | tablet | desktop
    browser: Mapped[str] = mapped_column(String(20), default="")
    visitor: Mapped[str] = mapped_column(String(16), index=True)
