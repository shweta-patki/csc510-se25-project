import os
import sys
from pathlib import Path
from fastapi.testclient import TestClient

# Ensure the app uses an in-memory SQLite database for tests
os.environ["DATABASE_URL"] = "sqlite:///./test.db"

# Make the backend folder importable so `import app.main` resolves
backend_dir = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(backend_dir))

# Import the app after setting env var so the engine uses the in-memory DB
import importlib
import app.main as main

client = TestClient(main.app)

# Ensure DB tables are created for the in-memory database
main.create_db_and_tables()


def test_register_login_and_me_flow():
    payload = {"email": "test@example.com", "password": "secret"}

    # Register
    r = client.post("/auth/register", json=payload)
    assert r.status_code == 200, r.text
    data = r.json()
    assert "token" in data and "user" in data
    assert data["user"]["username"] == payload["email"]

    # Duplicate register -> 409
    r_dup = client.post("/auth/register", json=payload)
    assert r_dup.status_code == 409

    # Login
    r2 = client.post("/auth/login", json=payload)
    assert r2.status_code == 200, r2.text
    token = r2.json()["token"]

    # Me
    headers = {"Authorization": f"Bearer {token}"}
    r3 = client.get("/auth/me", headers=headers)
    assert r3.status_code == 200, r3.text
    assert r3.json()["username"] == payload["email"]
