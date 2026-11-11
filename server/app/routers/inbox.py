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
from urllib.parse import quote

import httpx
from fastapi import APIRouter, Depends, Header, HTTPException, Request, Response
from pydantic import BaseModel, Field
from sqlalchemy import func, or_
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from .. import audit, mailer
from ..config import settings
from ..db import get_db
from ..inbox_access import is_platform_thread, is_shared, tracked_mailboxes, visible_mailboxes
from ..models import Admin, AuditLog, Enquiry, MailAttachment, MailContact, MailMessage, MailSection, MailThread, now
from ..security import current_admin
from .admin import StatusNotesIn, page

public = APIRouter(prefix="/public", tags=["public"])
admin = APIRouter(prefix="/admin", tags=["admin"], dependencies=[Depends(current_admin)])

MAIL_STATUSES = {"new", "reviewed", "replied", "closed"}
MAX_BODY = 100_000
MAX_HTML = 500_000
MAX_FILE = 15_000_000
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


def find_thread(db: Session, mailbox: str, ids: list[str], contact: str, subject: str, open_only: bool = False) -> MailThread | None:
    """The message being answered decides; a matching person and subject is the fallback.
    open_only: a closed conversation stays closed, so new mail starts another one."""
    if ids:
        m = db.query(MailMessage).filter(MailMessage.mailbox == mailbox, MailMessage.message_id.in_(ids)).order_by(MailMessage.id.desc()).first()
        t = db.get(MailThread, m.thread_id) if m else None
        if t and not (open_only and t.status == "closed"):
            return t
    wanted = bare_subject(subject)
    if not wanted:
        return None
    since = now() - timedelta(days=SUBJECT_MATCH_DAYS)
    recent = db.query(MailThread).filter(MailThread.mailbox == mailbox, MailThread.contact_email == contact, MailThread.last_message_at >= since) \
        .order_by(MailThread.last_message_at.desc())
    return next((t for t in recent if bare_subject(t.subject) == wanted and not (open_only and t.status == "closed")), None)


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


def read_html(msg) -> str:
    try:
        part = msg.get_body(preferencelist=("html",))
        content = part.get_content() if part is not None else ""
    except (LookupError, ValueError, AttributeError):
        return ""
    return content if len(content) <= MAX_HTML else ""


def strip_quoted(text: str) -> str:
    """The new part of a reply, without the earlier emails quoted below it."""
    text = re.split(r"(?m)^\s*(On .{5,200}wrote:|-{2,}\s*Original Message\s*-{2,}|From: .+\n(Sent|Date): )", text or "", maxsplit=1)[0]
    return "\n".join(line for line in text.splitlines() if not line.startswith(">")).strip()


def read_attachments(msg) -> list[str]:
    try:
        return [(a.get_filename() or "attachment")[:200] for a in msg.iter_attachments()][:50]
    except (LookupError, ValueError, AttributeError):
        return []


def read_files(msg) -> list[MailAttachment]:
    files = []
    try:
        for a in list(msg.iter_attachments())[:50]:
            data = a.get_payload(decode=True)
            if data and len(data) <= MAX_FILE:
                files.append(MailAttachment(name=(a.get_filename() or "attachment")[:200], size=len(data), data=data))
    except (LookupError, ValueError, AttributeError):
        pass
    return files


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


def apply_status(thread: MailThread, status: str, when: datetime, had_messages: bool) -> None:
    """Only the newest email decides; importing an older one leaves the status alone."""
    if not had_messages or when >= thread.last_message_at:
        thread.status = status
    touch(thread, when)


def is_ours(sender: str, mailbox: str) -> bool:
    """Our own mail coming back: the site's alerts and the bounce addresses they go out with."""
    return sender in (address(settings().mail_from), mailbox) or sender.endswith("@send.bloxio.tech")


AUTOMATED_SENDER = re.compile(
    r"^(no[-_.]?reply|do[-_.]?not[-_.]?reply|mailer[-_.]?daemon|postmaster|bounces?|notifications?|notify|newsletters?|news|alerts?|updates?|security|"
    r"verify|verification|accounts?|billing|invoices?|receipts?|orders?|marketing|promotions?|mailer|automated|digest|support\+|info\+)($|[-_.+@])"
    r"|[-_.+](no[-_.]?reply|bounces?|notifications?|newsletters?|alerts?)($|[-_.+])", re.I)
