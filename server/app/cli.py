"""Maintenance commands, run on the server (Render shell) or locally:

  python -m app.cli invite owen@bloxio.tech        # email a fresh set-password link
  python -m app.cli set-password EMAIL PASSWORD    # local development only
  python -m app.cli import-sheet responses.csv     # load old Google Sheet answers
"""
import csv
import json
import sys
from datetime import datetime, timezone

from sqlalchemy import String, cast, select

from .db import SessionLocal
from .main import seed
from .models import Admin, SurveyResponse
from .routers.auth import send_password_link
from .routers.public import SURVEY_LABELS
from .security import hash_password

# The survey's multi-choice options. Some contain commas themselves
# ("Smart lighting (e.g., drone lights, industrial lights)"), so a sheet cell is
# split by matching these first, then by commas for anything left over.
LIST_OPTIONS = {
    "biggestChallenges": ["Crop diseases", "Poor yield despite effort", "Soil quality or nutrient imbalance",
                          "Lack of real-time farm data", "Weather unpredictability", "High labor cost",
                          "Late detection of farm problems", "Other"],
    "detectionMethods": ["Manual inspection", "Advice from experts", "Trial and error", "No structured method", "Other"],
    "valuableFeatures": ["AI-based crop disease detection", "Soil moisture & nutrient monitoring",
                         "Early warning alerts (mobile)", "Yield improvement recommendations", "Remote farm monitoring",
                         "Farm data reports", "Other"],
    "futureProducts": ["Smart electronic devices", "Agricultural drones & accessories",
                       "Smart lighting (e.g., drone lights, industrial lights)", "Security & surveillance devices",
                       "Energy & power systems", "Other electronics"],
}
LIST_FIELDS = set(LIST_OPTIONS)


def split_choices(field: str, cell: str) -> list[str]:
    rest, found = f", {cell.strip()}, ", []
    for opt in sorted(LIST_OPTIONS[field], key=len, reverse=True):
        token = f", {opt}, "
        if token in rest:
            found.append(opt)
            rest = rest.replace(token, ", ")
    extra = [x.strip() for x in rest.split(",") if x.strip()]
    order = {o: i for i, o in enumerate(LIST_OPTIONS[field])}
    return sorted(found, key=order.get) + extra


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
            n = skipped = 0
            with open(args[0], newline="", encoding="utf-8-sig") as f:
                for row in csv.DictReader(f):
                    data = {k: (split_choices(k, row.get(k) or "") if k in LIST_FIELDS
                                else (row.get(k) or "").strip()) for k in SURVEY_LABELS}
                    if db.query(SurveyResponse).filter(SurveyResponse.source == "sheet-import",
                                                       cast(SurveyResponse.data, String) == json.dumps(data)).first():
                        skipped += 1
                        continue
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
            print(f"Imported {n} responses" + (f", skipped {skipped} already imported" if skipped else ""))
        else:
            print(__doc__)
            return
        db.commit()


if __name__ == "__main__":
    main(sys.argv[1:])
