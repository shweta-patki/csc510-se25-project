import os
import sys
from pathlib import Path
import pytest


@pytest.fixture(scope="session")
def test_db_url(tmp_path_factory):
    # Use a temp file-backed SQLite DB so all connections share state
    db_dir = tmp_path_factory.mktemp("db")
    db_file = (Path(db_dir) / "test.db").as_posix()
    url = f"sqlite:///{db_file}"
    os.environ["DATABASE_URL"] = url
    return url


@pytest.fixture(scope="session")
def app_client(test_db_url):
    # Import after DATABASE_URL is set so the engine binds to the test DB
    # Ensure backend package is on sys.path (so `import app` works when running from repo root)
    tests_dir = Path(__file__).resolve().parent
    backend_dir = tests_dir.parent  # proj2/backend
    if str(backend_dir) not in sys.path:
        sys.path.insert(0, str(backend_dir))

    from fastapi.testclient import TestClient
    from app.db import create_db_and_tables
    from app.main import app

    create_db_and_tables()
    with TestClient(app) as client:
        yield client


def register_and_login(client, email: str, password: str = "Password123!"):
    r = client.post("/auth/register", json={"email": email, "password": password})
    if r.status_code not in (200, 201):
        r = client.post("/auth/login", json={"email": email, "password": password})
    assert r.status_code in (200, 201), f"auth failed: {r.status_code} {r.text}"
    data = r.json()
    token = data.get("token")
    assert token, f"no token in response: {data}"
    return token, data.get("user")


def auth_headers(token: str):
    return {"Authorization": f"Bearer {token}"}