PLATFORM_SUBJECT = re.compile(
    r"\b(verification code|security code|login code|one[- ]time (pass)?code|otp|verify your (email|account)|confirm your (email|account|registration)|"
    r"reset your password|password reset|security alert|new (login|sign[- ]in|device)|sign[- ]in attempt|unsubscribe|your receipt|your invoice|"
    r"payment (received|successful|failed)|welcome to|invited you to|mentioned you|new follower|started following|liked your|commented on)\b", re.I)


PLATFORM_DOMAINS = ("instagram.com", "facebookmail.com", "meta.com", "x.com", "twitter.com", "linkedin.com", "tiktok.com", "youtube.com",
                    "pinterest.com", "snapchat.com", "whatsapp.com", "telegram.org", "accounts.google.com", "github.com", "gitlab.com", "vercel.com",
                    "render.com", "resend.com", "neon.tech", "cloudflare.com", "stripe.com", "paystack.com", "flutterwave.com", "notion.so", "slack.com",
                    "zoom.us", "canva.com", "figma.com", "mailchimp.com", "substack.com", "medium.com", "quora.com")
BULK_HEADERS = ("List-Id", "List-Unsubscribe", "X-Autoreply", "X-Auto-Response-Suppress", "Feedback-ID", "X-Campaign", "X-Mailchimp-Campaign",
                "X-SG-EID", "X-Mailgun-Tag", "X-SES-Outgoing", "X-MC-User", "X-Marketo-Mail")


def platform_subject(subject: str) -> bool:
    return bool(PLATFORM_SUBJECT.search(subject or ""))


def platform_address(sender: str) -> bool:
    """The address alone says it's a service, not a person. All an import has to go on."""
    local, _, domain = sender.partition("@")
    if domain.endswith("bloxio.tech"):
        return False
    return bool(AUTOMATED_SENDER.search(local)) or any(domain == d or domain.endswith(f".{d}") for d in PLATFORM_DOMAINS)


def platform_mail(msg, sender: str) -> bool:
    """The address, or the headers bulk and automated mail carries."""
    if sender.endswith("bloxio.tech"):
        return False
    return platform_address(sender) or str(msg.get("Auto-Submitted", "no")).strip().lower() != "no" or any(msg.get(h) for h in BULK_HEADERS) \
        or str(msg.get("Precedence", "")).strip().lower() in ("bulk", "list", "junk", "auto_reply") \
        or str(msg.get("Return-Path", "")).strip() == "<>" or platform_subject(str(msg.get("Subject", "")))


def is_automated(msg, sender: str) -> bool:
    """Never answer a machine, a mailing list, or a colleague: two auto-repliers can
    write to each other forever, and spoofed senders would get mail from us."""
    if sender.endswith("bloxio.tech") or platform_mail(msg, sender):
        return True
    return bool(re.search(r"\b(dmarc|spf)=fail", str(msg.get("Authentication-Results", "")), re.I))


def mark_platform(db: Session, mailbox: str, email: str) -> None:
    """Files a sender under Platforms, unless an admin has said otherwise. Committed on
    its own, so two emails arriving together can't cost either of them."""
    db.execute(insert(MailContact).values(mailbox=mailbox, email=email, kind="platform", kind_manual=False).on_conflict_do_nothing(
        index_elements=["mailbox", "email"]))
    db.query(MailContact).filter(MailContact.mailbox == mailbox, MailContact.email == email, MailContact.kind_manual.is_(False)).update({"kind": "platform"})
    db.commit()


def sort_existing_senders(db: Session) -> None:
    subjects: dict[tuple[str, str], list[str]] = {}
    for mailbox, email, subject in db.query(MailMessage.mailbox, MailThread.contact_email, MailMessage.subject).join(MailThread, MailThread.id == MailMessage.thread_id) \
            .filter(MailMessage.direction == "in").all():
        subjects.setdefault((mailbox, email), []).append(subject)
    for mailbox, email in db.query(MailThread.mailbox, MailThread.contact_email).distinct().all():
        seen = subjects.get((mailbox, email), [])
        if platform_address(email) or (seen and all(platform_subject(x) for x in seen)):
            mark_platform(db, mailbox, email)


def mark_imports_read(db: Session) -> int:
    """Conversations whose newest incoming email came from an import, not live."""
    latest = db.query(MailMessage.thread_id, MailMessage.source).filter(MailMessage.direction == "in") \
        .distinct(MailMessage.thread_id).order_by(MailMessage.thread_id, MailMessage.created_at.desc(), MailMessage.id.desc()).all()
    ids = [tid for tid, source in latest if source == "log"]
    if not ids:
        return 0
    n = db.query(MailThread).filter(MailThread.id.in_(ids), MailThread.status == "new").update({"status": "reviewed"}, synchronize_session=False)
    db.commit()
    return n


