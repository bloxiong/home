import os

# Tests run against a throwaway local Postgres database
os.environ["DATABASE_URL"] = os.environ.get("TEST_DATABASE_URL", "postgresql+psycopg://localhost/bloxio_test")
os.environ["JWT_SECRET"] = "test-secret-that-is-long-enough-for-hs256-signing"
os.environ["RESEND_API_KEY"] = ""
os.environ["RATE_LIMIT"] = "1000"

import pytest  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402

from app.db import Base, engine  # noqa: E402
from app.main import app  # noqa: E402
from app.security import hash_password  # noqa: E402


@pytest.fixture()
def client():
    Base.metadata.drop_all(engine)
    with TestClient(app) as c:  # startup seeds admins + content
        from app.db import SessionLocal
        from app.models import Admin
        with SessionLocal() as db:
            for a in db.query(Admin):
                a.password_hash = hash_password("TestPassword1")
            db.commit()
        yield c


def login(c, email):
    r = c.post("/auth/login", json={"email": email, "password": "TestPassword1"})
    assert r.status_code == 200, r.text
    return {"Authorization": f"Bearer {r.json()['token']}"}
