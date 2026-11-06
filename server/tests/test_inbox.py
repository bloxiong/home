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


def test_designed_mail_keeps_its_html(client):
    mail = raw_mail(body="Plain version")
    mail.add_alternative("<table><tr><td>Designed</td></tr></table>", subtype="html")
    inbound(client, mail)
    h = login(client, OWEN)
    d = client.get("/admin/inbox/1", headers=h).json()["messages"][0]
    assert d["body"] == "Plain version" and "<table>" in d["html"]


def test_previews_leave_out_quoted_history(client, monkeypatch):
    monkeypatch.setattr("app.routers.inbox.fetch_sent", lambda _: ("Thanks Ada\n\nOn Fri, 6 Nov 2026 at 17:00, Ada <a@b.c> wrote:\n> Hello", "<p>Thanks Ada</p>"))
    webhook(client, sent())
    h = login(client, OWEN)
    assert client.get("/admin/inbox", headers=h).json()["items"][0]["snippet"] == "Thanks Ada"
    assert client.get("/admin/inbox/1", headers=h).json()["messages"][0]["from_name"] == "BLOXio"


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
    monkeypatch.setattr(settings(), "inbox_auto_reply", False)
    monkeypatch.setattr("app.routers.inbox.fetch_sent", lambda _: ("", ""))
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


AUSTIN, CONTACT = "austin@bloxio.tech", "contact@bloxio.tech"


def to_mailbox(client, mailbox, msg_id, subject="Private"):
    r = client.post("/public/inbound", content=bytes(raw_mail(subject=subject, msg_id=msg_id)),
                    headers={"x-inbound-secret": "test-inbound", "x-mailbox": mailbox})
    assert r.status_code == 204


def boxes(client, who):
    d = client.get("/admin/inbox", headers=login(client, who)).json()
    return d["mailboxes"], sorted(t["mailbox"] for t in d["items"])


def test_each_admin_sees_only_their_mailboxes(client):
    for box, mid in ((OWEN, "<o@x>"), (AUSTIN, "<u@x>"), (CONTACT, "<c@x>")):
        to_mailbox(client, box, mid)
    assert boxes(client, OWEN) == ([OWEN, CONTACT], [CONTACT, OWEN])
    assert boxes(client, AUSTIN) == ([AUSTIN, CONTACT], [AUSTIN, CONTACT])
    assert boxes(client, CONTACT) == ([CONTACT], [CONTACT])
    assert client.get("/admin/stats", headers=login(client, CONTACT)).json()["inbox_new"] == 1
    assert client.get("/admin/stats", headers=login(client, OWEN)).json()["inbox_new"] == 2


def test_another_super_admins_mail_cannot_be_reached_by_id_or_filter(client):
    to_mailbox(client, OWEN, "<o@x>")
    h = login(client, AUSTIN)
    assert client.get("/admin/inbox/1", headers=h).status_code == 404
    assert client.patch("/admin/inbox/1", json={"status": "closed"}, headers=h).status_code == 404
    assert client.post("/admin/inbox/1/reply", json={"body": "x"}, headers=h).status_code == 404
    assert client.get("/admin/inbox", params={"mailbox": OWEN}, headers=h).json()["items"] == []
    assert client.get("/admin/inbox", params={"q": "hello"}, headers=h).json()["total"] == 0
    assert client.get("/admin/inbox/1", headers=login(client, CONTACT)).status_code == 404


def test_personal_mail_stays_out_of_shared_logs(client):
    to_mailbox(client, OWEN, "<o@x>", subject="Secret plans")
    h = login(client, OWEN)
    client.patch("/admin/inbox/1", json={"status": "reviewed"}, headers=h)
    assert client.post("/admin/inbox/1/reply", json={"body": "Secret reply"}, headers=h).status_code == 200
    austin = login(client, AUSTIN)
    assert "Secret" not in client.get("/admin/email/log", headers=austin).text
    assert "ada@example.com" not in client.get("/admin/activity", headers=austin).text


