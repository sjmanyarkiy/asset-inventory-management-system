def test_user_login(client, admin_user):
    """Test user can login"""
    res = client.post('/api/auth/login', json={
        'username': 'admin',
        'password': 'Password@123'
    })
    assert res.status_code == 200
    assert 'access_token' in res.json['data']

def test_invalid_login(client):
    """Test invalid credentials return 401"""
    res = client.post('/api/auth/login', json={
        'username': 'noone',
        'password': 'wrong'
    })
    assert res.status_code == 401