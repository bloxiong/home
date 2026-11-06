"""The portal inbox: mail to contact@bloxio.tech and the replies to it.
Incoming mail is copied here by a Cloudflare Worker (workers/inbox) after it has
been forwarded to Gmail. Replies sent from Gmail go through Resend's SMTP server,
and Resend's webhook reports them here; replies from the portal are sent directly."""
import base64
import hashlib
import hmac
import html
import json
import re
import time
from datetime import datetime, timedelta, timezone
from email import policy
from email.parser import BytesParser
from email.utils import getaddresses, parseaddr, parsedate_to_datetime

import httpx
from fastapi import APIRouter, Depends, Header, HTTPException, Request
from pydantic import BaseModel, Field
from sqlalchemy import or_
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from .. import audit, mailer
from ..config import settings
from ..db import get_db
from ..models import Admin, AuditLog, Enquiry, MailMessage, MailThread, now
from ..security import current_admin
from .admin import StatusNotesIn, page

public = APIRouter(prefix="/public", tags=["public"])
admin = APIRouter(prefix="/admin", tags=["admin"], dependencies=[Depends(current_admin)])

MAIL_STATUSES = {"new", "reviewed", "replied", "closed"}
MAX_BODY = 100_000
SUBJECT_MATCH_DAYS = 60


async def raw_body(request: Request) -> bytes:
    return await request.body()


def address(value: str) -> str:
    return parseaddr(value or "")[1].strip().lower()


def bare_subject(subject: str) -> str:
    """'Re: Fwd: Hello' and 'hello' are the same conversation."""
    return re.sub(r"^\s*((re|fw|fwd)\s*:\s*)+", "", subject or "", flags=re.I).strip().casefold()


def header_ids(*values: str | None) -> list[str]:
    return [i for v in values if v for i in re.findall(r"<[^<>\s]+>", v)]


def find_thread(db: Session, ids: list[str], contact: str, subject: str) -> MailThread | None:
    """The message being answered decides; a matching person and subject is the fallback."""
    if ids:
        m = db.query(MailMessage).filter(MailMessage.message_id.in_(ids)).order_by(MailMessage.id.desc()).first()
        if m:
            return db.get(MailThread, m.thread_id)
    wanted = bare_subject(subject)
    if not wanted:
        return None
    since = now() - timedelta(days=SUBJECT_MATCH_DAYS)
    recent = db.query(MailThread).filter(MailThread.contact_email == contact, MailThread.last_message_at >= since) \
        .order_by(MailThread.last_message_at.desc())
    return next((t for t in recent if bare_subject(t.subject) == wanted), None)


def html_to_text(markup: str) -> str:
    text = re.sub(r"(?is)<(script|style|head)\b.*?</\1>", "", markup)
    text = re.sub(r"(?i)<br\s*/?>|</(p|div|tr|li|h[1-6])>", "\n", text)
    text = html.unescape(re.sub(r"<[^>]+>", "", text))
    return re.sub(r"\n{3,}", "\n\n", re.sub(r"[ \t]+", " ", text)).strip()


def read_body(msg) -> str:
    try:
        part = msg.get_body(preferencelist=("plain", "html"))
        if part is None:
            return ""
        content = part.get_content()
        return (html_to_text(content) if part.get_content_subtype() == "html" else content.strip())[:MAX_BODY]
    except (LookupError, ValueError, AttributeError):  # unknown charset or a cut-off message
        return ""


def read_attachments(msg) -> list[str]:
    try:
        return [(a.get_filename() or "attachment")[:200] for a in msg.iter_attachments()][:50]
    except (LookupError, ValueError, AttributeError):
        return []


def sent_at(value: str | None) -> datetime:
    try:
        when = parsedate_to_datetime(value)
    except (TypeError, ValueError):
        return now()
    if when.tzinfo is None:
        when = when.replace(tzinfo=timezone.utc)
    return min(when, now())


def touch(thread: MailThread, when: datetime) -> None:
    thread.last_message_at = max(thread.last_message_at, when)


def save(db: Session) -> bool:
    """False when another copy of the same message got there first (retries, webhook races)."""
    try:
        db.commit()
        return True
    except IntegrityError:
        db.rollback()
        return False


