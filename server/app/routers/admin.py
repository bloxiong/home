"""Everything behind the admin login. Every change is written to the audit log."""
import csv
import io
from datetime import datetime

import httpx
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy import func, or_, String, cast
from sqlalchemy.orm import Session

from .. import audit, mailer
from ..config import settings
from ..db import get_db
from ..models import Admin, AuditLog, ContentDoc, EmailLog, Enquiry, PasswordToken, SurveyResponse, now
from ..security import current_admin, super_admin
from .auth import admin_out, send_password_link
from .public import SURVEY_LABELS

router = APIRouter(prefix="/admin", tags=["admin"], dependencies=[Depends(current_admin)])

SURVEY_STATUSES = {"new", "reviewed", "contacted", "archived"}
ENQUIRY_STATUSES = {"new", "replied", "closed"}


def page(q, limit: int, offset: int):
    return q.limit(min(limit, 200)).offset(offset).all()


# ── dashboard ─────────────────────────────────────────────────────────
@router.get("/stats")
def stats(db: Session = Depends(get_db)):
    surveys = db.query(SurveyResponse)
    by_type = dict(db.query(SurveyResponse.respondent_type, func.count()).group_by(SurveyResponse.respondent_type).all())
    by_consider = {}
    by_pay = {}
    ratings = []
    for (d,) in db.query(SurveyResponse.data).all():
        by_consider[d.get("considerUsing") or "—"] = by_consider.get(d.get("considerUsing") or "—", 0) + 1
        by_pay[d.get("willingToPay") or "—"] = by_pay.get(d.get("willingToPay") or "—", 0) + 1
        try:
            ratings.append(int(d.get("usefulnessRating")))
        except (TypeError, ValueError):
            pass
    return {
        "surveys": surveys.count(),
        "surveys_new": surveys.filter(SurveyResponse.status == "new").count(),
        "wants_updates": surveys.filter(SurveyResponse.wants_updates.is_(True)).count(),
        "enquiries": db.query(Enquiry).count(),
        "enquiries_new": db.query(Enquiry).filter(Enquiry.status == "new").count(),
        "avg_usefulness": round(sum(ratings) / len(ratings), 2) if ratings else None,
        "by_type": {k or "—": v for k, v in by_type.items()},
        "by_consider": by_consider,
        "by_pay": by_pay,
        "recent_surveys": [survey_out(s) for s in db.query(SurveyResponse).order_by(SurveyResponse.created_at.desc()).limit(5)],
        "recent_enquiries": [enquiry_out(e) for e in db.query(Enquiry).order_by(Enquiry.created_at.desc()).limit(5)],
    }


# ── survey responses ──────────────────────────────────────────────────
def survey_out(s: SurveyResponse) -> dict:
    return {"id": s.id, "data": s.data, "email": s.email, "respondent_type": s.respondent_type, "location": s.location,
            "wants_updates": s.wants_updates, "status": s.status, "notes": s.notes, "source": s.source,
            "created_at": s.created_at}


def survey_query(db: Session, q: str | None, status: str | None, respondent_type: str | None,
                 wants_updates: bool | None, since: datetime | None, until: datetime | None):
    query = db.query(SurveyResponse)
    if q:
        like = f"%{q}%"
        query = query.filter(or_(SurveyResponse.email.ilike(like), SurveyResponse.location.ilike(like),
                                 cast(SurveyResponse.data, String).ilike(like)))
    if status:
        query = query.filter(SurveyResponse.status == status)
    if respondent_type:
        query = query.filter(SurveyResponse.respondent_type == respondent_type)
    if wants_updates is not None:
        query = query.filter(SurveyResponse.wants_updates.is_(wants_updates))
    if since:
        query = query.filter(SurveyResponse.created_at >= since)
    if until:
        query = query.filter(SurveyResponse.created_at <= until)
    return query.order_by(SurveyResponse.created_at.desc())


@router.get("/surveys")
def list_surveys(q: str | None = None, status: str | None = None, respondent_type: str | None = None,
                 wants_updates: bool | None = None, since: datetime | None = None, until: datetime | None = None,
                 limit: int = 50, offset: int = 0, db: Session = Depends(get_db)):
    query = survey_query(db, q, status, respondent_type, wants_updates, since, until)
    return {"total": query.count(), "items": [survey_out(s) for s in page(query, limit, offset)],
            "labels": SURVEY_LABELS}


