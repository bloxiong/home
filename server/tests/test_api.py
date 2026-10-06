from app.db import SessionLocal
from app.models import EmailLog
from tests.conftest import login

OWEN, CONTACT = "owen@bloxio.tech", "contact@bloxio.tech"


def emails():
    with SessionLocal() as db:
        return [(m.kind, m.to, m.subject) for m in db.query(EmailLog).order_by(EmailLog.id)]


def test_survey_saves_and_notifies(client):
    r = client.post("/public/survey", json={"data": {"respondentType": "Farmer", "location": "Owerri",
                                                     "earlyAccess": "Yes", "email": "farmer@example.com",
                                                     "biggestChallenges": ["Crop diseases"], "junk": "x"}})
    assert r.status_code == 200
    kinds = [(k, to) for k, to, _ in emails() if k in ("notify", "confirm")]
    assert ("notify", ["contact@bloxio.tech"]) in kinds          # admin notification
    assert ("confirm", ["farmer@example.com"]) in kinds          # thank-you to the respondent
    h = login(client, CONTACT)
    s = client.get(f"/admin/surveys/{r.json()['id']}", headers=h).json()
    assert s["wants_updates"] and "junk" not in s["data"]


def test_survey_without_email_only_notifies_admin(client):
    client.post("/public/survey", json={"data": {"respondentType": "Investor"}})
    assert [k for k, *_ in emails() if k in ("notify", "confirm")] == ["notify"]


def test_honeypot_drops_bots(client):
    client.post("/public/contact", json={"name": "Bot", "email": "b@x.com", "message": "spam", "website": "x"})
    h = login(client, CONTACT)
    assert client.get("/admin/enquiries", headers=h).json()["total"] == 0


def test_contact_notifies_and_confirms(client):
    r = client.post("/public/contact", json={"name": "Ada Obi", "email": "ada@example.com", "topic": "pilot",
                                             "message": "We farm 40 ha of tomato."})
    assert r.status_code == 200
    sent = [(k, to) for k, to, _ in emails()]
    assert ("notify", ["contact@bloxio.tech"]) in sent and ("confirm", ["ada@example.com"]) in sent


def test_admin_requires_login(client):
    assert client.get("/admin/stats").status_code == 401


def test_only_founders_add_admins(client):
    assert client.post("/admin/admins", json={"email": "new@bloxio.tech"}, headers=login(client, CONTACT)).status_code == 403
    r = client.post("/admin/admins", json={"email": "new@bloxio.tech", "name": "New"}, headers=login(client, OWEN))
    assert r.status_code == 200
    assert any(k == "invite" and to == ["new@bloxio.tech"] for k, to, _ in emails())


def test_content_edit_publish_is_audited(client):
    h = login(client, CONTACT)
    faqs = client.get("/admin/content/FAQS", headers=h).json()["draft"]
    faqs[0]["q"] = "Changed question?"
    assert client.put("/admin/content/FAQS", json={"data": faqs}, headers=h).status_code == 200
    assert client.get("/public/content").json()["FAQS"][0]["q"] != "Changed question?"  # draft only
    assert client.post("/admin/content/publish", headers=h).json()["published"] == ["FAQS"]
    assert client.get("/public/content").json()["FAQS"][0]["q"] == "Changed question?"
    log = client.get("/admin/audit", headers=h).json()["items"]
    assert {x["action"] for x in log} >= {"content.edit", "content.publish"}
    assert all(x["admin_email"] == CONTACT for x in log if x["entity"] == "content")


def test_password_reset_and_change(client):
    client.post("/auth/forgot", json={"email": CONTACT})
    assert any(k == "reset" for k, *_ in emails())
    h = login(client, CONTACT)
    weak = client.post("/auth/change-password", json={"current_password": "TestPassword1", "new_password": "short"}, headers=h)
    assert weak.status_code == 400
    ok = client.post("/auth/change-password", json={"current_password": "TestPassword1", "new_password": "NewPassword22"}, headers=h)
    assert ok.status_code == 200
    assert client.get("/auth/me", headers=h).status_code == 401  # old session signed out
