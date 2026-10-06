"""Site traffic: recorded by the public site's /api/visit function (Vercel adds
the visitor's approximate location), read by the admin's Traffic page."""
import hashlib
import re
from datetime import date, datetime, timedelta, timezone
from urllib.parse import urlparse

from fastapi import APIRouter, Depends, Header, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import func
from sqlalchemy.orm import Session

from ..config import settings
from ..db import get_db
from ..models import Visit
from ..security import current_admin

public = APIRouter(prefix="/public", tags=["public"])
admin = APIRouter(prefix="/admin", tags=["admin"], dependencies=[Depends(current_admin)])

BOT = re.compile(r"bot|crawl|spider|slurp|preview|monitor|headless|lighthouse|curl|wget|python|httpx|axios|facebookexternalhit|whatsapp|telegram", re.I)


class VisitIn(BaseModel):
    host: str = Field(default="", max_length=80)
    path: str = Field(default="/", max_length=300)
    ref: str = Field(default="", max_length=500)
    country: str = Field(default="", max_length=2)
    region: str = Field(default="", max_length=80)
    city: str = Field(default="", max_length=120)
    ua: str = Field(default="", max_length=500)
    ip: str = Field(default="", max_length=80)


def _device(ua: str) -> str:
    if re.search(r"ipad|tablet|(android(?!.*mobile))", ua, re.I):
        return "tablet"
    return "mobile" if re.search(r"mobi|iphone|android", ua, re.I) else "desktop"


def _browser(ua: str) -> str:
    for name, pat in (("Edge", r"edg/"), ("Opera", r"opr/|opera"), ("Samsung", r"samsungbrowser"),
                      ("Chrome", r"chrome|crios"), ("Firefox", r"firefox|fxios"), ("Safari", r"safari")):
        if re.search(pat, ua, re.I):
            return name
    return "Other"


@public.post("/visit", status_code=204)
def record_visit(body: VisitIn, x_visit_secret: str = Header(default=""), db: Session = Depends(get_db)):
    secret = settings().visit_secret
    if not secret or x_visit_secret != secret:
        raise HTTPException(403, "Visits are recorded through the site only.")
    if not body.ua or BOT.search(body.ua):
        return
    ref_host = (urlparse(body.ref).hostname or "").removeprefix("www.") if body.ref else ""
    own = ("bloxio.tech",)
    if ref_host.endswith(own):
        ref_host = ""  # moving around the site isn't a referral
    day = date.today().isoformat()
    visitor = hashlib.sha256(f"{body.ip}|{body.ua}|{day}|{settings().jwt_secret}".encode()).hexdigest()[:16]
    db.add(Visit(host=body.host.removeprefix("www."), path=body.path.split("?")[0][:300] or "/", referrer=ref_host,
                 country=body.country.upper(), region=body.region, city=body.city,
                 device=_device(body.ua), browser=_browser(body.ua), visitor=visitor))
    db.commit()


def _counts(db: Session, col, since, until, host, limit=12):
    q = db.query(col, func.count()).filter(Visit.created_at >= since, Visit.created_at < until)
    if host:
        q = q.filter(Visit.host == host)
    return [[k or "", v] for k, v in q.group_by(col).order_by(func.count().desc()).limit(limit).all()]


@admin.get("/analytics")
def analytics(days: int = 30, host: str | None = None, db: Session = Depends(get_db)):
    days = max(1, min(days, 365))
    until = datetime.now(timezone.utc)
    since = until - timedelta(days=days)
    prev = since - timedelta(days=days)

    def totals(a, b):
        q = db.query(func.count(), func.count(func.distinct(Visit.visitor))).filter(Visit.created_at >= a, Visit.created_at < b)
        if host:
            q = q.filter(Visit.host == host)
        views, visitors = q.one()
        return {"views": views, "visitors": visitors}

    dayq = db.query(func.date(Visit.created_at), func.count(), func.count(func.distinct(Visit.visitor))) \
        .filter(Visit.created_at >= since)
    if host:
        dayq = dayq.filter(Visit.host == host)
    by_day = {str(d): [v, u] for d, v, u in dayq.group_by(func.date(Visit.created_at)).all()}
    series = []
    for i in range(days, -1, -1):
        d = (until - timedelta(days=i)).date().isoformat()
        v, u = by_day.get(d, [0, 0])
        series.append({"date": d, "views": v, "visitors": u})

    cityq = db.query(Visit.city, Visit.region, Visit.country, func.count()) \
        .filter(Visit.created_at >= since, Visit.city != "")
    if host:
        cityq = cityq.filter(Visit.host == host)
    cities = [{"city": c, "region": r, "country": k, "views": n} for c, r, k, n in
              cityq.group_by(Visit.city, Visit.region, Visit.country).order_by(func.count().desc()).limit(15)]

    return {
        "days": days,
        "current": totals(since, until),
        "previous": totals(prev, since),
        "series": series,
        "countries": _counts(db, Visit.country, since, until, host, 20),
        "cities": cities,
        "pages": _counts(db, Visit.path, since, until, host, 15),
        "referrers": _counts(db, Visit.referrer, since, until, host, 12),
        "devices": _counts(db, Visit.device, since, until, host),
        "browsers": _counts(db, Visit.browser, since, until, host),
        "hosts": _counts(db, Visit.host, since, until, None),
    }
