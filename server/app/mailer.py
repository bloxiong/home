"""Email through Resend, always from the one shared no-reply address, in
BLOXio's official email template (app/email_templates, made from
"Bloxio Mail Template/bloxio-email-fluid*.html"). MAIL_THEME picks the light
(default, the official one) or dark version.
Without RESEND_API_KEY (local development) messages are printed instead.
Every attempt is recorded in email_log."""
import html
import logging
from functools import lru_cache
from pathlib import Path

import httpx
from sqlalchemy.orm import Session

from .config import settings
from .models import EmailLog

log = logging.getLogger("bloxio.mail")
TEMPLATES = Path(__file__).with_name("email_templates")

# Colours for things inside the message body, matched to each template
PALETTE = {
    "light": {"ink": "#111413", "body": "#474D49", "muted": "#5E655F", "link": "#0F5533", "line": "#C3CAB8"},
    "dark": {"ink": "#EEF1EF", "body": "#C4CBC6", "muted": "#8A938D", "link": "#6FD39D", "line": "#262D2A"},
}


def theme() -> str:
    return "dark" if settings().mail_theme == "dark" else "light"


def color(name: str) -> str:
    return PALETTE[theme()][name]


@lru_cache
def _template(name: str) -> str:
    return (TEMPLATES / f"{name}.html").read_text()


def text_to_html(text: str) -> str:
    """Plain text → paragraphs styled like the template's body text."""
    return "".join(f"<p style=\"margin:0 0 16px 0;\">{html.escape(p).replace(chr(10), '<br />')}</p>"
                   for p in text.strip().split("\n\n") if p.strip())


def link(url: str, label: str) -> str:
    return f"<a href=\"{html.escape(url)}\" style=\"color:{color('link')}; font-weight:600;\">{html.escape(label)}</a>"


def render(*, subject: str, greeting: str | None, body_html: str, button: tuple[str, str] | None = None,
           sign_name: str = "The BLOXio team", sign_title: str = "BLOXio Nigeria Limited") -> str:
    t = theme()
    page = _template(t)
    btn = ""
    if button:
        label, url = button
        btn = "\n          " + _template(f"{t}-button").replace("{{BUTTON_LABEL}}", html.escape(label)) \
            .replace("{{BUTTON_URL}}", html.escape(url)) + "\n"
    if not greeting:  # drop the whole greeting paragraph
        start = page.rindex("<p ", 0, page.index("{{GREETING}}"))
        end = page.index("</p>", page.index("{{GREETING}}")) + 4
        page = page[:start] + page[end:]
    return (page.replace("{{SUBJECT}}", html.escape(subject))
                .replace("{{EYEBROW}}", html.escape(subject))
                .replace("{{GREETING}}", html.escape(greeting or ""))
                .replace("{{BODY}}", body_html)
                .replace("{{BUTTON}}", btn)
                .replace("{{SIGN_NAME}}", html.escape(sign_name))
                .replace("{{SIGN_TITLE}}", html.escape(sign_title)))


def send(db: Session, *, to: list[str], subject: str, body_html: str, kind: str, greeting: str | None = None,
         button: tuple[str, str] | None = None, sent_by: str | None = None, reply_to: str | None = None,
         sign_name: str = "The BLOXio team", title: str | None = None) -> EmailLog:
    # `title` is accepted for older callers and used as the greeting
    greeting = greeting if greeting is not None else title
    s = settings()
    full = render(subject=subject, greeting=greeting, body_html=body_html, button=button, sign_name=sign_name)
    entry = EmailLog(kind=kind, to=to, subject=subject, body=full, status="logged", sent_by=sent_by)
    if not s.resend_api_key:
        log.warning("[mail not sent: no RESEND_API_KEY] to=%s subject=%s", to, subject)
    else:
        payload = {"from": s.mail_from, "to": to, "subject": subject, "html": full}
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
