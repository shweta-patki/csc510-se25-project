import pytest
from fastapi import HTTPException
from app import db
from app.main import app
from fastapi.testclient import TestClient

client = TestClient(app)

# --------------------
# DB.PY edge cases
# --------------------


def test_ensure_user_points_column_non_sqlite(monkeypatch):
    monkeypatch.setattr(db, "DATABASE_URL", "postgres://dummy")
    db.ensure_user_points_column()


def test_ensure_foodrun_capacity_column_non_sqlite(monkeypatch):
    monkeypatch.setattr(db, "DATABASE_URL", "mysql://dummy")
    db.ensure_foodrun_capacity_column()


def test_ensure_order_pin_column_non_sqlite(monkeypatch):
    monkeypatch.setattr(db, "DATABASE_URL", "oracle://dummy")
    db.ensure_order_pin_column()


def test_db_column_functions_handle_exceptions(monkeypatch):
    def bad_engine():
        raise Exception("Simulated DB fail")

    monkeypatch.setattr(db, "engine", bad_engine)
    db.ensure_user_points_column()
    db.ensure_foodrun_capacity_column()
    db.ensure_order_pin_column()


# --------------------
# MAIN.PY edge cases
# --------------------


def test_register_rejects_non_ncsu_email():
    r = client.post(
        "/auth/register", json={"email": "user@gmail.com", "password": "abc"}
    )
    assert r.status_code == 400
    assert "NCSU" in r.json()["detail"]


def test_login_rejects_non_ncsu_email():
    r = client.post(
        "/auth/login", json={"email": "someone@yahoo.com", "password": "123"}
    )
    assert r.status_code == 400


def test_joined_runs_returns_empty():
    from app import main

    class DummyResult:
        def all(self, *args, **kwargs):
            return []

    class DummySession:
        def exec(self, _query):
            return DummyResult()

    result = main.list_joined_runs({"sub": "1"}, DummySession())
    assert result == []


def test_joined_history_returns_empty():
    from app import main

    class DummyResult:
        def all(self, *args, **kwargs):
            return []

    class DummySession:
        def exec(self, _query):
            return DummyResult()

    result = main.list_joined_runs_history({"sub": "1"}, DummySession())
    assert result == []


def test_complete_run_not_found():
    from app import main

    class DummySession:
        def get(self, _model, _id=None):
            return None

    claims = {"sub": "1"}
    with pytest.raises(HTTPException) as e:
        main.complete_run(999, claims, DummySession())
    assert e.value.status_code == 404


def test_cancel_run_not_found():
    from app import main

    class DummySession:
        def get(self, _model, _id=None):
            return None

    claims = {"sub": "1"}
    with pytest.raises(HTTPException) as e:
        main.cancel_run(999, claims, DummySession())
    assert e.value.status_code == 404