def acknowledge(db: Session, thread: MailThread, message_id: str, subject: str, name: str) -> None:
    """The automatic reply from no-reply: threaded under their email, and answering
    it reaches the mailbox they wrote to."""
    s = settings()
    owner = db.query(Admin).filter(func.lower(Admin.email) == thread.mailbox).first()
    sign = owner.name if owner and owner.name and not is_shared(thread.mailbox) else "The BLOXio team"
    who = sign if not is_shared(thread.mailbox) else "BLOXio"
    text = f"Thanks for contacting {who}. This is an automatic message to confirm that your email was received. You will get a reply soon."
    reply_subject = subject if bare_subject(subject) != subject.strip().casefold() else f"Re: {subject}".strip()
    entry = mailer.send(db, to=[thread.contact_email], subject=reply_subject, greeting=f"Hello {name.split()[0]}," if name.strip() else "Hello,",
                        body_html=mailer.text_to_html(text), kind="auto", sign_name=sign, reply_to=thread.mailbox,
                        # a copy for the mailbox's own Gmail; it comes back from no-reply, which the inbox ignores
                        bcc=[thread.mailbox],
                        headers={"In-Reply-To": message_id, "References": message_id, "Auto-Submitted": "auto-replied", "X-Auto-Response-Suppress": "All"},
                        logged=is_shared(thread.mailbox))
    if entry.status != "sent":
        db.commit()  # keeps any failure in the email log
        return
    db.add(MailMessage(thread_id=thread.id, mailbox=thread.mailbox, direction="out", resend_id=getattr(entry, "provider_id", None), from_email=address(s.mail_from),
                       from_name="BLOXio", to=[thread.contact_email], subject=reply_subject, body=text, html=entry.body, source="auto"))
    save(db)


def store_inbound(db: Session, mailbox: str, raw: bytes, live: bool = False) -> bool:
    """Keeps one raw email. True if anything was added; safe to run twice. Only mail
    arriving now (live) can reopen nothing and earn an automatic reply; imports never do."""
    msg = BytesParser(policy=policy.default).parsebytes(raw)
    name, sender = parseaddr(str(msg.get("From", "")))
    sender = sender.strip().lower()
    if not sender or is_ours(sender, mailbox):
        return False
    message_id = (header_ids(str(msg.get("Message-ID", ""))) or [f"<{hashlib.sha256(raw).hexdigest()}@inbound>"])[0][:500]
    text, markup = read_body(msg), read_html(msg)
    known = db.query(MailMessage).filter(MailMessage.mailbox == mailbox, MailMessage.message_id == message_id).first()
    if known:  # imported earlier from Cloudflare's log, which has no content, or kept before files were
        files = [] if db.query(MailAttachment.id).filter(MailAttachment.mail_message_id == known.id).first() else read_files(msg)
        empty = not (known.body or known.html) and bool(text or markup)
        if not empty and not files:
            return False
        if empty:
            known.body, known.html, known.from_name = text, markup, name[:200]
            known.attachments = read_attachments(msg)
        for f in files:
            f.mail_message_id = known.id
        db.add_all(files)
        return save(db)
    subject = str(msg.get("Subject", ""))[:300]
    when = sent_at(str(msg.get("Date", "")) or None)
    ids = header_ids(str(msg.get("In-Reply-To", "")), str(msg.get("References", "")))
    thread = find_thread(db, mailbox, ids, sender, subject, open_only=live)
    had_messages = thread is not None
    # first time they've written, or everything with them was closed
    greet = live and not thread and settings().inbox_auto_reply and not is_automated(msg, sender) and not db.query(MailThread).filter(
        MailThread.mailbox == mailbox, MailThread.contact_email == sender, MailThread.status != "closed").first()
    if not thread:
        thread = MailThread(mailbox=mailbox, contact_email=sender, subject=subject, last_message_at=when)
        db.add(thread)
        db.flush()
    thread.contact_name = thread.contact_name or name[:200]
    if thread.status == "closed":  # an import landing in a closed conversation leaves it closed
        touch(thread, when)
    else:
        # they wrote again, so it needs looking at again; imported mail arrives already read
        apply_status(thread, "new" if live else "reviewed", when, had_messages)
    to = [a for _, a in getaddresses([str(v) for v in msg.get_all("To", [])]) if a][:50]
    db.add(MailMessage(thread_id=thread.id, mailbox=mailbox, direction="in", message_id=message_id, from_email=sender, from_name=name[:200],
                       to=to, subject=subject, body=text, html=markup, attachments=read_attachments(msg), files=read_files(msg), source="worker",
                       created_at=when))
    saved = save(db)
    if saved and platform_mail(msg, sender):
        mark_platform(db, mailbox, sender)
    if saved and greet:
        acknowledge(db, thread, message_id, subject, name)
    return saved


