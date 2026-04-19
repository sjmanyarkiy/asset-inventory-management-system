def test_get_all_assets(client, admin_token):
    """Test can fetch all assets"""
    res = client.get(
        '/api/assets',
        headers={'Authorization': f'Bearer {admin_token}'}
    )
    assert res.status_code == 200
    assert 'assets' in res.json

def test_create_asset(client, admin_token, asset_type):
    """Test can create new asset"""
    res = client.post(
        '/api/assets',
        headers={'Authorization': f'Bearer {admin_token}'},
        json={
            'asset_name': 'Test Laptop',
            'asset_code': 'LAP-001',
            'asset_type_id': asset_type.id,
            'status': 'Available',
            'condition': 'Good'
        }
    )
    assert res.status_code == 201