def test_the_same_email_to_two_mailboxes_is_kept_in_both(client):
    to_mailbox(client, OWEN, "<same@x>")
    to_mailbox(client, CONTACT, "<same@x>")
    assert sorted(t[0] for t in threads()) == ["ada@example.com", "ada@example.com"]
    with SessionLocal() as db:
        assert db.query(MailMessage).count() == 2


def test_unknown_mailbox_header_falls_back_to_the_shared_inbox(client):
    to_mailbox(client, "someone@else.com", "<z@x>")
    with SessionLocal() as db:
        assert db.query(MailThread).one().mailbox == CONTACT


def test_reply_sent_from_a_personal_mailbox_is_tracked_there(client):
    to_mailbox(client, OWEN, "<o@x>", subject="Pilot")
    webhook(client, {**sent(), "from": "Owen <owen@bloxio.tech>", "headers": [{"name": "In-Reply-To", "value": "<o@x>"}]})
    assert threads() == [("ada@example.com", "replied", 2)]


def section_id(client, h, name):
    return next(s["id"] for s in client.get("/admin/inbox/senders", headers=h).json()["sections"] if s["name"] == name)


def test_starting_sections_appear_once_and_survive_being_removed(client):
    h = login(client, OWEN)
    d = client.get("/admin/inbox/senders", headers=h).json()
    assert sorted(s["name"] for s in d["sections"]) == ["Application", "Inquiry", "Project"]
    assert client.delete(f"/admin/inbox/sections/{section_id(client, h, 'Project')}", headers=h).status_code == 204
    from app.main import seed
    seed()
    assert "Project" not in [s["name"] for s in client.get("/admin/inbox/senders", headers=h).json()["sections"]]


def test_sections_group_people_not_emails(client):
    h = login(client, OWEN)
    to_mailbox(client, CONTACT, "<c1@x>", subject="One")
    to_mailbox(client, CONTACT, "<c2@x>", subject="Two")
    d = client.get("/admin/inbox/senders", headers=h).json()
    assert d["total"] == 1 and d["items"][0]["emails"] == 2 and d["items"][0]["conversations"] == 2 and d["uncategorised"] == 1
    sid = section_id(client, h, "Inquiry")
    body = {"mailbox": CONTACT, "email": "ada@example.com", "section_id": sid}
    assert client.put("/admin/inbox/sender/section", json=body, headers=h).status_code == 200
    d = client.get("/admin/inbox/senders", params={"section": sid}, headers=h).json()
    assert d["total"] == 1 and d["uncategorised"] == 0
    assert client.get("/admin/inbox/senders", params={"section": "none"}, headers=h).json()["total"] == 0
    sender = client.get("/admin/inbox/sender", params={"mailbox": CONTACT, "email": "ada@example.com"}, headers=h).json()
    assert sender["section_id"] == sid and sorted(t["subject"] for t in sender["threads"]) == ["One", "Two"]
    # a new email from them stays filed
    to_mailbox(client, CONTACT, "<c3@x>", subject="Three")
    assert client.get("/admin/inbox/senders", params={"section": sid}, headers=h).json()["items"][0]["emails"] == 3


def test_admins_can_add_rename_and_remove_sections(client):
    h = login(client, CONTACT)
    made = client.post("/admin/inbox/sections", json={"name": "  Press  "}, headers=h)
    assert made.status_code == 201 and made.json()["name"] == "Press"
    assert client.post("/admin/inbox/sections", json={"name": "press"}, headers=h).status_code == 409
    assert client.post("/admin/inbox/sections", json={"name": "   "}, headers=h).status_code == 400
    sid = made.json()["id"]
    assert client.patch(f"/admin/inbox/sections/{sid}", json={"name": "Media"}, headers=h).json()["name"] == "Media"
    to_mailbox(client, CONTACT, "<c@x>")
    client.put("/admin/inbox/sender/section", json={"mailbox": CONTACT, "email": "ada@example.com", "section_id": sid}, headers=h)
    assert client.delete(f"/admin/inbox/sections/{sid}", headers=h).status_code == 204
    d = client.get("/admin/inbox/senders", headers=h).json()
    assert d["total"] == 1 and d["uncategorised"] == 1  # the sender and their mail stay


