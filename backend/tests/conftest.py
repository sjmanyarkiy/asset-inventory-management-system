import pytest
from backend.app import create_app
from backend.models import db, User, Asset, Assignment


@pytest.fixture
def client(tmp_path):
    # create app with test config to ensure in-memory DB is used
    app = create_app({"TESTING": True, "SQLALCHEMY_DATABASE_URI": "sqlite:///:memory:"})

    with app.app_context():
        db.create_all()
        # seed some data
        u = User(name="Alice", email="alice@example.com", role="EMPLOYEE")
        u.set_password("testpass")
        a = Asset(barcode="BC123", tag="TAG1", name="Laptop")
        db.session.add_all([u, a])
        db.session.commit()
        assign = Assignment(asset_id=a.id, user_id=u.id)
        db.session.add(assign)
        db.session.commit()

    with app.test_client() as client:
        yield client
