import os
import sys
from pathlib import Path

import pytest


BACKEND_DIR = Path(__file__).resolve().parents[1]
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))


@pytest.fixture(scope="module")
def client():
    os.environ["DATABASE_URL"] = "sqlite:///:memory:"
    os.environ["FLASK_DEBUG"] = "False"

    from main import create_app
    from app import db

    app = create_app()
    app.config["TESTING"] = True

    with app.app_context():
        db.create_all()

    with app.test_client() as test_client:
        yield test_client


@pytest.mark.parametrize(
    "legacy,prefixed",
    [
        ("/categories", "/api/categories"),
        ("/vendors", "/api/vendors"),
        ("/departments", "/api/departments"),
        ("/assets", "/api/assets"),
    ],
)
def test_legacy_and_prefixed_routes_are_both_available(client, legacy, prefixed):
    legacy_resp = client.get(legacy)
    prefixed_resp = client.get(prefixed)

    assert legacy_resp.status_code == 200
    assert prefixed_resp.status_code == 200

    legacy_body = legacy_resp.get_json()
    prefixed_body = prefixed_resp.get_json()

    assert isinstance(legacy_body, dict)
    assert isinstance(prefixed_body, dict)
    assert "data" in legacy_body
    assert "data" in prefixed_body


def test_health_route_is_available_on_root_and_api(client):
    root_resp = client.get("/")
    api_resp = client.get("/api")

    assert root_resp.status_code == 200
    assert api_resp.status_code == 200

    root_body = root_resp.get_json()
    api_body = api_resp.get_json()

    assert root_body.get("message")
    assert api_body.get("message")
