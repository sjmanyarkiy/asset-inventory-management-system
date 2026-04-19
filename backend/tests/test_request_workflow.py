# tests/test_request_workflow.py

def test_complete_asset_request_workflow(client, db, manager_token, employee_token):
    """Test: employee requests → manager approves"""
    
    # Step 1: Employee creates asset request
    res1 = client.post(
        '/api/requests/assets',
        headers={'Authorization': f'Bearer {employee_token}'},
        json={
            'asset_type_id': 1,
            'quantity': 2,
            'reason': 'New laptops for team',
            'urgency': 'High'
        }
    )
    assert res1.status_code == 201
    request_id = res1.json['id']
    
    # Step 2: Manager retrieves pending requests
    res2 = client.get(
        '/api/review/assets',
        headers={'Authorization': f'Bearer {manager_token}'}
    )
    assert res2.status_code == 200
    assert any(r['id'] == request_id for r in res2.json['requests'])
    
    # Step 3: Manager approves request
    res3 = client.post(
        f'/api/review/assets/{request_id}/approve',
        headers={'Authorization': f'Bearer {manager_token}'},
        json={'notes': 'Budget approved'}
    )
    assert res3.status_code == 200
    assert res3.json['status'] == 'Approved'
    
    # Step 4: Employee sees updated status
    res4 = client.get(
        f'/api/requests/assets/{request_id}',
        headers={'Authorization': f'Bearer {employee_token}'}
    )
    assert res4.json['status'] == 'Approved'