def store_sent(db: Session, mailbox: str, *, email_id: str | None, message_id: str | None, from_value: str, to_values: list[str], subject: str,
               ids: list[str], text: str, markup: str, when: datetime) -> bool:
    """Keeps one email sent from a mailbox through Resend. True if it was new."""
    pairs = [parseaddr(t) for t in to_values]
    to = [a.strip().lower() for _, a in pairs if a.strip() and a.strip().lower() != mailbox]
    if not to:
        return False
    thread = find_thread(db, mailbox, ids, to[0], subject)
    had_messages = thread is not None
    if not thread:  # a new conversation started from Gmail
        thread = MailThread(mailbox=mailbox, contact_email=to[0], subject=subject, last_message_at=when)
        db.add(thread)
        db.flush()
    thread.contact_name = thread.contact_name or next((n for n, a in pairs if a.strip().lower() == to[0] and n), "")[:200]
    apply_status(thread, "replied", when, had_messages)
    db.add(MailMessage(thread_id=thread.id, mailbox=mailbox, direction="out", message_id=message_id, resend_id=email_id, from_email=mailbox,
                       from_name=parseaddr(from_value)[0][:200], to=to, subject=subject, body=text, html=markup, source="smtp", created_at=when))
    for person in to:
        mark_enquiries_replied(db, person, when)
    return save(db)


@public.post("/inbound", status_code=204)
def receive_mail(raw: bytes = Depends(raw_body), x_inbound_secret: str = Header(default=""), x_mailbox: str = Header(default=""), db: Session = Depends(get_db)):
    """A raw email from the Cloudflare Worker. Safe to send twice."""
    secret = settings().inbound_secret
    if not secret or not hmac.compare_digest(x_inbound_secret, secret):
        raise HTTPException(403, "Mail is received through the Worker only.")
    mailbox = x_mailbox.strip().lower()
    store_inbound(db, mailbox if mailbox in tracked_mailboxes() else settings().inbox_address.lower(), raw, live=True)


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


def fetch_sent(email_id: str) -> tuple[str, str]:
    """The text and HTML of a sent email. Needs a Resend key that can read; without
    one the reply is still tracked, just without its content."""
    key = settings().resend_api_key
    if not key:
        return "", ""
    try:
        r = httpx.get(f"https://api.resend.com/emails/{email_id}", timeout=8, headers={"Authorization": f"Bearer {key}"})
        if r.status_code >= 300:
            return "", ""
        d = r.json()
        markup = d.get("html") or ""
        return (d.get("text") or html_to_text(markup))[:MAX_BODY], (markup if len(markup) <= MAX_HTML else "")
    except (httpx.HTTPError, ValueError):
        return "", ""


def mark_enquiries_replied(db: Session, email: str, when: datetime | None = None) -> None:
    query = db.query(Enquiry).filter(func.lower(Enquiry.email) == email, Enquiry.status.in_(("new", "reviewed")))
    if when:  # an old email can't answer an enquiry that came later
        query = query.filter(Enquiry.created_at <= when)
    for e in query:
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
    inbox = address(data.get("from", ""))
    if event.get("type") != "email.sent" or inbox not in tracked_mailboxes():
        return
    email_id, message_id = data.get("email_id"), (data.get("message_id") or "")[:500] or None
    known = db.query(MailMessage).filter(MailMessage.resend_id == email_id).first()
    if known:  # sent from the portal: all that was missing is the id replies will quote
        if message_id and not known.message_id:
            known.message_id = message_id
            save(db)
        return
    headers = {(h.get("name") or "").lower(): h.get("value") for h in data.get("headers") or []}
    text_body, markup = fetch_sent(email_id)
    store_sent(db, inbox, email_id=email_id, message_id=message_id, from_value=data.get("from", ""), to_values=data.get("to") or [],
               subject=(data.get("subject") or "")[:300], ids=header_ids(headers.get("in-reply-to"), headers.get("references")),
               text=text_body, markup=markup, when=now())