def test_senders_keep_to_the_mailbox_rules(client):
    to_mailbox(client, OWEN, "<o@x>")
    ha, ho = login(client, AUSTIN), login(client, OWEN)
    assert client.get("/admin/inbox/senders", headers=ha).json()["total"] == 0
    assert client.get("/admin/inbox/senders", params={"mailbox": OWEN}, headers=ha).json()["total"] == 0
    params = {"mailbox": OWEN, "email": "ada@example.com"}
    assert client.get("/admin/inbox/sender", params=params, headers=ha).status_code == 404
    assert client.put("/admin/inbox/sender/section", json={**params, "section_id": None}, headers=ha).status_code == 404
    assert client.get("/admin/inbox/sender", params=params, headers=ho).status_code == 200


def test_filing_in_one_mailbox_does_not_touch_another(client):
    to_mailbox(client, OWEN, "<same@x>")
    to_mailbox(client, CONTACT, "<same@x>")
    h = login(client, OWEN)
    client.put("/admin/inbox/sender/section", json={"mailbox": OWEN, "email": "ada@example.com", "section_id": section_id(client, h, "Project")}, headers=h)
    assert client.get("/admin/inbox/senders", params={"mailbox": CONTACT}, headers=h).json()["items"][0]["section_id"] is None


def test_enquiry_matching_is_exact(client):
    with SessionLocal() as db:
        db.add(Enquiry(name="Near", email="axb@example.com", message="Hi"))
        db.commit()
    webhook(client, sent(to="a_b@example.com"))
    with SessionLocal() as db:
        assert db.query(Enquiry).one().status == "new"


def test_portal_reply_survives_the_webhook_arriving_first(client, monkeypatch):
    h = login(client, OWEN)
    inbound(client, raw_mail())

    class Sent:
        status_code, text = 200, ""

        @staticmethod
        def json():
            return {"id": "re_race"}

    def post(url, json, **_):
        webhook(client, sent(email_id="re_race", message_id="<race@ses>"))  # lands before this request finishes
        return Sent()

    monkeypatch.setattr("app.mailer.httpx.post", post)
    monkeypatch.setattr(settings(), "resend_api_key", "k")
    monkeypatch.setattr("app.routers.inbox.fetch_sent", lambda _: ("", ""))
    r = client.post("/admin/inbox/1/reply", json={"body": "Thanks"}, headers=h)
    assert r.status_code == 200
    msgs = r.json()["messages"]
    assert len(msgs) == 2 and msgs[1]["source"] == "portal" and msgs[1]["body"] == "Thanks"


def cf_row(**kw):
    return {"datetime": "2026-10-20T10:00:00Z", "from": "ada@example.com", "to": CONTACT, "subject": "Old one", "status": "delivered", "messageId": "old1@example.com", **kw}


def test_cloudflare_history_has_no_text_and_full_mail_fills_it_in(client):
    from app.inbox_sync import store_cloudflare_rows
    from app.routers.inbox import store_inbound
    rows = [cf_row(), cf_row(messageId="d", status="dropped"), cf_row(messageId="x", to="other@bloxio.tech"),
            cf_row(messageId="y", **{"from": "010001@send.bloxio.tech"})]
    with SessionLocal() as db:
        assert store_cloudflare_rows(db, rows)["added"] == 1
        assert store_cloudflare_rows(db, rows)["added"] == 0
        assert db.query(MailMessage).one().body == ""
        assert store_inbound(db, CONTACT, bytes(raw_mail(subject="Old one", body="The real text", msg_id="<old1@example.com>")))
        m = db.query(MailMessage).one()
        assert m.body == "The real text" and m.from_name == "Ada Obi"


