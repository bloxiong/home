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



def test_light_hero_can_be_switched_back(client):
    h = login(client, CONTACT)
    assert client.get("/admin/content/APPEARANCE", headers=h).json()["published"] == {"lightHero": "night"}
    assert client.put("/admin/content/APPEARANCE", json={"data": {"lightHero": "sunset"}}, headers=h).status_code == 400
    assert client.put("/admin/content/APPEARANCE", json={"data": {"lightHero": "morning"}}, headers=h).status_code == 200
    client.post("/admin/content/publish", headers=h)
    assert client.get("/public/content").json()["APPEARANCE"] == {"lightHero": "morning"}

def test_password_reset_and_change(client):
    client.post("/auth/forgot", json={"email": CONTACT})
    assert any(k == "reset" for k, *_ in emails())
    h = login(client, CONTACT)
    weak = client.post("/auth/change-password", json={"current_password": "TestPassword1", "new_password": "short"}, headers=h)
    assert weak.status_code == 400
    ok = client.post("/auth/change-password", json={"current_password": "TestPassword1", "new_password": "NewPassword22"}, headers=h)
    assert ok.status_code == 200
    assert client.get("/auth/me", headers=h).status_code == 401  # old session signed out


def test_visits_need_secret_and_skip_bots(client, monkeypatch):
    from app.config import settings
    monkeypatch.setattr(settings(), "visit_secret", "s3cret")
    ua = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0) AppleWebKit Safari Mobile"
    assert client.post("/public/visit", json={"path": "/", "ua": ua}).status_code == 403
    h = {"x-visit-secret": "s3cret"}
    for path in ["/", "/products", "/"]:
        client.post("/public/visit", headers=h, json={"host": "bloxio.tech", "path": path, "ua": ua, "ip": "1.2.3.4",
                                                     "country": "ng", "region": "LA", "city": "Lagos",
                                                     "ref": "https://www.google.com/search?q=bloxio"})
    client.post("/public/visit", headers=h, json={"path": "/", "ua": "Googlebot/2.1", "ip": "9.9.9.9"})
    a = client.get("/admin/analytics?days=7", headers=login(client, CONTACT)).json()
    assert a["current"] == {"views": 3, "visitors": 1}
    assert a["countries"] == [["NG", 3]] and a["cities"][0]["city"] == "Lagos"
    assert ["google.com", 3] in a["referrers"] and ["mobile", 3] in a["devices"]


def test_invite_link_sets_password_then_login_works(client):
    from app.db import SessionLocal
    from app.models import Admin
    from app.security import new_password_token
    with SessionLocal() as db:
        a = db.query(Admin).filter_by(email="austin@bloxio.tech").one()
        a.password_hash = None
        raw = new_password_token(db, a, "invite")
        db.commit()
    bad = client.post("/auth/login", json={"email": "austin@bloxio.tech", "password": "Whatever123x"})
    assert bad.status_code == 401 and "invite email" in bad.json()["detail"]
    assert client.post("/auth/reset", json={"token": raw, "password": "MyNewPass123"}).status_code == 200
    assert client.post("/auth/reset", json={"token": raw, "password": "MyNewPass123"}).status_code == 400  # single use
    ok = client.post("/auth/login", json={"email": "Austin@Bloxio.tech", "password": "MyNewPass123"})
    assert ok.status_code == 200