# ── reading and replying ────────────────────
def message_out(m: MailMessage, files: list[dict]) -> dict:
    return {"id": m.id, "files": files, "direction": m.direction, "from_email": m.from_email, "from_name": m.from_name, "to": m.to,
            "subject": m.subject, "body": m.body, "html": m.html, "snippet": strip_quoted(m.body)[:160], "attachments": m.attachments, "source": m.source,
            "sent_by": m.sent_by, "created_at": m.created_at}


def thread_summaries(db: Session, ids: list[int]) -> dict[int, dict]:
    """Counts and previews for many threads in two queries, without pulling each
    email's stored HTML across the network. Automatic replies aren't anyone's last word."""
    if not ids:
        return {}
    counts = dict(db.query(MailMessage.thread_id, func.count()).filter(MailMessage.thread_id.in_(ids)).group_by(MailMessage.thread_id).all())
    latest = db.query(MailMessage.thread_id, MailMessage.direction, func.left(MailMessage.body, 4000)) \
        .filter(MailMessage.thread_id.in_(ids), MailMessage.source != "auto").distinct(MailMessage.thread_id) \
        .order_by(MailMessage.thread_id, MailMessage.created_at.desc(), MailMessage.id.desc()).all()
    last = {tid: (direction, body) for tid, direction, body in latest}
    return {i: {"count": counts.get(i, 0), "last_direction": last[i][0] if i in last else None,
                "snippet": strip_quoted(last[i][1])[:160] if i in last else ""} for i in ids}


def thread_out(db: Session, t: MailThread, summary: dict | None = None) -> dict:
    return {"id": t.id, "mailbox": t.mailbox, "contact_email": t.contact_email, "contact_name": t.contact_name, "subject": t.subject,
            "status": t.status, "notes": t.notes, "last_message_at": t.last_message_at, "created_at": t.created_at,
            **(summary or thread_summaries(db, [t.id])[t.id])}


def threads_out(db: Session, threads: list[MailThread]) -> list[dict]:
    summaries = thread_summaries(db, [t.id for t in threads])
    return [thread_out(db, t, summaries[t.id]) for t in threads]


def get_thread(tid: int, me: Admin, db: Session) -> MailThread:
    t = db.get(MailThread, tid)
    if not t or t.mailbox not in visible_mailboxes(db, me):  # same answer either way: it isn't theirs to know about
        raise HTTPException(404, "Conversation not found.")
    return t


# ── senders and sections ────────────────────
class SectionIn(BaseModel):
    name: str = Field(min_length=1, max_length=60)


class SenderSectionIn(BaseModel):
    mailbox: str
    email: str
    section_id: int | None = None


def visible_threads(db: Session, me: Admin, mailbox: str | None, q: str | None):
    mine = visible_mailboxes(db, me)
    # one mailbox at a time; asking for one you can't see falls back to your first
    chosen = mine if mailbox is None else [mailbox] if mailbox in mine else mine[:1]
    query = db.query(MailThread).filter(MailThread.mailbox.in_(chosen))
    if q:
        like = f"%{q}%"
        match = db.query(MailMessage.thread_id).filter(MailMessage.body.ilike(like))
        query = query.filter(or_(MailThread.contact_email.ilike(like), MailThread.contact_name.ilike(like),
                                 MailThread.subject.ilike(like), MailThread.id.in_(match)))
    return mine, query


def mailbox_counts(db: Session, mine: list[str]) -> dict[str, int]:
    """New conversations with people, for the tab of each mailbox."""
    rows = dict(db.query(MailThread.mailbox, func.count()).filter(MailThread.mailbox.in_(mine), MailThread.status == "new", ~is_platform_thread())
                .group_by(MailThread.mailbox).all())
    return {m: rows.get(m, 0) for m in mine}


def contact_rows(db: Session, mailboxes: list[str]) -> dict[tuple[str, str], MailContact]:
    return {(c.mailbox, c.email): c for c in db.query(MailContact).filter(MailContact.mailbox.in_(mailboxes))}


