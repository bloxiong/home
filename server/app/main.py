import json
import logging
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select

from .config import settings
from .db import Base, SessionLocal, engine
from .models import Admin, ContentDoc
from .routers import admin, auth, public
from .routers.auth import send_password_link

logging.basicConfig(level=logging.INFO)
log = logging.getLogger("bloxio")

DEFAULTS = Path(__file__).with_name("content_defaults.json")


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
            send_password_link(db, a, "invite", invited_by="BLOXio")
            log.info("Seeded admin %s (super=%s); set-password link emailed", email, a.is_super)
        if DEFAULTS.exists():
            defaults = json.loads(DEFAULTS.read_text())
            have = set(db.scalars(select(ContentDoc.key)))
            for key, data in defaults.items():
                if key not in have:
                    db.add(ContentDoc(key=key, draft=data, published=data, updated_by="system"))
        db.commit()


@asynccontextmanager
async def lifespan(_: FastAPI):
    seed()
    yield


app = FastAPI(title="BLOXio API", lifespan=lifespan, docs_url="/docs")
app.add_middleware(CORSMiddleware, allow_origins=settings().origins, allow_credentials=False,
                   allow_methods=["*"], allow_headers=["*"], expose_headers=["Content-Disposition"])
app.include_router(public.router)
app.include_router(auth.router)
app.include_router(admin.router)


@app.get("/health")
def health():
    return {"ok": True}
