"""Email through Resend, always from the one shared no-reply address.
Without RESEND_API_KEY (local development) messages are printed instead.
Every attempt is recorded in email_log."""
import html
import logging

import httpx
from sqlalchemy.orm import Session

from .config import settings
from .models import EmailLog

log = logging.getLogger("bloxio.mail")


def _layout(title: str, body_html: str) -> str:
    return f"""<!doctype html><html><body style="margin:0;background:#0B0D0C;font-family:Arial,Helvetica,sans-serif">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0B0D0C;padding:32px 12px">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#131615;border:1px solid #262D2A;border-radius:16px">
<tr><td style="padding:28px 28px 8px">
<div style="font-size:20px;font-weight:800;letter-spacing:1px;color:#E5C08A">BLOXio</div>
<div style="font-size:13px;font-style:italic;color:#A3ABA6;margin-top:2px">&hellip;one step ahead of tech</div>
</td></tr>
<tr><td style="padding:16px 28px 28px;color:#EEF1EF;font-size:15px;line-height:1.6">
<h1 style="font-size:18px;margin:0 0 12px;color:#EEF1EF">{html.escape(title)}</h1>
{body_html}
</td></tr>
<tr><td style="padding:16px 28px;border-top:1px solid #262D2A;color:#7E8782;font-size:12px">
BLOXio Nigeria Limited &middot; Lagos, Nigeria &middot; bloxio.tech<br>This is an automated message from a no-reply address.
</td></tr></table></td></tr></table></body></html>"""


def text_to_html(text: str) -> str:
    return "".join(f"<p style=\"margin:0 0 12px\">{html.escape(p).replace(chr(10), '<br>')}</p>"
                   for p in text.strip().split("\n\n") if p.strip())


def send(db: Session, *, to: list[str], subject: str, title: str, body_html: str,
         kind: str, sent_by: str | None = None, reply_to: str | None = None) -> EmailLog:
    s = settings()
    entry = EmailLog(kind=kind, to=to, subject=subject, body=body_html, status="logged", sent_by=sent_by)
    if not s.resend_api_key:
        log.warning("[mail not sent: no RESEND_API_KEY] to=%s subject=%s\n%s", to, subject, body_html)
    else:
        payload = {"from": s.mail_from, "to": to, "subject": subject, "html": _layout(title, body_html)}
        if reply_to:
            payload["reply_to"] = reply_to
        try:
            r = httpx.post("https://api.resend.com/emails", json=payload, timeout=15,
                           headers={"Authorization": f"Bearer {s.resend_api_key}"})
            if r.status_code >= 300:
                entry.status, entry.error = "failed", r.text[:1000]
            else:
                entry.status = "sent"
        except httpx.HTTPError as e:
            entry.status, entry.error = "failed", str(e)[:1000]
    if entry.status == "failed":
        log.error("Email to %s failed (%s): %s", to, subject, entry.error)
    db.add(entry)
    db.flush()
    return entry