@public.post("/inbound", status_code=204)
def receive_mail(raw: bytes = Depends(raw_body), x_inbound_secret: str = Header(default=""), db: Session = Depends(get_db)):
    """A raw email from the Cloudflare Worker. Safe to send twice."""
    secret = settings().inbound_secret
    if not secret or not hmac.compare_digest(x_inbound_secret, secret):
        raise HTTPException(403, "Mail is received through the Worker only.")
    msg = BytesParser(policy=policy.default).parsebytes(raw)
    name, sender = parseaddr(str(msg.get("From", "")))
    sender = sender.strip().lower()
    # the site's own alerts land here too, and they already appear in the portal
    if not sender or sender in (address(settings().mail_from), settings().inbox_address.lower()):
        return
    message_id = (header_ids(str(msg.get("Message-ID", ""))) or [f"<{hashlib.sha256(raw).hexdigest()}@inbound>"])[0][:500]
    if db.query(MailMessage).filter(MailMessage.message_id == message_id).first():
        return
    subject = str(msg.get("Subject", ""))[:300]
    when = sent_at(str(msg.get("Date", "")) or None)
    ids = header_ids(str(msg.get("In-Reply-To", "")), str(msg.get("References", "")))
    thread = find_thread(db, ids, sender, subject)
    if not thread:
        thread = MailThread(contact_email=sender, subject=subject, last_message_at=when)
        db.add(thread)
        db.flush()
    thread.contact_name = thread.contact_name or name[:200]
    thread.status = "new"  # they wrote again, so it needs looking at again
    touch(thread, when)
    to = [a for _, a in getaddresses([str(v) for v in msg.get_all("To", [])]) if a][:50]
    db.add(MailMessage(thread_id=thread.id, direction="in", message_id=message_id, from_email=sender, from_name=name[:200],
                       to=to, subject=subject, body=read_body(msg), attachments=read_attachments(msg), source="worker",
                       created_at=when))
    save(db)


def valid_signature(secret: str, msg_id: str, timestamp: str, body: bytes, signatures: str) -> bool:
    """Resend signs webhooks with Svix: base64 HMAC-SHA256 of 'id.timestamp.body'."""
    try:
        if abs(time.time() - int(timestamp)) > 300:
            return False
        key = base64.b64decode(secret.removeprefix("whsec_"))
    except ValueError:
        return False
    expected = base64.b64encode(hmac.new(key, f"{msg_id}.{timestamp}.".encode() + body, hashlib.sha256).digest()).decode()
    return any(hmac.compare_digest(s.split(",", 1)[-1], expected) for s in signatures.split())


def fetch_sent_text(email_id: str) -> str:
    """The text of a sent email. Needs a Resend key that can read; without one the
    reply is still tracked, just without its text."""
    key = settings().resend_api_key
    if not key:
        return ""
    try:
        r = httpx.get(f"https://api.resend.com/emails/{email_id}", timeout=8, headers={"Authorization": f"Bearer {key}"})
        if r.status_code >= 300:
            return ""
        d = r.json()
        return (d.get("text") or html_to_text(d.get("html") or ""))[:MAX_BODY]
    except (httpx.HTTPError, ValueError):
        return ""


def mark_enquiries_replied(db: Session, email: str) -> None:
    for e in db.query(Enquiry).filter(Enquiry.email.ilike(email), Enquiry.status.in_(("new", "reviewed"))):
        db.add(AuditLog(admin_email="system", action="enquiry.update", entity="enquiry", entity_id=str(e.id),
                        before={"status": e.status}, after={"status": "replied"},
                        summary=f"Marked enquiry from {e.name} replied (email sent)"))
        e.status = "replied"


@public.post("/resend-webhook", status_code=204)
def resend_event(raw: bytes = Depends(raw_body), svix_id: str = Header(default=""), svix_timestamp: str = Header(default=""),
                 svix_signature: str = Header(default=""), db: Session = Depends(get_db)):
    """Resend reports every email it sends. Mail from the inbox address is a reply to track."""
    secret = settings().resend_webhook_secret
    if not secret or not valid_signature(secret, svix_id, svix_timestamp, raw, svix_signature):
        raise HTTPException(403, "Bad signature.")
    event = json.loads(raw)
    data = event.get("data") or {}
    inbox = settings().inbox_address.lower()
    if event.get("type") != "email.sent" or address(data.get("from", "")) != inbox:
        return
    email_id, message_id = data.get("email_id"), (data.get("message_id") or "")[:500] or None
    known = db.query(MailMessage).filter(MailMessage.resend_id == email_id).first()
    if known:  # sent from the portal: all that was missing is the id replies will quote
        if message_id and not known.message_id:
            known.message_id = message_id
            save(db)
        return
    to = [address(t) for t in data.get("to") or [] if address(t) and address(t) != inbox]
    if not to:
        return
    headers = {(h.get("name") or "").lower(): h.get("value") for h in data.get("headers") or []}
    subject = (data.get("subject") or "")[:300]
    thread = find_thread(db, header_ids(headers.get("in-reply-to"), headers.get("references")), to[0], subject)
    if not thread:  # a new conversation started from Gmail
        thread = MailThread(contact_email=to[0], subject=subject)
        db.add(thread)
        db.flush()
    thread.status = "replied"
    touch(thread, now())
    db.add(MailMessage(thread_id=thread.id, direction="out", message_id=message_id, resend_id=email_id, from_email=inbox,
                       to=to, subject=subject, body=fetch_sent_text(email_id), source="smtp"))
    for person in to:
        mark_enquiries_replied(db, person)
    save(db)


