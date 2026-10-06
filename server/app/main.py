import asyncio
import json
import logging
import os
import time
from contextlib import asynccontextmanager
from pathlib import Path

import httpx
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select

from .config import settings
from .db import Base, SessionLocal, engine
from .models import Admin, AuditLog, ContentDoc
from .routers import admin, analytics, auth, public
from .routers.auth import send_password_link

logging.basicConfig(level=logging.INFO)
log = logging.getLogger("bloxio")

DEFAULTS = Path(__file__).with_name("content_defaults.json")
RESEND_ROUND = "2026-10-06b"


def seed() -> None:
    """Create tables, the founding admins (each emailed a set-password link)
    and any content section the database doesn't have yet."""
    Base.metadata.create_all(engine)
    with SessionLocal() as db:
        for item in settings().seed_admins.split(","):
            if not item.strip():
                continue
            email, name, role = (item.split("|") + ["", ""])[:3]
            email = email.strip().lower()
            if db.scalar(select(Admin).where(Admin.email == email)):
                continue
            a = Admin(email=email, name=name.strip(), is_super=role.strip() == "super", created_by="system")
            db.add(a)
            db.flush()
            log.info("Seeded admin %s (super=%s)", email, a.is_super)
        db.flush()
        # One-off: on the first start of a deploy that carries a new
        # RESEND_ROUND, every active admin is emailed a fresh set-password
        # link. Recorded in the activity log, so restarts never repeat it.
        # To send links to everyone again later, change RESEND_ROUND.
        if not db.scalar(select(AuditLog).where(AuditLog.action == "system.resend_links",
                                                AuditLog.entity_id == RESEND_ROUND)):
            failed = 0
            for a in db.scalars(select(Admin).where(Admin.active.is_(True))):
                entry = send_password_link(db, a, "invite", invited_by="BLOXio")
                ok = entry.status != "failed"
                failed += not ok
                log.info("Set-password link to %s: %s", a.email, "sent" if ok else f"FAILED ({entry.error})")
                time.sleep(0.6)  # Resend allows 2 emails a second
            if not failed:  # otherwise try again on the next start
                db.add(AuditLog(admin_email="system", action="system.resend_links", entity="admin",
                                entity_id=RESEND_ROUND, summary="Emailed every admin a fresh set-password link"))
        refreshed = []
        if DEFAULTS.exists():
            defaults = json.loads(DEFAULTS.read_text())
            docs = {d.key: d for d in db.scalars(select(ContentDoc))}
            for key, data in defaults.items():
                d = docs.get(key)
                if not d:
                    db.add(ContentDoc(key=key, draft=data, published=data, updated_by="system"))
                elif d.updated_by == "system" and d.published_by is None and d.published != data:
                    # never touched by an admin: keep it in step with the site's code
                    d.draft = d.published = data
                    refreshed.append(key)
            if refreshed:
                db.add(AuditLog(admin_email="system", action="system.content_refresh", entity="content",
                                entity_id=",".join(refreshed)[:120],
                                summary=f"Updated unedited sections from the site code: {', '.join(refreshed)}"))
        db.commit()
    if refreshed and settings().vercel_deploy_hook:
        # rebuild the public site so it picks the refreshed content up
        try:
            httpx.post(settings().vercel_deploy_hook, timeout=15)
            log.info("Content refreshed (%s); site rebuild started", ", ".join(refreshed))
        except httpx.HTTPError as e:
            log.error("Content refreshed but the site rebuild hook failed: %s", e)


async def keep_awake() -> None:
    """Render's free plan sleeps after 15 minutes without outside traffic.
    Every 3 minutes the API calls its own public address (RENDER_EXTERNAL_URL,
    set by Render), which goes through Render's proxy and counts as traffic,
    so it never sleeps. Does nothing off Render."""
    url = os.environ.get("RENDER_EXTERNAL_URL")
    if not url:
        return
    async with httpx.AsyncClient(timeout=30) as client:
        while True:
            await asyncio.sleep(180)
            try:
                await client.get(f"{url.rstrip('/')}/health")
            except httpx.HTTPError as e:
                log.warning("keep-awake ping failed: %s", e)


@asynccontextmanager
async def lifespan(_: FastAPI):
    seed()
    pinger = asyncio.create_task(keep_awake())
    yield
    pinger.cancel()


app = FastAPI(title="BLOXio API", lifespan=lifespan, docs_url="/docs")
app.add_middleware(CORSMiddleware, allow_origins=settings().origins, allow_credentials=False,
                   allow_methods=["*"], allow_headers=["*"], expose_headers=["Content-Disposition"])
app.include_router(public.router)
app.include_router(auth.router)
app.include_router(admin.router)
app.include_router(analytics.public)
app.include_router(analytics.admin)


@app.get("/health")
def health():
    return {"ok": True}