@router.get("/surveys/export.csv")
def export_surveys(q: str | None = None, status: str | None = None, respondent_type: str | None = None,
                   wants_updates: bool | None = None, since: datetime | None = None, until: datetime | None = None,
                   db: Session = Depends(get_db)):
    rows = survey_query(db, q, status, respondent_type, wants_updates, since, until).all()
    buf = io.StringIO()
    w = csv.writer(buf)
    keys = list(SURVEY_LABELS)
    w.writerow(["id", "submitted", "status", "notes", *[SURVEY_LABELS[k] for k in keys]])
    for s in rows:
        w.writerow([s.id, s.created_at.isoformat(), s.status, s.notes,
                    *[("; ".join(v) if isinstance(v := s.data.get(k), list) else (v or "")) for k in keys]])
    return StreamingResponse(iter([buf.getvalue()]), media_type="text/csv",
                             headers={"Content-Disposition": "attachment; filename=agrosense360-survey.csv"})


@router.get("/surveys/{sid}")
def get_survey(sid: int, db: Session = Depends(get_db)):
    s = db.get(SurveyResponse, sid)
    if not s:
        raise HTTPException(404, "Response not found.")
    return {**survey_out(s), "labels": SURVEY_LABELS}


class StatusNotesIn(BaseModel):
    status: str | None = None
    notes: str | None = Field(default=None, max_length=5000)


@router.patch("/surveys/{sid}")
def update_survey(sid: int, body: StatusNotesIn, me: Admin = Depends(current_admin), db: Session = Depends(get_db)):
    s = db.get(SurveyResponse, sid)
    if not s:
        raise HTTPException(404, "Response not found.")
    before = {"status": s.status, "notes": s.notes}
    if body.status is not None:
        if body.status not in SURVEY_STATUSES:
            raise HTTPException(400, "Unknown status.")
        s.status = body.status
    if body.notes is not None:
        s.notes = body.notes
    audit.record(db, me, "survey.update", entity="survey", entity_id=sid, before=before,
                 after={"status": s.status, "notes": s.notes}, summary=f"Updated survey response #{sid}")
    db.commit()
    return survey_out(s)


# ── enquiries ─────────────────────────────────────────────────────────
def enquiry_out(e: Enquiry) -> dict:
    return {"id": e.id, "name": e.name, "email": e.email, "phone": e.phone, "org": e.org, "topic": e.topic,
            "message": e.message, "status": e.status, "notes": e.notes, "created_at": e.created_at}


@router.get("/enquiries")
def list_enquiries(q: str | None = None, status: str | None = None, topic: str | None = None,
                   limit: int = 50, offset: int = 0, db: Session = Depends(get_db)):
    query = db.query(Enquiry)
    if q:
        like = f"%{q}%"
        query = query.filter(or_(Enquiry.name.ilike(like), Enquiry.email.ilike(like), Enquiry.org.ilike(like),
                                 Enquiry.message.ilike(like)))
    if status:
        query = query.filter(Enquiry.status == status)
    if topic:
        query = query.filter(Enquiry.topic == topic)
    query = query.order_by(Enquiry.created_at.desc())
    return {"total": query.count(), "items": [enquiry_out(e) for e in page(query, limit, offset)]}


@router.get("/enquiries/{eid}")
def get_enquiry(eid: int, db: Session = Depends(get_db)):
    e = db.get(Enquiry, eid)
    if not e:
        raise HTTPException(404, "Enquiry not found.")
    candidates = db.query(EmailLog).filter(cast(EmailLog.to, String).ilike(f"%{e.email}%")).order_by(EmailLog.created_at.desc())
    emails = [m for m in candidates if e.email.lower() in [t.lower() for t in m.to]]
    return {**enquiry_out(e), "emails": [email_out(m) for m in emails]}


@router.patch("/enquiries/{eid}")
def update_enquiry(eid: int, body: StatusNotesIn, me: Admin = Depends(current_admin), db: Session = Depends(get_db)):
    e = db.get(Enquiry, eid)
    if not e:
        raise HTTPException(404, "Enquiry not found.")
    before = {"status": e.status, "notes": e.notes}
    if body.status is not None:
        if body.status not in ENQUIRY_STATUSES:
            raise HTTPException(400, "Unknown status.")
        e.status = body.status
    if body.notes is not None:
        e.notes = body.notes
    audit.record(db, me, "enquiry.update", entity="enquiry", entity_id=eid, before=before,
                 after={"status": e.status, "notes": e.notes}, summary=f"Updated enquiry from {e.name}")
    db.commit()
    return enquiry_out(e)


# ── email ─────────────────────────────────────────────────────────────
def email_out(m: EmailLog) -> dict:
    return {"id": m.id, "kind": m.kind, "to": m.to, "subject": m.subject, "body": m.body, "status": m.status,
            "error": m.error, "sent_by": m.sent_by, "created_at": m.created_at}