def test_resend_history_joins_the_conversation_and_keeps_order(client, monkeypatch):
    from app import inbox_sync
    from app.inbox_sync import store_cloudflare_rows, sync_resend
    with SessionLocal() as db:
        store_cloudflare_rows(db, [cf_row()])
    listed = [
        {"id": "r2", "from": "BLOXIO <contact@bloxio.tech>", "to": ["Ada Obi <ada@example.com>"], "subject": "Re: Old one", "created_at": "2026-10-20 12:00:00.1+00", "last_event": "delivered", "message_id": "<r2@ses>"},
        {"id": "r3", "from": "BLOXio <no-reply@bloxio.tech>", "to": ["ada@example.com"], "subject": "Site mail", "created_at": "2026-10-20 13:00:00+00", "last_event": "delivered"},
        {"id": "r4", "from": "BLOXIO <contact@bloxio.tech>", "to": ["delivered@resend.dev"], "subject": "Test", "created_at": "2026-10-20 14:00:00+00", "last_event": "delivered"},
        {"id": "r5", "from": "BLOXIO <contact@bloxio.tech>", "to": ["b@example.com"], "subject": "Failed", "created_at": "2026-10-20 15:00:00+00", "last_event": "failed"},
    ]

    class R:
        def __init__(self, d):
            self.d = d

        def raise_for_status(self):
            pass

        def json(self):
            return self.d

    def get(url, **_):
        return R({"data": listed, "has_more": False}) if url.endswith("/emails") else R({"text": "Thanks Ada", "html": "<p>Thanks Ada</p>"})

    monkeypatch.setattr(inbox_sync.httpx, "get", get)
    with SessionLocal() as db:
        assert sync_resend(db, "k", pause=0)["added"] == 1
        assert sync_resend(db, "k", pause=0)["added"] == 0
    assert threads() == [("ada@example.com", "replied", 2)]
    # importing something older than what the thread already holds leaves its status alone
    with SessionLocal() as db:
        store_cloudflare_rows(db, [cf_row(messageId="older", datetime="2026-10-19T10:00:00Z", subject="Re: Old one")])
        assert db.query(MailThread).one().status == "replied"
    h = login(client, OWEN)
    assert client.get("/admin/inbox/sender", params={"mailbox": CONTACT, "email": "ada@example.com"}, headers=h).json()["name"] == "Ada Obi"


def test_mbox_import_keeps_only_that_mailbox(client, tmp_path):
    import mailbox as mbox_lib
    from app.inbox_sync import import_mbox
    path = tmp_path / "all.mbox"
    box = mbox_lib.mbox(str(path))
    box.add(raw_mail(msg_id="<m1@x>"))
    other = EmailMessage()
    other["From"], other["To"], other["Subject"], other["Message-ID"] = "z@example.com", "someone@else.com", "Other", "<m2@x>"
    other.set_content("no")
    box.add(other)
    box.flush()
    box.close()
    with SessionLocal() as db:
        assert import_mbox(db, CONTACT, str(path)) == {"source": "mbox", "added": 1, "skipped": 1}
        assert import_mbox(db, CONTACT, str(path))["added"] == 0


def test_cloudflare_sender_line_is_split_into_name_and_address(client):
    from app.inbox_sync import store_cloudflare_rows
    with SessionLocal() as db:
        store_cloudflare_rows(db, [cf_row(**{"from": '"Ada Obi" <ADA@example.com>'}), cf_row(messageId="o", **{"from": "BLOXio <no-reply@bloxio.tech>"})])
        t = db.query(MailThread).one()
        assert (t.contact_email, t.contact_name) == ("ada@example.com", "Ada Obi")


def sent_mail(monkeypatch):
    calls = []

    class Ok:
        status_code, text = 200, ""

        def __init__(self, n):
            self.n = n

        def json(self):
            return {"id": f"re_auto{self.n}"}

    def post(url, json, **_):
        calls.append(json)
        return Ok(len(calls))

    monkeypatch.setattr("app.mailer.httpx.post", post)
    monkeypatch.setattr(settings(), "resend_api_key", "k")
    monkeypatch.setattr("app.routers.inbox.fetch_sent", lambda _: ("", ""))
    return calls


def test_first_time_sender_gets_one_threaded_reply_from_no_reply(client, monkeypatch):
    calls = sent_mail(monkeypatch)
    to_mailbox(client, CONTACT, "<f1@x>", subject="Pilot")
    assert len(calls) == 1
    a = calls[0]
    assert "no-reply@bloxio.tech" in a["from"] and a["to"] == ["ada@example.com"] and a["subject"] == "Re: Pilot"
    assert a["reply_to"] == CONTACT and a["headers"]["In-Reply-To"] == "<f1@x>" and a["headers"]["Auto-Submitted"] == "auto-replied"
    # the same email again, or another email, gets nothing more; the conversation still needs a human
    to_mailbox(client, CONTACT, "<f1@x>", subject="Pilot")
    to_mailbox(client, CONTACT, "<f2@x>", subject="Another topic")
    assert len(calls) == 1
    assert threads()[0] == ("ada@example.com", "new", 2)


