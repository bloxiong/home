"""Maintenance commands, run on the server (Render shell) or locally:

  python -m app.cli invite owen@bloxio.tech        # email a fresh set-password link
  python -m app.cli set-password EMAIL PASSWORD    # local development only
  python -m app.cli import-sheet responses.csv     # load old Google Sheet answers
"""
import csv
import sys
from datetime import datetime, timezone

from sqlalchemy import select

from .db import SessionLocal
from .main import seed
from .models import Admin, SurveyResponse
from .routers.auth import send_password_link
from .routers.public import SURVEY_LABELS
from .security import hash_password

LIST_FIELDS = {"biggestChallenges", "detectionMethods", "valuableFeatures", "futureProducts"}


def _admin(db, email):
    a = db.scalar(select(Admin).where(Admin.email == email.lower()))
    if not a:
        sys.exit(f"No admin {email}")
    return a


def main(argv: list[str]) -> None:
    seed()
    cmd, *args = argv or ["help"]
    with SessionLocal() as db:
        if cmd == "invite":
            send_password_link(db, _admin(db, args[0]), "invite", invited_by="BLOXio")
        elif cmd == "set-password":
            a = _admin(db, args[0])
            a.password_hash, a.token_version = hash_password(args[1]), a.token_version + 1
        elif cmd == "import-sheet":
            # Google Sheet export as CSV: columns named like the survey fields (respondentType, …) plus a Timestamp
            n = 0
            with open(args[0], newline="", encoding="utf-8-sig") as f:
                for row in csv.DictReader(f):
                    data = {k: ([x.strip() for x in (row.get(k) or "").split(",") if x.strip()] if k in LIST_FIELDS
                                else (row.get(k) or "").strip()) for k in SURVEY_LABELS}
                    when = row.get("Timestamp") or row.get("timestamp")
                    try:
                        created = datetime.fromisoformat(when) if when else datetime.now(timezone.utc)
                    except ValueError:
                        created = datetime.now(timezone.utc)
                    email = data.get("email") or None
                    db.add(SurveyResponse(data=data, email=email, respondent_type=data.get("respondentType") or None,
                                          location=data.get("location") or None, source="sheet-import",
                                          wants_updates=data.get("earlyAccess") == "Yes" and bool(email),
                                          created_at=created))
                    n += 1
            print(f"Imported {n} responses")
        else:
            print(__doc__)
            return
        db.commit()


if __name__ == "__main__":
    main(sys.argv[1:])
