import pytest
from factory import create_app
from extensions import db as _db
from models.user import User
from models.role import Role

@pytest.fixture
def app():
    """Create app for testing"""
    app = create_app('testing')
    with app.app_context():
        _db.create_all()
        yield app
        _db.session.remove()
        _db.drop_all()

@pytest.fixture
def client(app):
    """Test client"""
    return app.test_client()

@pytest.fixture
def db(app):
    """Database"""
    return _db

@pytest.fixture
def admin_user(db):
    """Create admin user"""
    role = Role(name='Super Admin', hierarchy_level=0)
    db.session.add(role)
    db.session.commit()
    
    user = User(
        username='admin',
        email='admin@test.com',
        role_id=role.id
    )
    user.set_password('Password@123')
    db.session.add(user)
    db.session.commit()
    return user

@pytest.fixture
def admin_token(client, admin_user):
    """Get admin JWT token"""
    res = client.post('/api/auth/login', json={
        'username': 'admin',
        'password': 'Password@123'
    })
    return res.json['data']['access_token']