def test_each_mailbox_greets_separately_and_signs_for_its_owner(client, monkeypatch):
    calls = sent_mail(monkeypatch)
    to_mailbox(client, OWEN, "<o1@x>")
    to_mailbox(client, CONTACT, "<o1@x>")
    assert len(calls) == 2 and calls[0]["reply_to"] == OWEN and "Owen" in calls[0]["html"]
    with SessionLocal() as db:
        from app.models import EmailLog
        assert db.query(EmailLog).filter_by(kind="auto").count() == 1  # only the shared mailbox is logged


def test_mail_after_closing_opens_a_new_conversation_with_a_new_reply(client, monkeypatch):
    calls = sent_mail(monkeypatch)
    h = login(client, OWEN)
    to_mailbox(client, CONTACT, "<c1@x>", subject="Pilot")
    tid = client.get("/admin/inbox", headers=h).json()["items"][0]["id"]
    client.patch(f"/admin/inbox/{tid}", json={"status": "closed"}, headers=h)
    r = client.post("/public/inbound", content=bytes(raw_mail(subject="Re: Pilot", msg_id="<c2@x>", In_Reply_To="<c1@x>")),
                    headers={"x-inbound-secret": "test-inbound", "x-mailbox": CONTACT})
    assert r.status_code == 204 and len(calls) == 2
    d = client.get("/admin/inbox", params={"state": "open"}, headers=h).json()
    assert d["open"] == 1 and d["closed"] == 1 and d["items"][0]["id"] != tid
    assert client.get(f"/admin/inbox/{tid}", headers=h).json()["status"] == "closed"
    assert client.get("/admin/inbox", params={"state": "closed"}, headers=h).json()["items"][0]["id"] == tid
    # still one contact
    s = client.get("/admin/inbox/senders", headers=h).json()
    assert s["total"] == 1 and s["items"][0]["conversations"] == 2


def test_one_open_conversation_means_no_acknowledgement_after_closing_another(client, monkeypatch):
    calls = sent_mail(monkeypatch)
    h = login(client, OWEN)
    to_mailbox(client, CONTACT, "<a@x>", subject="One")
    to_mailbox(client, CONTACT, "<b@x>", subject="Two")
    first = client.get("/admin/inbox", headers=h).json()["items"][-1]["id"]
    client.patch(f"/admin/inbox/{first}", json={"status": "closed"}, headers=h)
    to_mailbox(client, CONTACT, "<c@x>", subject="Re: One")
    assert len(calls) == 1


def test_reopening_keeps_one_contact_and_gmail_reply_can_reopen(client, monkeypatch):
    sent_mail(monkeypatch)
    h = login(client, OWEN)
    to_mailbox(client, CONTACT, "<a@x>", subject="One")
    client.patch("/admin/inbox/1", json={"status": "closed"}, headers=h)
    client.patch("/admin/inbox/1", json={"status": "reviewed"}, headers=h)
    assert client.get("/admin/inbox/senders", headers=h).json()["total"] == 1
    client.patch("/admin/inbox/1", json={"status": "closed"}, headers=h)
    webhook(client, sent(email_id="re_g", subject="Re: One", headers=[{"name": "In-Reply-To", "value": "<a@x>"}]))
    assert client.get("/admin/inbox/1", headers=h).json()["status"] == "replied"