def sender_rows(db: Session, threads: list[MailThread], contacts: dict) -> list[dict]:
    """One row per person, newest first. Threads arrive newest first."""
    ids = [t.id for t in threads]
    counts = dict(db.query(MailMessage.thread_id, func.count()).filter(MailMessage.thread_id.in_(ids)).group_by(MailMessage.thread_id)) if ids else {}
    rows: dict[tuple[str, str], dict] = {}
    for t in threads:
        key = (t.mailbox, t.contact_email)
        r = rows.get(key)
        if not r:
            c = contacts.get(key)
            r = rows[key] = {"mailbox": t.mailbox, "email": t.contact_email, "name": t.contact_name, "section_id": c.section_id if c else None,
                             "kind": c.kind if c else "person",
                             "conversations": 0, "emails": 0, "new": 0, "last_subject": t.subject, "last_at": t.last_message_at, "status": t.status}
        r["name"] = r["name"] or t.contact_name
        r["conversations"] += 1
        r["emails"] += counts.get(t.id, 0)
        r["new"] += t.status == "new"
    for r in rows.values():
        if r["new"]:
            r["status"] = "new"
    return list(rows.values())


@admin.get("/inbox/senders")
def list_senders(q: str | None = None, status: str | None = None, mailbox: str | None = None, section: str | None = None, kind: str | None = None, limit: int = 25, offset: int = 0,
                 me: Admin = Depends(current_admin), db: Session = Depends(get_db)):
    mine, query = visible_threads(db, me, mailbox, q)
    threads = query.order_by(MailThread.last_message_at.desc()).all()
    contacts = contact_rows(db, mine)
    if status:
        wanted = {(t.mailbox, t.contact_email) for t in threads if t.status == status}
        threads = [t for t in threads if (t.mailbox, t.contact_email) in wanted]
    rows = sender_rows(db, threads, contacts)
    people, platforms = sum(r["kind"] == "person" for r in rows), sum(r["kind"] == "platform" for r in rows)
    if kind in ("person", "platform"):
        rows = [r for r in rows if r["kind"] == kind]
    tally: dict[int | None, int] = {}
    for r in rows:
        tally[r["section_id"]] = tally.get(r["section_id"], 0) + 1
    if section == "none":
        rows = [r for r in rows if r["section_id"] is None]
    elif section:
        rows = [r for r in rows if str(r["section_id"]) == section]
    limit = max(1, min(limit, 200))
    return {"total": len(rows), "mailboxes": mine, "mailbox_new": mailbox_counts(db, mine), "people": people, "platforms": platforms, "all": sum(tally.values()), "uncategorised": tally.get(None, 0),
            "sections": [{"id": s.id, "name": s.name, "count": tally.get(s.id, 0)} for s in db.query(MailSection).order_by(MailSection.name)],
            "items": rows[offset:offset + limit]}


@admin.get("/inbox/sender")
def read_sender(mailbox: str, email: str, me: Admin = Depends(current_admin), db: Session = Depends(get_db)):
    mine = visible_mailboxes(db, me)
    threads = [] if mailbox not in mine else db.query(MailThread).filter(MailThread.mailbox == mailbox, MailThread.contact_email == email) \
        .order_by(MailThread.last_message_at.desc()).all()
    if not threads:
        raise HTTPException(404, "Sender not found.")
    row = sender_rows(db, threads, contact_rows(db, [mailbox]))[0]
    return {**row, "threads": threads_out(db, threads),
            "sections": [{"id": s.id, "name": s.name} for s in db.query(MailSection).order_by(MailSection.name)]}


@admin.put("/inbox/sender/section")
def file_sender(body: SenderSectionIn, me: Admin = Depends(current_admin), db: Session = Depends(get_db)):
    if body.mailbox not in visible_mailboxes(db, me) or \
            not db.query(MailThread).filter(MailThread.mailbox == body.mailbox, MailThread.contact_email == body.email).first():
        raise HTTPException(404, "Sender not found.")
    if body.section_id is not None and not db.get(MailSection, body.section_id):
        raise HTTPException(400, "That section no longer exists.")
    c = db.query(MailContact).filter(MailContact.mailbox == body.mailbox, MailContact.email == body.email).first()
    if not c:
        c = MailContact(mailbox=body.mailbox, email=body.email)
        db.add(c)
    c.section_id = body.section_id
    db.commit()
    return {"mailbox": c.mailbox, "email": c.email, "section_id": c.section_id}


class SenderKindIn(BaseModel):
    mailbox: str
    email: str
    kind: str


