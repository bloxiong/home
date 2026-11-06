import base64
import hashlib
import hmac
import json
import time
from email.message import EmailMessage

from app.config import settings
from app.db import SessionLocal
from app.models import Enquiry, MailMessage, MailThread
from tests.conftest import login

OWEN = "owen@bloxio.tech"


def raw_mail(sender="Ada Obi <ada@example.com>", subject="Pilot", body="Hello there", msg_id="<a1@example.com>", **headers):
    m = EmailMessage()
    m["From"], m["To"], m["Subject"], m["Message-ID"] = sender, "contact@bloxio.tech", subject, msg_id
    for k, v in headers.items():
        m[k.replace("_", "-")] = v
    m.set_content(body)
    return m


def inbound(client, mail, secret="test-inbound"):
    return client.post("/public/inbound", content=bytes(mail), headers={"x-inbound-secret": secret})


def webhook(client, data, kind="email.sent", secret=None):
    body = json.dumps({"type": kind, "data": data}).encode()
    ts = str(int(time.time()))
    key = base64.b64decode((secret or settings().resend_webhook_secret).removeprefix("whsec_"))
    sig = base64.b64encode(hmac.new(key, f"msg_1.{ts}.".encode() + body, hashlib.sha256).digest()).decode()
    return client.post("/public/resend-webhook", content=body,
                       headers={"svix-id": "msg_1", "svix-timestamp": ts, "svix-signature": f"v1,{sig}"})


def sent(email_id="re_1", to="ada@example.com", subject="Re: Pilot", message_id="<out1@ses>", **extra):
    return {"email_id": email_id, "from": '"BLOXio" <contact@bloxio.tech>', "to": [to], "subject": subject,
            "message_id": message_id, **extra}


def threads():
    with SessionLocal() as db:
        return [(t.contact_email, t.status, db.query(MailMessage).filter_by(thread_id=t.id).count()) for t in db.query(MailThread).order_by(MailThread.id)]


def test_inbound_needs_the_secret(client):
    assert inbound(client, raw_mail(), secret="wrong").status_code == 403
    assert threads() == []


def test_inbound_makes_a_thread_once_and_keeps_text_only(client):
    mail = raw_mail(body="Hello there")
    mail.add_alternative("<b>Hello there</b>", subtype="html")
    mail.add_attachment(b"x", maintype="application", subtype="pdf", filename="spec.pdf")
    assert inbound(client, mail).status_code == 204
    assert inbound(client, mail).status_code == 204
    assert threads() == [("ada@example.com", "new", 1)]
    with SessionLocal() as db:
        m = db.query(MailMessage).one()
        assert (m.from_name, m.body, m.attachments) == ("Ada Obi", "Hello there", ["spec.pdf"])


def test_html_only_mail_becomes_text(client):
    m = EmailMessage()
    m["From"], m["Subject"], m["Message-ID"] = "b@example.com", "Hi", "<h1@example.com>"
    m.set_content("<style>p{}</style><p>One &amp; two</p><script>alert(1)</script>", subtype="html")
    inbound(client, m)
    with SessionLocal() as db:
        assert db.query(MailMessage).one().body == "One & two"


def test_site_alerts_are_not_tracked(client):
    inbound(client, raw_mail(sender="BLOXio <no-reply@bloxio.tech>"))
    assert threads() == []


def test_webhook_rejects_a_bad_signature(client):
    assert webhook(client, sent(), secret="whsec_d3Jvbmc=").status_code == 403
    assert threads() == []


def test_gmail_reply_marks_the_exact_thread_and_they_can_write_back(client):
    inbound(client, raw_mail())
    inbound(client, raw_mail(subject="Different", msg_id="<a2@example.com>"))
    r = webhook(client, sent(subject="Totally changed", headers=[{"name": "In-Reply-To", "value": "<a1@example.com>"}]))
    assert r.status_code == 204
    assert threads() == [("ada@example.com", "replied", 2), ("ada@example.com", "new", 1)]
    assert webhook(client, sent()).status_code == 204  # Resend retrying changes nothing
    assert threads()[0] == ("ada@example.com", "replied", 2)
    inbound(client, raw_mail(subject="Re: Totally changed", msg_id="<a3@example.com>", In_Reply_To="<out1@ses>"))
    assert threads()[0] == ("ada@example.com", "new", 3)


def test_webhook_ignores_other_senders_and_events(client):
    webhook(client, {**sent(), "from": "BLOXio <no-reply@bloxio.tech>"})
    webhook(client, sent(), kind="email.delivered")
    assert threads() == []


def test_a_first_email_from_gmail_starts_a_thread(client):
    webhook(client, sent(to="new@example.com", subject="Hello"))
    assert threads() == [("new@example.com", "replied", 1)]


def test_gmail_reply_also_answers_their_enquiry(client):
    with SessionLocal() as db:
        db.add(Enquiry(name="Ada", email="Ada@Example.com", message="Hi", status="reviewed"))
        db.commit()
    webhook(client, sent())
    with SessionLocal() as db:
        assert db.query(Enquiry).one().status == "replied"


def test_portal_reply_and_its_webhook_count_once(client, monkeypatch):
    calls = []

    class Sent:
        status_code, text = 200, ""

        @staticmethod
        def json():
            return {"id": "re_portal"}

    def post(url, json, **_):
        calls.append(json)
        return Sent()

    monkeypatch.setattr("app.mailer.httpx.post", post)
    monkeypatch.setattr(settings(), "resend_api_key", "k")
    monkeypatch.setattr("app.routers.inbox.fetch_sent_text", lambda _: "")
    h = login(client, OWEN)
    inbound(client, raw_mail())
    tid = client.get("/admin/inbox", headers=h).json()["items"][0]["id"]
    r = client.post(f"/admin/inbox/{tid}/reply", json={"body": "Thanks"}, headers=h)
    assert r.status_code == 200 and r.json()["status"] == "replied"
    p = calls[-1]
    assert p["from"] == "BLOXio <contact@bloxio.tech>" and p["subject"] == "Re: Pilot"
    assert p["headers"]["In-Reply-To"] == "<a1@example.com>"
    webhook(client, sent(email_id="re_portal", message_id="<portal@ses>"))
    d = client.get(f"/admin/inbox/{tid}", headers=h).json()
    assert d["count"] == 2 and [m["source"] for m in d["messages"]] == ["worker", "portal"]
    with SessionLocal() as db:
        assert db.query(MailMessage).filter_by(resend_id="re_portal").one().message_id == "<portal@ses>"


def test_admin_list_search_status_and_login(client):
    assert client.get("/admin/inbox").status_code == 401
    h = login(client, OWEN)
    inbound(client, raw_mail())
    assert client.get("/admin/stats", headers=h).json()["inbox_new"] == 1
    assert client.get("/admin/inbox", params={"q": "hello there"}, headers=h).json()["total"] == 1
    assert client.get("/admin/inbox", params={"q": "nothing"}, headers=h).json()["total"] == 0
    tid = client.get("/admin/inbox", headers=h).json()["items"][0]["id"]
    assert client.patch(f"/admin/inbox/{tid}", json={"status": "nope"}, headers=h).status_code == 400
    assert client.patch(f"/admin/inbox/{tid}", json={"status": "replied"}, headers=h).json()["status"] == "replied"
    assert client.get("/admin/stats", headers=h).json()["inbox_new"] == 0