def test_machines_lists_and_colleagues_are_never_answered(client, monkeypatch):
    calls = sent_mail(monkeypatch)
    cases = [
        raw_mail(sender="no-reply@accounts.google.com", msg_id="<1@x>"),
        raw_mail(sender="Instagram <security@mail.instagram.com>", msg_id="<2@x>"),
        raw_mail(sender="bounces+123@example.com", msg_id="<3@x>"),
        raw_mail(sender="a@example.com", msg_id="<4@x>", Auto_Submitted="auto-replied"),
        raw_mail(sender="b@example.com", msg_id="<5@x>", List_Id="<list.example.com>"),
        raw_mail(sender="c@example.com", msg_id="<6@x>", Precedence="bulk"),
        raw_mail(sender="d@example.com", msg_id="<7@x>", List_Unsubscribe="<mailto:x@example.com>"),
        raw_mail(sender="e@example.com", msg_id="<8@x>", Authentication_Results="mx.cloudflare.net; dmarc=fail"),
        raw_mail(sender="Owen <owen@bloxio.tech>", msg_id="<9@x>"),
    ]
    for m in cases:
        assert inbound(client, m).status_code == 204
    assert calls == []
    assert len(threads()) == 9  # kept, just not answered


def test_imports_and_the_off_switch_send_nothing(client, monkeypatch):
    from app.inbox_sync import store_cloudflare_rows
    from app.routers.inbox import store_inbound
    calls = sent_mail(monkeypatch)
    with SessionLocal() as db:
        store_cloudflare_rows(db, [cf_row()])
        store_inbound(db, CONTACT, bytes(raw_mail(sender="new@example.com", msg_id="<n@x>")))
    monkeypatch.setattr(settings(), "inbox_auto_reply", False)
    to_mailbox(client, CONTACT, "<off@x>")  # ada was imported, so she isn't new anyway
    inbound(client, raw_mail(sender="other@example.com", msg_id="<off2@x>"))
    assert calls == []


def test_a_failed_acknowledgement_keeps_the_email(client, monkeypatch):
    class Bad:
        status_code, text = 500, "no"

    monkeypatch.setattr("app.mailer.httpx.post", lambda *a, **k: Bad())
    monkeypatch.setattr(settings(), "resend_api_key", "k")
    assert inbound(client, raw_mail()).status_code == 204
    assert threads() == [("ada@example.com", "new", 1)]


def test_people_known_from_history_are_not_first_time(client, monkeypatch):
    from app.inbox_sync import store_cloudflare_rows
    calls = sent_mail(monkeypatch)
    with SessionLocal() as db:
        store_cloudflare_rows(db, [cf_row()])
    inbound(client, raw_mail(subject="Something new", msg_id="<later@x>"))
    assert calls == []


def test_an_automatic_reply_is_shown_and_does_not_count_as_answered(client, monkeypatch):
    sent_mail(monkeypatch)
    h = login(client, OWEN)
    to_mailbox(client, CONTACT, "<a@x>", subject="One")
    d = client.get("/admin/inbox/1", headers=h).json()
    assert d["status"] == "new" and [m["source"] for m in d["messages"]] == ["worker", "auto"]


def kinds(client, h, **params):
    d = client.get("/admin/inbox", params=params, headers=h).json()
    return d["people"], d["platforms"], d["total"]


def test_platform_mail_is_sorted_out_of_people_and_the_new_count(client):
    h = login(client, OWEN)
    inbound(client, raw_mail())
    inbound(client, raw_mail(sender="Instagram <security@mail.instagram.com>", msg_id="<i@x>"))
    inbound(client, raw_mail(sender="Newsletter <hello@shop.example.com>", msg_id="<n@x>", List_Unsubscribe="<mailto:u@x.com>"))
    inbound(client, raw_mail(sender="X <info@x.com>", msg_id="<xx@x>"))
    assert kinds(client, h, kind="person") == (1, 3, 1)
    assert kinds(client, h, kind="platform") == (1, 3, 3)
    assert client.get("/admin/stats", headers=h).json()["inbox_new"] == 1
    s = client.get("/admin/inbox/senders", params={"kind": "person"}, headers=h).json()
    assert s["people"] == 1 and s["platforms"] == 3 and s["total"] == 1 and s["all"] == 1
    assert client.get("/admin/inbox/senders", params={"kind": "platform"}, headers=h).json()["total"] == 3