@admin.put("/inbox/sender/kind")
def sort_sender(body: SenderKindIn, me: Admin = Depends(current_admin), db: Session = Depends(get_db)):
    if body.kind not in ("person", "platform"):
        raise HTTPException(400, "Unknown kind.")
    if body.mailbox not in visible_mailboxes(db, me) or \
            not db.query(MailThread).filter(MailThread.mailbox == body.mailbox, MailThread.contact_email == body.email).first():
        raise HTTPException(404, "Sender not found.")
    c = db.query(MailContact).filter(MailContact.mailbox == body.mailbox, MailContact.email == body.email).first()
    if not c:
        c = MailContact(mailbox=body.mailbox, email=body.email)
        db.add(c)
    c.kind, c.kind_manual = body.kind, True
    if is_shared(body.mailbox):
        audit.record(db, me, "inbox.sort", entity="mail", summary=f"Moved {body.email} to {'Platforms' if body.kind == 'platform' else 'People'}")
    db.commit()
    return {"mailbox": c.mailbox, "email": c.email, "kind": c.kind}


def clean_section_name(db: Session, name: str, keep: int | None = None) -> str:
    name = " ".join(name.split())
    if not name:
        raise HTTPException(400, "Give the section a name.")
    same = db.query(MailSection).filter(func.lower(MailSection.name) == name.lower()).first()
    if same and same.id != keep:
        raise HTTPException(409, "There is already a section with that name.")
    return name


@admin.post("/inbox/sections", status_code=201)
def add_section(body: SectionIn, me: Admin = Depends(current_admin), db: Session = Depends(get_db)):
    s = MailSection(name=clean_section_name(db, body.name), created_by=me.email)
    db.add(s)
    audit.record(db, me, "inbox.section", entity="mail", summary=f"Added the inbox section {s.name}")
    db.commit()
    return {"id": s.id, "name": s.name}


@admin.patch("/inbox/sections/{sid}")
def rename_section(sid: int, body: SectionIn, me: Admin = Depends(current_admin), db: Session = Depends(get_db)):
    s = db.get(MailSection, sid)
    if not s:
        raise HTTPException(404, "Section not found.")
    before, s.name = s.name, clean_section_name(db, body.name, keep=sid)
    audit.record(db, me, "inbox.section", entity="mail", entity_id=sid, summary=f"Renamed the inbox section {before} to {s.name}")
    db.commit()
    return {"id": s.id, "name": s.name}


@admin.delete("/inbox/sections/{sid}", status_code=204)
def delete_section(sid: int, me: Admin = Depends(current_admin), db: Session = Depends(get_db)):
    s = db.get(MailSection, sid)
    if not s:
        raise HTTPException(404, "Section not found.")
    db.query(MailContact).filter(MailContact.section_id == sid).update({"section_id": None})
    audit.record(db, me, "inbox.section", entity="mail", entity_id=sid, summary=f"Removed the inbox section {s.name}")
    db.delete(s)
    db.commit()


@admin.get("/inbox")
def list_threads(q: str | None = None, status: str | None = None, state: str | None = None, kind: str | None = None, mailbox: str | None = None, limit: int = 25, offset: int = 0,
                 me: Admin = Depends(current_admin), db: Session = Depends(get_db)):
    mine, query = visible_threads(db, me, mailbox, q)
    # every tab's number from one query: each trip to the database costs real time
    closed_col, platform_col = (MailThread.status == "closed").label("closed"), is_platform_thread().label("platform")
    tally = query.with_entities(closed_col, platform_col, func.count()).group_by(closed_col, platform_col).all()
    people, platforms = sum(n for _, p, n in tally if not p), sum(n for _, p, n in tally if p)
    wanted = {"person": False, "platform": True}.get(kind)
    open_count = sum(n for c, p, n in tally if not c and wanted in (None, p))
    closed_count = sum(n for c, p, n in tally if c and wanted in (None, p))
    if kind == "platform":
        query = query.filter(is_platform_thread())
    elif kind == "person":
        query = query.filter(~is_platform_thread())
    if state == "open":
        query = query.filter(MailThread.status != "closed")
    elif state == "closed":
        query = query.filter(MailThread.status == "closed")
    if status:
        query = query.filter(MailThread.status == status)
    query = query.order_by(MailThread.last_message_at.desc())
    return {"total": query.count(), "open": open_count, "closed": closed_count, "people": people, "platforms": platforms, "mailboxes": mine,
            "mailbox": mailbox if mailbox in mine else None, "mailbox_new": mailbox_counts(db, mine),
            "items": threads_out(db, page(query, limit, offset))}


