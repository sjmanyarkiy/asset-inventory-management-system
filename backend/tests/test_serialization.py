from datetime import datetime

from backend.app import create_app
from backend.models import db, User, Asset, Assignment


def test_assigned_datetime_iso(client):
    # reuse the client fixture from test_reports.py (pytest will pick it up)
    resp = client.post("/api/auth/login", json={"email": "alice@example.com", "password": "testpass"})
    assert resp.status_code == 200
    token = resp.get_json()["access_token"]

    rv = client.get("/api/reports/assigned", headers={"Authorization": f"Bearer {token}"})
    assert rv.status_code == 200
    data = rv.get_json()
    assert "items" in data and data["items"], "expected items in response"

    first = data["items"][0]
    # assigned_at should be an ISO8601 string that datetime.fromisoformat can parse
    assigned_at = first.get("assigned_at")
    assert isinstance(assigned_at, str)
    # this will raise ValueError if not ISO-formatted
    parsed = datetime.fromisoformat(assigned_at)
    assert parsed is not None