def test_real_people_at_lookalike_domains_stay_people(client):
    from app.routers.inbox import platform_address
    for person in ("ada@gmail.com", "ada@notx.com", "ada@google.com", "owen@bloxio.tech", "notifications@bloxio.tech", "newsman@example.com"):
        assert not platform_address(person), person
    for service in ("no-reply@accounts.google.com", "a@mail.instagram.com", "drive-shares-noreply@google.com", "a@e.linkedin.com", "notifications@github.com"):
        assert platform_address(service), service


def test_moving_a_sender_wins_over_later_mail(client):
    h = login(client, OWEN)
    box = {"mailbox": CONTACT, "email": "notifications@acme.example"}
    inbound(client, raw_mail(sender="Acme <notifications@acme.example>", msg_id="<1@x>"))
    assert kinds(client, h, kind="platform")[2] == 1
    assert client.put("/admin/inbox/sender/kind", json={**box, "kind": "person"}, headers=h).status_code == 200
    inbound(client, raw_mail(sender="Acme <notifications@acme.example>", subject="Again", msg_id="<2@x>"))
    assert kinds(client, h, kind="platform")[2] == 0 and kinds(client, h, kind="person")[2] == 2
    assert client.get("/admin/inbox/1", headers=h).json()["kind"] == "person"
    assert client.get("/admin/stats", headers=h).json()["inbox_new"] == 2
    # and the other way
    inbound(client, raw_mail(msg_id="<3@x>"))
    client.put("/admin/inbox/sender/kind", json={"mailbox": CONTACT, "email": "ada@example.com", "kind": "platform"}, headers=h)
    inbound(client, raw_mail(subject="Later", msg_id="<4@x>"))
    assert kinds(client, h, kind="platform")[2] == 2


def test_sorting_keeps_to_the_mailbox_rules_and_stays_in_one_mailbox(client):
    to_mailbox(client, OWEN, "<o@x>")
    to_mailbox(client, CONTACT, "<o@x>")
    ha, ho = login(client, AUSTIN), login(client, OWEN)
    body = {"mailbox": OWEN, "email": "ada@example.com", "kind": "platform"}
    assert client.put("/admin/inbox/sender/kind", json=body, headers=ha).status_code == 404
    assert client.put("/admin/inbox/sender/kind", json={**body, "kind": "nope"}, headers=ho).status_code == 400
    assert client.put("/admin/inbox/sender/kind", json=body, headers=ho).status_code == 200
    assert client.get("/admin/inbox", params={"kind": "platform", "mailbox": CONTACT}, headers=ho).json()["total"] == 0
    assert "ada@example.com" not in client.get("/admin/audit", headers=ha).text


def test_sorting_existing_senders_runs_once_and_deletes_nothing(client):
    from app.main import seed
    from app.models import AuditLog, MailContact
    from app.routers.inbox import sort_existing_senders
    with SessionLocal() as db:
        for email in ("alerts@service.example", "ada@example.com"):
            db.add(MailThread(mailbox=CONTACT, contact_email=email, subject="Old", status="new"))
        db.commit()
        sort_existing_senders(db)
        assert [c.email for c in db.query(MailContact).filter_by(kind="platform")] == ["alerts@service.example"]
        assert db.query(MailThread).count() == 2
    seed()
    with SessionLocal() as db:
        assert db.query(AuditLog).filter_by(action="system.mail_kinds").count() == 1


def test_cloudflare_import_sorts_by_address(client):
    from app.inbox_sync import store_cloudflare_rows
    h = login(client, OWEN)
    with SessionLocal() as db:
        store_cloudflare_rows(db, [cf_row(), cf_row(messageId="i", subject="Login", **{"from": "Instagram <security@mail.instagram.com>"})])
    assert kinds(client, h, kind="platform")[2] == 1 and kinds(client, h, kind="person")[2] == 1


def test_lists_never_load_stored_html(client):
    from sqlalchemy import event
    from app.db import engine
    inbound(client, raw_mail())
    h = login(client, OWEN)
    seen = []

    def capture(conn, cursor, statement, *_):
        seen.append(statement)

    event.listen(engine, "before_cursor_execute", capture)
    try:
        assert client.get("/admin/inbox", params={"mailbox": CONTACT}, headers=h).status_code == 200
        assert client.get("/admin/inbox/senders", params={"mailbox": CONTACT}, headers=h).status_code == 200
    finally:
        event.remove(engine, "before_cursor_execute", capture)
    assert not [q for q in seen if "mail_messages.html" in q]