@admin.get("/inbox/{tid}")
def read_thread(tid: int, me: Admin = Depends(current_admin), db: Session = Depends(get_db)):
    t = get_thread(tid, me, db)
    msgs = db.query(MailMessage).filter(MailMessage.thread_id == tid).order_by(MailMessage.created_at, MailMessage.id).all()
    c = db.query(MailContact).filter(MailContact.mailbox == t.mailbox, MailContact.email == t.contact_email).first()
    files: dict[int, list[dict]] = {}
    for fid, mid, name, size in db.query(MailAttachment.id, MailAttachment.mail_message_id, MailAttachment.name, MailAttachment.size) \
            .filter(MailAttachment.mail_message_id.in_([m.id for m in msgs])).order_by(MailAttachment.id):
        files.setdefault(mid, []).append({"id": fid, "name": name, "size": size})
    return {**thread_out(db, t), "kind": c.kind if c else "person", "messages": [message_out(m, files.get(m.id, [])) for m in msgs]}


@admin.get("/inbox/{tid}/files/{fid}")
def download_file(tid: int, fid: int, me: Admin = Depends(current_admin), db: Session = Depends(get_db)):
    get_thread(tid, me, db)  # the mailbox check
    f = db.query(MailAttachment).join(MailMessage).filter(MailAttachment.id == fid, MailMessage.thread_id == tid).first()
    if not f:
        raise HTTPException(404, "That file isn't here.")
    # always a download, never opened on the portal's own address: it came from a stranger
    return Response(f.data, media_type="application/octet-stream", headers={
        "Content-Disposition": f"attachment; filename*=UTF-8''{quote(f.name, safe='')}", "X-Content-Type-Options": "nosniff"})


@admin.patch("/inbox/{tid}")
def update_thread(tid: int, body: StatusNotesIn, me: Admin = Depends(current_admin), db: Session = Depends(get_db)):
    t = get_thread(tid, me, db)
    before = {"status": t.status, "notes": t.notes}
    if body.status is not None:
        if body.status not in MAIL_STATUSES:
            raise HTTPException(400, "Unknown status.")
        t.status = body.status
    if body.notes is not None:
        t.notes = body.notes
    if is_shared(t.mailbox):  # the activity log is visible to every admin, so personal mailboxes stay out of it
        audit.record(db, me, "inbox.update", entity="mail", entity_id=tid, before=before,
                     after={"status": t.status, "notes": t.notes}, summary=f"Updated conversation with {t.contact_email}")
    db.commit()
    return thread_out(db, t)


class ReplyIn(BaseModel):
    body: str = Field(min_length=1, max_length=20000)


@admin.post("/inbox/{tid}/reply")
def reply(tid: int, body: ReplyIn, me: Admin = Depends(current_admin), db: Session = Depends(get_db)):
    t = get_thread(tid, me, db)
    s = settings()
    shared = is_shared(t.mailbox)
    sender = s.inbox_from if shared else f"{me.name or 'BLOXio'} <{t.mailbox}>"
    ids = [m for (m,) in db.query(MailMessage.message_id).filter(MailMessage.thread_id == tid, MailMessage.message_id.isnot(None))
           .order_by(MailMessage.created_at, MailMessage.id)]
    headers = {"In-Reply-To": ids[-1], "References": " ".join(ids[-10:])} if ids else None
    subject = t.subject if bare_subject(t.subject) != (t.subject or "").strip().casefold() else f"Re: {t.subject}"
    entry = mailer.send(db, to=[t.contact_email], subject=subject, body_html=mailer.text_to_html(body.body), kind="inbox", greeting="",
                        sent_by=me.email, sign_name=me.name or "The BLOXio team", from_addr=sender, reply_to=t.mailbox, headers=headers, logged=shared)
    if entry.status == "failed":
        db.commit()  # keeps the failure in the email log
        raise HTTPException(502, "The email could not be sent. Try again shortly.")
    t.status = "replied"
    touch(t, now())
    provider_id = getattr(entry, "provider_id", None)
    fields = {"from_name": me.name or "", "body": body.body, "html": entry.body, "source": "portal", "sent_by": me.email}
    # Resend's webhook can land while this request is still open
    early = db.query(MailMessage).filter(MailMessage.resend_id == provider_id).first() if provider_id else None
    if early:
        for k, v in fields.items():
            setattr(early, k, v)
    else:
        db.add(MailMessage(thread_id=tid, mailbox=t.mailbox, direction="out", resend_id=provider_id, from_email=t.mailbox,
                           to=[t.contact_email], subject=subject, **fields))
    mark_enquiries_replied(db, t.contact_email)
    if shared:
        audit.record(db, me, "inbox.reply", entity="mail", entity_id=tid, summary=f"Replied to {t.contact_email}", after={"subject": subject})
    db.commit()
    return read_thread(tid, me, db)
