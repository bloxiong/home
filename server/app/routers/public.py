"""Endpoints the public sites call: no login, rate limited, honeypot protected."""
import html
import time
from collections import defaultdict, deque

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy.orm import Session

from .. import mailer
from ..config import settings
from ..db import get_db
from ..models import ContentDoc, Enquiry, SurveyResponse

router = APIRouter(prefix="/public", tags=["public"])

# ── simple per-IP rate limit (enough for one Render instance) ─────────
_hits: dict[str, deque] = defaultdict(deque)


def rate_limit(request: Request, window: int = 600) -> None:
    # Behind Render's proxy the real visitor is the LAST X-Forwarded-For entry
    # (earlier entries come from the visitor and can be faked).
    fwd = request.headers.get("x-forwarded-for", "")
    ip = fwd.split(",")[-1].strip() if fwd else (request.client.host if request.client else "?")
    limit = settings().rate_limit
    q, t = _hits[ip], time.monotonic()
    while q and t - q[0] > window:
        q.popleft()
    if len(q) >= limit:
        raise HTTPException(429, "Too many submissions. Please try again in a few minutes.")
    q.append(t)


# Question labels, so emails and the admin read like the survey itself
SURVEY_LABELS = {
    "respondentType": "Which best describes you?",
    "respondentOther": "Described as (other)",
    "yearsExperience": "Years of experience",
    "location": "Location",
    "monitoringChallenges": "Challenges monitoring the farm",
    "biggestChallenges": "Biggest challenges",
    "biggestChallengesOther": "Other challenges",
    "detectionMethods": "How problems are detected now",
    "detectionMethodsOther": "Other detection methods",
    "usefulnessRating": "How useful AgroSense360 would be (1–5)",
    "valuableFeatures": "Most valuable features",
    "considerUsing": "Would consider using AgroSense360",
    "willingToPay": "Willing to pay",
    "paymentModel": "Preferred payment model",
    "futureProducts": "Interested in beyond agriculture",
    "openToNewTech": "Open to testing new tech",
    "investmentInterest": "Investment interest",
    "knowMore": "Wants to know",
    "questions": "Questions for BLOXio",
    "earlyAccess": "Wants early access / updates",
    "email": "Email",
}


def _answers_html(data: dict) -> str:
    rows = []
    for key, label in SURVEY_LABELS.items():
        v = data.get(key)
        if v in (None, "", []):
            continue
        val = ", ".join(v) if isinstance(v, list) else str(v)
        rows.append(f"<tr><td style=\"padding:7px 14px 7px 0; vertical-align:top; font-size:12px; color:{mailer.color('muted')}; "
                    f"border-bottom:1px solid {mailer.color('line')};\">{html.escape(label)}</td>"
                    f"<td style=\"padding:7px 0; font-size:14px; color:{mailer.color('ink')}; border-bottom:1px solid {mailer.color('line')};\">"
                    f"{html.escape(val)}</td></tr>")
    return (f"<table role=\"presentation\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" "
            f"style=\"width:100%; border-collapse:collapse; margin:0 0 8px 0;\">{''.join(rows)}</table>")


class SurveyIn(BaseModel):
    data: dict
    website: str = ""  # honeypot: real people leave this empty


@router.post("/survey")
def submit_survey(body: SurveyIn, request: Request, db: Session = Depends(get_db)):
    rate_limit(request)
    if body.website:
        return {"ok": True}  # silently drop bots
    d = {k: v for k, v in body.data.items() if k in SURVEY_LABELS}
    email = (d.get("email") or "").strip() or None
    resp = SurveyResponse(
        data=d, email=email, respondent_type=d.get("respondentType") or None,
        location=(d.get("location") or None), wants_updates=d.get("earlyAccess") == "Yes" and bool(email),
    )
    db.add(resp)
    db.flush()
    s = settings()
    who = " · ".join(x for x in [d.get("respondentType"), d.get("location")] if x)
    mailer.send(db, to=[s.notify_to], kind="notify", subject=f"New AgroSense360 survey response #{resp.id}",
                greeting="A new survey response just came in.",
                body_html=(f"<p style=\"margin:0 0 16px 0;\">{html.escape(who) or 'A respondent'}"
                           + (f", {html.escape(email)}" if email else "") + ".</p>" + _answers_html(d)),
                button=("Open in the admin", f"{s.admin_url}/surveys/{resp.id}"), sign_name="BLOXio website",
                reply_to=email)
    if email:
        mailer.send(db, to=[email], kind="confirm", subject="Thanks for your AgroSense360 survey answers",
                    greeting="Thank you,",
                    body_html=mailer.text_to_html(
                        "Thank you for taking the AgroSense360 survey. Your answers go straight to the founders "
                        "and help decide which problems we solve first."
                        + ("\n\nYou asked to hear about early access, so we will let you know as the pilot moves forward."
                           if resp.wants_updates else "")),
                    button=("Learn about AgroSense360", "https://agrosense360.bloxio.tech"))
    db.commit()
    return {"ok": True, "id": resp.id}


class ContactIn(BaseModel):
    name: str = Field(min_length=1, max_length=160)
    email: EmailStr
    phone: str = Field(default="", max_length=60)
    org: str = Field(default="", max_length=200)
    topic: str = Field(default="", max_length=60)
    message: str = Field(min_length=1, max_length=8000)
    website: str = ""  # honeypot


TOPICS = {"project": "Start a project", "pilot": "AgroSense360 pilot", "invest": "Investment or partnership",
          "careers": "Careers", "other": "Something else"}


@router.post("/contact")
def submit_contact(body: ContactIn, request: Request, db: Session = Depends(get_db)):
    rate_limit(request)
    if body.website:
        return {"ok": True}
    enq = Enquiry(name=body.name.strip(), email=str(body.email), phone=body.phone.strip(), org=body.org.strip(),
                  topic=body.topic, message=body.message.strip())
    db.add(enq)
    db.flush()
    s = settings()
    topic = TOPICS.get(body.topic, body.topic or "Enquiry")
    e = html.escape
    first = e(enq.name.split()[0])
    mailer.send(db, to=[s.notify_to], kind="notify", reply_to=enq.email,
                subject=f"{topic}: {enq.name}" + (f" ({enq.org})" if enq.org else ""),
                greeting=f"New enquiry: {topic}",
                body_html=(f"<p style=\"margin:0 0 4px 0; color:{mailer.color('ink')}; font-weight:600;\">{e(enq.name)}</p>"
                           f"<p style=\"margin:0 0 16px 0; font-size:13px; color:{mailer.color('muted')};\">"
                           + " · ".join(e(x) for x in [enq.email, enq.org, enq.phone] if x) + "</p>"
                           + mailer.text_to_html(enq.message)
                           + f"<p style=\"margin:0 0 16px 0; font-size:13px; color:{mailer.color('muted')};\">"
                             f"Reply to this email to answer {first} directly.</p>"),
                button=("Open in the admin", f"{s.admin_url}/enquiries/{enq.id}"), sign_name="BLOXio website")
    mailer.send(db, to=[enq.email], kind="confirm", subject="We received your message",
                greeting=f"Dear {first},",
                body_html=mailer.text_to_html(
                    f"Thank you for getting in touch about “{topic}”. Your message has reached the founders, "
                    "and we aim to reply within 24 hours on working days."))
    db.commit()
    return {"ok": True, "id": enq.id}


@router.get("/content")
def published_content(db: Session = Depends(get_db)):
    """Published site content, read by the site's build (Publish triggers a rebuild)."""
    return {d.key: d.published for d in db.query(ContentDoc).all()}
