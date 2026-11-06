"""Brings past mail into the portal inbox. Everything here is safe to run twice.
Resend keeps sent mail with its text. Cloudflare only logs who wrote, when and the
subject, for a few weeks. The text of older incoming mail exists only in Gmail,
which is what the mbox import is for."""
import mailbox as mbox
import time
from datetime import datetime, timedelta, timezone
from email.utils import parseaddr

import httpx
from sqlalchemy.orm import Session

from .inbox_access import tracked_mailboxes
from .models import MailMessage, MailThread
from .routers.inbox import apply_status, find_thread, html_to_text, is_ours, save, store_inbound, store_sent

CLOUDFLARE = "https://api.cloudflare.com/client/v4"
CF_WINDOW = timedelta(days=30)  # the widest range Cloudflare answers in one query
CF_QUERY = """query($z:String!,$a:Time!,$b:Time!){viewer{zones(filter:{zoneTag:$z}){emailRoutingAdaptive(
limit:10000,filter:{datetime_geq:$a,datetime_leq:$b},orderBy:[datetime_ASC]){datetime from to subject status messageId}}}}"""
SKIP_RECIPIENT = "@resend.dev"  # Resend's test addresses
UNSENT = {"failed", "canceled", "scheduled", "queued"}


def parse_time(value: str) -> datetime:
    when = datetime.fromisoformat(value.replace("Z", "+00:00").replace(" ", "T", 1))
    return when if when.tzinfo else when.replace(tzinfo=timezone.utc)


def sync_resend(db: Session, key: str, only: list[str] | None = None, pause: float = 0.6) -> dict:
    """Sent mail from the tracked mailboxes. Resend's records carry no In-Reply-To,
    so these join conversations by person and subject."""
    boxes = only or tracked_mailboxes()
    auth = {"Authorization": f"Bearer {key}", "User-Agent": "bloxio-inbox-sync"}
    listed, after = [], None
    while True:
        page = httpx.get("https://api.resend.com/emails", params={"limit": 100, **({"after": after} if after else {})}, headers=auth, timeout=30)
        page.raise_for_status()
        data = page.json()
        listed += data.get("data") or []
        if not data.get("has_more") or not listed:
            break
        after = listed[-1]["id"]
        time.sleep(pause)
    added = skipped = 0
    for e in sorted(listed, key=lambda x: x["created_at"]):
        box = parseaddr(e.get("from", ""))[1].lower()
        to = e.get("to") or []
        if box not in boxes or e.get("last_event") in UNSENT or all(parseaddr(t)[1].lower().endswith(SKIP_RECIPIENT) for t in to) \
                or db.query(MailMessage).filter(MailMessage.resend_id == e["id"]).first():
            skipped += 1
            continue
        detail = httpx.get(f"https://api.resend.com/emails/{e['id']}", headers=auth, timeout=30)
        detail.raise_for_status()
        d = detail.json()
        added += store_sent(db, box, email_id=e["id"], message_id=(e.get("message_id") or None), from_value=e.get("from", ""), to_values=to,
                            subject=(e.get("subject") or "")[:300], ids=[], text=(d.get("text") or html_to_text(d.get("html") or "")),
                            markup=d.get("html") or "", when=parse_time(e["created_at"]))
        time.sleep(pause)
    return {"source": "resend", "added": added, "skipped": skipped}


def cloudflare_rows(token: str, zone: str = "bloxio.tech", now: datetime | None = None, periods: int = 13) -> list[dict]:
    """Walks back a month at a time until Cloudflare has nothing older."""
    auth = {"Authorization": f"Bearer {token}"}
    zones = httpx.get(f"{CLOUDFLARE}/zones", params={"name": zone}, headers=auth, timeout=30)
    zones.raise_for_status()
    zone_id = zones.json()["result"][0]["id"]
    end = now or datetime.now(timezone.utc)
    rows: list[dict] = []
    for period in range(periods):
        start = end - CF_WINDOW
        r = httpx.post(f"{CLOUDFLARE}/graphql", headers=auth, timeout=60, json={"query": CF_QUERY, "variables": {
            "z": zone_id, "a": start.strftime("%Y-%m-%dT%H:%M:%SZ"), "b": end.strftime("%Y-%m-%dT%H:%M:%SZ")}})
        r.raise_for_status()
        body = r.json()
        got = ((body.get("data") or {}).get("viewer", {}).get("zones") or [{}])[0].get("emailRoutingAdaptive") or []
        if body.get("errors") and period == 0:  # nothing read at all: say so, don't report an empty history
            raise RuntimeError(f"Cloudflare refused the log query: {body['errors'][0].get('message')}")
        if body.get("errors") or not got:  # past what Cloudflare keeps
            break
        rows += got
        end = start
    return rows


def sync_cloudflare(db: Session, token: str, only: list[str] | None = None) -> dict:
    return store_cloudflare_rows(db, cloudflare_rows(token), only)


def store_cloudflare_rows(db: Session, rows: list[dict], only: list[str] | None = None) -> dict:
    """Incoming mail from Cloudflare's log: sender, date and subject, without the text."""
    boxes = only or tracked_mailboxes()
    added = skipped = 0
    for row in sorted(rows, key=lambda x: x["datetime"]):
        name, sender = parseaddr(row.get("from") or "")  # Cloudflare gives the whole From line
        box, sender = parseaddr(row.get("to") or "")[1].lower(), sender.strip().lower()
        message_id = row.get("messageId") or ""
        message_id = (message_id if message_id.startswith("<") else f"<{message_id}>")[:500]
        if box not in boxes or row.get("status") != "delivered" or not sender or not row.get("messageId") or is_ours(sender, box) \
                or db.query(MailMessage).filter(MailMessage.mailbox == box, MailMessage.message_id == message_id).first():
            skipped += 1
            continue
        when, subject = parse_time(row["datetime"]), (row.get("subject") or "")[:300]
        thread = find_thread(db, box, [], sender, subject)  # past mail is filed, never answered
        had_messages = thread is not None
        if not thread:
            thread = MailThread(mailbox=box, contact_email=sender, subject=subject, last_message_at=when)
            db.add(thread)
            db.flush()
        thread.contact_name = thread.contact_name or name[:200]
        apply_status(thread, "new", when, had_messages)
        db.add(MailMessage(thread_id=thread.id, mailbox=box, direction="in", message_id=message_id, from_email=sender, from_name=name[:200], to=[box],
                           subject=subject, source="log", created_at=when))
        added += save(db)
    return {"source": "cloudflare", "added": added, "skipped": skipped}


def import_mbox(db: Session, box: str, path: str) -> dict:
    """Incoming mail from a Google Takeout export, with its text. Mail in the export
    that wasn't addressed to this mailbox is left out."""
    if box not in tracked_mailboxes():
        raise SystemExit(f"{box} is not a tracked mailbox")
    added = skipped = 0
    for message in mbox.mbox(path):
        heads = " ".join(str(message.get(h, "")) for h in ("To", "Cc", "Delivered-To", "X-Forwarded-To")).lower()
        if box in heads and store_inbound(db, box, message.as_bytes()):
            added += 1
        else:
            skipped += 1
    return {"source": "mbox", "added": added, "skipped": skipped}