# ── reading and replying ────────────────────
def message_out(m: MailMessage) -> dict:
    return {"id": m.id, "direction": m.direction, "from_email": m.from_email, "from_name": m.from_name, "to": m.to,
            "subject": m.subject, "body": m.body, "attachments": m.attachments, "source": m.source,
            "sent_by": m.sent_by, "created_at": m.created_at}


def thread_out(db: Session, t: MailThread) -> dict:
    last = db.query(MailMessage).filter(MailMessage.thread_id == t.id).order_by(MailMessage.created_at.desc()).first()
    return {"id": t.id, "contact_email": t.contact_email, "contact_name": t.contact_name, "subject": t.subject,
            "status": t.status, "notes": t.notes, "last_message_at": t.last_message_at, "created_at": t.created_at,
            "count": db.query(MailMessage).filter(MailMessage.thread_id == t.id).count(),
            "last_direction": last.direction if last else None, "snippet": (last.body[:160] if last else "")}


def get_thread(tid: int, db: Session) -> MailThread:
    t = db.get(MailThread, tid)
    if not t:
        raise HTTPException(404, "Conversation not found.")
    return t


@admin.get("/inbox")
def list_threads(q: str | None = None, status: str | None = None, limit: int = 25, offset: int = 0, db: Session = Depends(get_db)):
    query = db.query(MailThread)
    if q:
        like = f"%{q}%"
        match = db.query(MailMessage.thread_id).filter(MailMessage.body.ilike(like))
        query = query.filter(or_(MailThread.contact_email.ilike(like), MailThread.contact_name.ilike(like),
                                 MailThread.subject.ilike(like), MailThread.id.in_(match)))
    if status:
        query = query.filter(MailThread.status == status)
    query = query.order_by(MailThread.last_message_at.desc())
    return {"total": query.count(), "items": [thread_out(db, t) for t in page(query, limit, offset)]}


@admin.get("/inbox/{tid}")
def read_thread(tid: int, db: Session = Depends(get_db)):
    t = get_thread(tid, db)
    msgs = db.query(MailMessage).filter(MailMessage.thread_id == tid).order_by(MailMessage.created_at, MailMessage.id).all()
    return {**thread_out(db, t), "messages": [message_out(m) for m in msgs]}


@admin.patch("/inbox/{tid}")
def update_thread(tid: int, body: StatusNotesIn, me: Admin = Depends(current_admin), db: Session = Depends(get_db)):
    t = get_thread(tid, db)
    before = {"status": t.status, "notes": t.notes}
    if body.status is not None:
        if body.status not in MAIL_STATUSES:
            raise HTTPException(400, "Unknown status.")
        t.status = body.status
    if body.notes is not None:
        t.notes = body.notes
    audit.record(db, me, "inbox.update", entity="mail", entity_id=tid, before=before,
                 after={"status": t.status, "notes": t.notes}, summary=f"Updated conversation with {t.contact_email}")
    db.commit()
    return thread_out(db, t)


class ReplyIn(BaseModel):
    body: str = Field(min_length=1, max_length=20000)


@admin.post("/inbox/{tid}/reply")
def reply(tid: int, body: ReplyIn, me: Admin = Depends(current_admin), db: Session = Depends(get_db)):
    t = get_thread(tid, db)
    s = settings()
    ids = [m for (m,) in db.query(MailMessage.message_id).filter(MailMessage.thread_id == tid, MailMessage.message_id.isnot(None))
           .order_by(MailMessage.created_at, MailMessage.id)]
    headers = {"In-Reply-To": ids[-1], "References": " ".join(ids[-10:])} if ids else None
    subject = t.subject if bare_subject(t.subject) != (t.subject or "").strip().casefold() else f"Re: {t.subject}"
    entry = mailer.send(db, to=[t.contact_email], subject=subject, body_html=mailer.text_to_html(body.body), kind="inbox", greeting="",
                        sent_by=me.email, sign_name=me.name or "The BLOXio team", from_addr=s.inbox_from, reply_to=s.inbox_address, headers=headers)
    if entry.status == "failed":
        db.commit()  # keeps the failure in the email log
        raise HTTPException(502, "The email could not be sent. Try again shortly.")
    t.status = "replied"
    touch(t, now())
    db.add(MailMessage(thread_id=tid, direction="out", resend_id=getattr(entry, "provider_id", None), from_email=s.inbox_address,
                       to=[t.contact_email], subject=subject, body=body.body, source="portal", sent_by=me.email))
    mark_enquiries_replied(db, t.contact_email)
    audit.record(db, me, "inbox.reply", entity="mail", entity_id=tid, summary=f"Replied to {t.contact_email}", after={"subject": subject})
    db.commit()
    return read_thread(tid, db)