@router.get("/email/recipients")
def recipients(db: Session = Depends(get_db)):
    """People it is fair to email: survey respondents who asked for updates, and enquirers."""
    pilot = [{"email": s.email, "label": f"{s.respondent_type or 'Respondent'} · {s.location or ''}".strip(" ·")}
             for s in db.query(SurveyResponse).filter(SurveyResponse.wants_updates.is_(True)).order_by(SurveyResponse.created_at.desc())]
    seen, uniq = set(), []
    for p in pilot:
        if p["email"].lower() not in seen:
            seen.add(p["email"].lower()); uniq.append(p)
    enq = [{"email": e.email, "label": f"{e.name} · {e.topic}"} for e in db.query(Enquiry).order_by(Enquiry.created_at.desc())]
    return {"updates_list": uniq, "enquirers": enq}


class ComposeIn(BaseModel):
    to: list[EmailStr] = Field(min_length=1, max_length=500)
    subject: str = Field(min_length=1, max_length=300)
    body: str = Field(min_length=1, max_length=20000)
    enquiry_id: int | None = None  # replying to an enquiry marks it replied
    separate: bool = True  # one email per person, so recipients never see each other


@router.post("/email/send")
def send_email(body: ComposeIn, me: Admin = Depends(current_admin), db: Session = Depends(get_db)):
    html_body = mailer.text_to_html(body.body)
    targets = [[str(t)] for t in body.to] if body.separate else [[str(t) for t in body.to]]
    results = [mailer.send(db, to=t, subject=body.subject, greeting=None, body_html=html_body, kind="compose",
                           sign_name=me.name or "The BLOXio team",
                           sent_by=me.email, reply_to=settings().notify_to) for t in targets]
    sent = sum(r.status in ("sent", "logged") for r in results)
    if body.enquiry_id and (e := db.get(Enquiry, body.enquiry_id)) and sent and e.status != "replied":
        audit.record(db, me, "enquiry.update", entity="enquiry", entity_id=e.id, before={"status": e.status},
                     after={"status": "replied"}, summary=f"Marked enquiry from {e.name} replied (email sent)")
        e.status = "replied"
    audit.record(db, me, "email.send", entity="email", entity_id=",".join(str(r.id) for r in results)[:120],
                 summary=f"Sent “{body.subject}” to {len(body.to)} recipient(s)",
                 after={"to": [str(t) for t in body.to], "subject": body.subject})
    db.commit()
    return {"sent": sent, "failed": len(results) - sent, "results": [email_out(r) for r in results]}


@router.get("/email/log")
def email_log(kind: str | None = None, limit: int = 50, offset: int = 0, db: Session = Depends(get_db)):
    query = db.query(EmailLog)
    if kind:
        query = query.filter(EmailLog.kind == kind)
    query = query.order_by(EmailLog.created_at.desc())
    return {"total": query.count(), "items": [email_out(m) for m in page(query, limit, offset)]}


# ── site content ──────────────────────────────────────────────────────
def content_meta(d: ContentDoc) -> dict:
    return {"key": d.key, "updated_at": d.updated_at, "updated_by": d.updated_by, "published_at": d.published_at,
            "published_by": d.published_by, "has_changes": d.draft != d.published}


@router.get("/content")
def list_content(db: Session = Depends(get_db)):
    return [content_meta(d) for d in db.query(ContentDoc).order_by(ContentDoc.key)]


@router.get("/content/{key}")
def get_content(key: str, db: Session = Depends(get_db)):
    d = db.get(ContentDoc, key)
    if not d:
        raise HTTPException(404, "Unknown content section.")
    return {**content_meta(d), "draft": d.draft, "published": d.published}


class ContentIn(BaseModel):
    data: dict | list


@router.put("/content/{key}")
def save_content(key: str, body: ContentIn, me: Admin = Depends(current_admin), db: Session = Depends(get_db)):
    d = db.get(ContentDoc, key)
    if not d:
        raise HTTPException(404, "Unknown content section.")
    if type(body.data) is not type(d.published):
        raise HTTPException(400, "That change doesn't match the shape of this section.")
    if key == "APPEARANCE" and body.data.get("lightHero") not in ("night", "morning"):
        raise HTTPException(400, "Choose the night or the morning light-mode hero.")
    before = d.draft
    d.draft, d.updated_at, d.updated_by = body.data, now(), me.email
    audit.record(db, me, "content.edit", entity="content", entity_id=key, before=before, after=body.data,
                 summary=f"Edited {key} (draft)")
    db.commit()
    return content_meta(d)


