def test_manager_can_view_assets(client, manager_user, manager_token):
    """Test manager can view asset requests"""
    res = client.get(
        '/api/review/assets',
        headers={'Authorization': f'Bearer {manager_token}'}
    )
    assert res.status_code == 200
    assert 'requests' in res.json

def test_employee_cannot_approve_requests(client, employee_user, employee_token):
    """Test employee cannot approve requests (403)"""
    res = client.post(
        '/api/review/assets/1/approve',
        headers={'Authorization': f'Bearer {employee_token}'},
        json={'notes': 'Approved'}
    )
    assert res.status_code == 403