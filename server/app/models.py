from datetime import datetime, timezone

from sqlalchemy import JSON, Boolean, DateTime, ForeignKey, Index, Integer, LargeBinary, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

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
    status: Mapped[str] = mapped_column(String(20), default="new")  # new | reviewed | replied | closed
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


class MailSection(Base):
    """A heading senders are filed under: Application, Inquiry, Project... Admins add their own."""
    __tablename__ = "mail_sections"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(60), unique=True)
    created_by: Mapped[str | None] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now)


class MailContact(Base):
    """Which section a sender is filed under. Kept per mailbox, so filing someone
    in a personal mailbox says nothing to admins who can't see that mailbox."""
    __tablename__ = "mail_contacts"
    __table_args__ = (Index("uq_mail_contacts_mailbox_email", "mailbox", "email", unique=True),)
    id: Mapped[int] = mapped_column(primary_key=True)
    mailbox: Mapped[str] = mapped_column(String(255))
    email: Mapped[str] = mapped_column(String(255))
    section_id: Mapped[int | None] = mapped_column(ForeignKey("mail_sections.id", ondelete="SET NULL"), nullable=True, index=True)
    kind: Mapped[str] = mapped_column(String(10), default="person", server_default="person")  # person | platform
    kind_manual: Mapped[bool] = mapped_column(Boolean, default=False, server_default="false")  # an admin's choice always wins


class MailThread(Base):
    """A conversation with someone who emails contact@bloxio.tech."""
    __tablename__ = "mail_threads"
    id: Mapped[int] = mapped_column(primary_key=True)
    mailbox: Mapped[str] = mapped_column(String(255), default="contact@bloxio.tech", server_default="contact@bloxio.tech", index=True)
    contact_email: Mapped[str] = mapped_column(String(255), index=True)
    contact_name: Mapped[str] = mapped_column(String(200), default="")
    subject: Mapped[str] = mapped_column(String(300), default="")
    status: Mapped[str] = mapped_column(String(20), default="new", index=True)  # new | reviewed | replied | closed
    notes: Mapped[str] = mapped_column(Text, default="")
    last_message_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now)


class MailMessage(Base):
    """One email in a thread: received through the Cloudflare Worker, or sent
    (from Gmail through Resend's SMTP server, or from the portal)."""
    __tablename__ = "mail_messages"
    # the same email can reach two mailboxes, and each keeps its own copy
    __table_args__ = (Index("uq_mail_messages_mailbox_message", "mailbox", "message_id", unique=True),)
    id: Mapped[int] = mapped_column(primary_key=True)
    mailbox: Mapped[str] = mapped_column(String(255), default="contact@bloxio.tech", server_default="contact@bloxio.tech")
    thread_id: Mapped[int] = mapped_column(ForeignKey("mail_threads.id", ondelete="CASCADE"), index=True)
    direction: Mapped[str] = mapped_column(String(3))  # in | out
    message_id: Mapped[str | None] = mapped_column(String(500), nullable=True)  # links replies to it
    resend_id: Mapped[str | None] = mapped_column(String(80), nullable=True, unique=True)  # outgoing only
    from_email: Mapped[str] = mapped_column(String(255), default="")
    from_name: Mapped[str] = mapped_column(String(200), default="")
    to: Mapped[list] = mapped_column(JSON, default=list)
    subject: Mapped[str] = mapped_column(String(300), default="")
    body: Mapped[str] = mapped_column(Text, default="")  # plain text, for search and previews
    html: Mapped[str] = mapped_column(Text, default="", server_default="")  # shown only in a sandboxed frame
    attachments: Mapped[list] = mapped_column(JSON, default=list)  # every file name, kept or not
    source: Mapped[str] = mapped_column(String(10))  # worker | smtp | portal
    sent_by: Mapped[str | None] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now, index=True)
    files: Mapped[list["MailAttachment"]] = relationship(cascade="all, delete-orphan", passive_deletes=True)


class MailAttachment(Base):
    """A file that came with an email. Very large files stay in Gmail only."""
    __tablename__ = "mail_attachments"
    id: Mapped[int] = mapped_column(primary_key=True)
    mail_message_id: Mapped[int] = mapped_column(ForeignKey("mail_messages.id", ondelete="CASCADE"), index=True)
    name: Mapped[str] = mapped_column(String(200), default="attachment")
    size: Mapped[int] = mapped_column(Integer, default=0)
    data: Mapped[bytes] = mapped_column(LargeBinary, deferred=True)  # never loaded just to list a conversation


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