@router.post("/content/{key}/discard")
def discard_content(key: str, me: Admin = Depends(current_admin), db: Session = Depends(get_db)):
    d = db.get(ContentDoc, key)
    if not d:
        raise HTTPException(404, "Unknown content section.")
    before = d.draft
    d.draft, d.updated_at, d.updated_by = d.published, now(), me.email
    audit.record(db, me, "content.discard", entity="content", entity_id=key, before=before, after=d.published,
                 summary=f"Discarded draft changes to {key}")
    db.commit()
    return content_meta(d)


@router.post("/content/publish")
def publish(me: Admin = Depends(current_admin), db: Session = Depends(get_db)):
    changed = [d for d in db.query(ContentDoc).all() if d.draft != d.published]
    if not changed:
        return {"published": [], "deploy": "nothing to publish"}
    for d in changed:
        before = d.published
        d.published, d.published_at, d.published_by = d.draft, now(), me.email
        audit.record(db, me, "content.publish", entity="content", entity_id=d.key, before=before, after=d.draft,
                     summary=f"Published {d.key}")
    db.commit()
    deploy = "no deploy hook configured"
    if hook := settings().vercel_deploy_hook:
        try:
            r = httpx.post(hook, timeout=15)
            deploy = "site rebuild started" if r.status_code < 300 else f"deploy hook failed ({r.status_code})"
        except httpx.HTTPError as e:
            deploy = f"deploy hook failed ({e})"
    return {"published": [d.key for d in changed], "deploy": deploy}


# ── admins (anyone can see the list; only Owen and Austin can change it) ─
@router.get("/admins")
def list_admins(db: Session = Depends(get_db)):
    return [admin_out(a) for a in db.query(Admin).order_by(Admin.created_at)]


class NewAdminIn(BaseModel):
    email: EmailStr
    name: str = Field(default="", max_length=120)


@router.post("/admins")
def add_admin(body: NewAdminIn, me: Admin = Depends(super_admin), db: Session = Depends(get_db)):
    email = str(body.email).lower()
    a = db.query(Admin).filter(Admin.email == email).first()
    if a and a.active:
        raise HTTPException(400, "That person is already an admin.")
    if a:
        a.active, a.name = True, body.name or a.name
    else:
        a = Admin(email=email, name=body.name, created_by=me.email)
        db.add(a)
        db.flush()
    send_password_link(db, a, "invite", invited_by=me.name or me.email, sent_by=me.email)
    audit.record(db, me, "admin.create", entity="admin", entity_id=a.id, after={"email": email, "name": a.name},
                 summary=f"Added {email} as an admin")
    db.commit()
    return admin_out(a)


@router.post("/admins/{aid}/resend-invite")
def resend_invite(aid: int, me: Admin = Depends(super_admin), db: Session = Depends(get_db)):
    a = db.get(Admin, aid)
    if not a or not a.active:
        raise HTTPException(404, "Admin not found.")
    send_password_link(db, a, "invite", invited_by=me.name or me.email, sent_by=me.email)
    audit.record(db, me, "admin.invite", entity="admin", entity_id=aid, summary=f"Re-sent the set-password link to {a.email}")
    db.commit()
    return {"ok": True}


@router.delete("/admins/{aid}")
def remove_admin(aid: int, me: Admin = Depends(super_admin), db: Session = Depends(get_db)):
    a = db.get(Admin, aid)
    if not a or not a.active:
        raise HTTPException(404, "Admin not found.")
    if a.is_super:
        raise HTTPException(400, "Owen's and Austin's accounts can't be removed here.")
    a.active, a.token_version = False, a.token_version + 1
    for t in db.query(PasswordToken).filter(PasswordToken.admin_id == a.id, PasswordToken.used_at.is_(None)):
        t.used_at = now()  # old invite/reset links stop working
    audit.record(db, me, "admin.remove", entity="admin", entity_id=aid, before={"email": a.email},
                 summary=f"Removed {a.email} as an admin")
    db.commit()
    return {"ok": True}


# ── activity log ──────────────────────────────────────────────────────
@router.get("/audit")
def audit_log(admin_email: str | None = None, entity: str | None = None, limit: int = 50, offset: int = 0,
              db: Session = Depends(get_db)):
    query = db.query(AuditLog)
    if admin_email:
        query = query.filter(AuditLog.admin_email == admin_email)
    if entity:
        query = query.filter(AuditLog.entity == entity)
    query = query.order_by(AuditLog.created_at.desc())
    return {"total": query.count(), "items": [
        {"id": x.id, "admin_email": x.admin_email, "action": x.action, "entity": x.entity, "entity_id": x.entity_id,
         "summary": x.summary, "before": x.before, "after": x.after, "created_at": x.created_at}
        for x in page(query, limit, offset)]}