def test_query_count_stays_flat_as_the_list_grows(client):
    from sqlalchemy import event
    from app.db import engine
    for i in range(12):
        inbound(client, raw_mail(subject=f"Topic {i}", msg_id=f"<g{i}@x>"))
    h = login(client, OWEN)
    seen = []

    def capture(conn, cursor, statement, *_):
        seen.append(statement)

    event.listen(engine, "before_cursor_execute", capture)
    try:
        assert len(client.get("/admin/inbox", params={"mailbox": CONTACT}, headers=h).json()["items"]) == 12
    finally:
        event.remove(engine, "before_cursor_execute", capture)
    assert len(seen) <= 9


def test_each_mailbox_is_shown_on_its_own(client):
    for box, mid in ((OWEN, "<o@x>"), (AUSTIN, "<u@x>"), (CONTACT, "<c@x>")):
        to_mailbox(client, box, mid)
    h = login(client, OWEN)
    d = client.get("/admin/inbox", params={"mailbox": OWEN}, headers=h).json()
    assert [t["mailbox"] for t in d["items"]] == [OWEN] and d["mailboxes"] == [OWEN, CONTACT] and d["mailbox_new"] == {OWEN: 1, CONTACT: 1}
    assert [t["mailbox"] for t in client.get("/admin/inbox", params={"mailbox": CONTACT}, headers=h).json()["items"]] == [CONTACT]
    # asking for someone else's falls back to your own, never a mix
    assert [t["mailbox"] for t in client.get("/admin/inbox", params={"mailbox": AUSTIN}, headers=h).json()["items"]] == [OWEN]
    assert client.get("/admin/inbox/senders", params={"mailbox": OWEN}, headers=h).json()["total"] == 1


def test_automatic_reply_is_not_the_conversations_last_word(client, monkeypatch):
    sent_mail(monkeypatch)
    h = login(client, OWEN)
    to_mailbox(client, CONTACT, "<a@x>", subject="One")
    t = client.get("/admin/inbox", params={"mailbox": CONTACT}, headers=h).json()["items"][0]
    assert t["last_direction"] == "in" and t["snippet"] == "Hello there" and t["count"] == 2


def test_imported_mail_arrives_read_and_old_imports_are_marked_read(client):
    from app.inbox_sync import store_cloudflare_rows
    from app.routers.inbox import mark_imports_read, store_inbound
    with SessionLocal() as db:
        store_cloudflare_rows(db, [cf_row()])
        assert db.query(MailThread).one().status == "reviewed"
        store_inbound(db, CONTACT, bytes(raw_mail(sender="z@example.com", msg_id="<takeout@x>")))
        assert db.query(MailThread).filter_by(contact_email="z@example.com").one().status == "reviewed"
        # conversations imported as New before this: read now, but live mail stays New
        db.query(MailThread).update({"status": "new"})
        db.commit()
    to_mailbox(client, CONTACT, "<live@x>", subject="Live")
    with SessionLocal() as db:
        assert mark_imports_read(db) == 1
        got = {t.subject: t.status for t in db.query(MailThread)}
    assert got == {"Old one": "reviewed", "Pilot": "new", "Live": "new"}


def test_wider_sorting_signs(client):
    from app.routers.inbox import platform_address, platform_mail, platform_subject
    for a in ("billing@acme.example", "receipts@shop.example", "news@paper.example", "a@github.com", "team-alerts@acme.example"):
        assert platform_address(a), a
    for a in ("newsome@example.com", "accounting.owen@example.com", "ordera@example.com", "joshua@gmail.com"):
        assert not platform_address(a), a
    for x in ("Your verification code is 1234", "Security alert", "Someone started following you", "Reset your password"):
        assert platform_subject(x), x
    for x in ("August 2027 SIWES Enquiry", "3D CAD and mechanical design support", "Re: Pilot"):
        assert not platform_subject(x), x
    assert platform_mail(raw_mail(sender="hi@acme.example", msg_id="<f@x>", Feedback_ID="1:2:3"), "hi@acme.example")
