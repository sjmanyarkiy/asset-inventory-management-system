import pytest
from flask import json
from datetime import datetime
from models.user import User
from models.asset_request import AssetRequest
from models.repair_request import RepairRequest
from models.asset import Asset
from models.department import Department
from extensions import db


class TestAssetRequests:
    """Test asset request endpoints"""
    
    @pytest.fixture
    def app(self):
        """Create Flask app for testing"""
        from factory import create_app
        app = create_app('testing')
        with app.app_context():
            db.create_all()
            yield app
            db.session.remove()
            db.drop_all()
    
    @pytest.fixture
    def client(self, app):
        return app.test_client()
    
    @pytest.fixture
    def setup_data(self, app):
        """Setup test data: users, departments, assets"""
        # Create departments
        it_dept = Department(name='IT', code='IT')
        hr_dept = Department(name='HR', code='HR')
        db.session.add_all([it_dept, hr_dept])
        db.session.commit()
        
        # Create roles
        from models.role import Role
        manager_role = Role(
            name='Manager',
            hierarchy_level=2,
            is_system=True,
            permissions={'approve_requests': True}
        )
        employee_role = Role(
            name='Employee',
            hierarchy_level=3,
            is_system=True,
            permissions={'request_assets': True}
        )
        db.session.add_all([manager_role, employee_role])
        db.session.commit()
        
        # Create users
        manager = User(
            username='manager',
            email='manager@test.com',
            first_name='John',
            last_name='Manager',
            role=manager_role,
            department=it_dept,
            is_email_verified=True
        )
        manager.set_password('password123')
        
        employee = User(
            username='employee',
            email='employee@test.com',
            first_name='Alice',
            last_name='Employee',
            role=employee_role,
            department=it_dept,
            is_email_verified=True
        )
        employee.set_password('password123')
        
        db.session.add_all([manager, employee])
        db.session.commit()
        
        # Create asset type
        from models.asset_type import AssetType
        laptop_type = AssetType(name='Laptop', description='Test laptop')
        db.session.add(laptop_type)
        db.session.commit()
        
        return {
            'manager': manager,
            'employee': employee,
            'it_dept': it_dept,
            'laptop_type': laptop_type
        }
    
    def test_employee_create_asset_request(self, client, setup_data):
        """Test employee can create asset request"""
        # Login as employee
        response = client.post('/api/auth/login', json={
            'username': 'employee',
            'password': 'password123'
        })
        token = response.get_json()['data']['access_token']
        headers = {'Authorization': f'Bearer {token}'}
        
        # Submit request
        response = client.post(
            '/api/requests/assets',
            json={
                'asset_type_id': setup_data['laptop_type'].id,
                'quantity': 2,
                'reason': 'Need laptops for team',
                'urgency': 'High'
            },
            headers=headers
        )
        
        assert response.status_code == 201
        data = response.get_json()['data']
        assert data['status'] == 'Pending'
        assert data['quantity'] == 2
        
        # Verify in database
        request = AssetRequest.query.filter_by(id=data['id']).first()
        assert request is not None
        assert request.requested_by == setup_data['employee'].id
        assert request.department_id == setup_data['it_dept'].id
    
    def test_manager_view_pending_requests(self, client, setup_data):
        """Test manager sees only their department's requests"""
        # Create request as employee
        request_obj = AssetRequest(
            requested_by=setup_data['employee'].id,
            asset_type_id=setup_data['laptop_type'].id,
            quantity=1,
            reason='Test request',
            urgency='Medium',
            department_id=setup_data['it_dept'].id,
            status='Pending'
        )
        db.session.add(request_obj)
        db.session.commit()
        
        # Login as manager
        response = client.post('/api/auth/login', json={
            'username': 'manager',
            'password': 'password123'
        })
        token = response.get_json()['data']['access_token']
        headers = {'Authorization': f'Bearer {token}'}
        
        # View requests
        response = client.get('/api/review/assets', headers=headers)
        
        assert response.status_code == 200
        data = response.get_json()
        assert len(data['requests']) == 1
        assert data['requests'][0]['id'] == request_obj.id
    
    def test_manager_approve_request(self, client, setup_data):
        """Test manager can approve request"""
        # Setup: Create pending request
        request_obj = AssetRequest(
            requested_by=setup_data['employee'].id,
            asset_type_id=setup_data['laptop_type'].id,
            quantity=1,
            reason='Need laptop',
            urgency='High',
            department_id=setup_data['it_dept'].id,
            status='Pending'
        )
        db.session.add(request_obj)
        db.session.commit()
        
        # Login as manager
        response = client.post('/api/auth/login', json={
            'username': 'manager',
            'password': 'password123'
        })
        token = response.get_json()['data']['access_token']
        headers = {'Authorization': f'Bearer {token}'}
        
        # Approve request
        response = client.post(
            f'/api/review/assets/{request_obj.id}/approve',
            json={'notes': 'Approved - budget available'},
            headers=headers
        )
        
        assert response.status_code == 200
        
        # Verify status changed
        updated_request = AssetRequest.query.get(request_obj.id)
        assert updated_request.status == 'Approved'
        assert updated_request.reviewed_by == setup_data['manager'].id
        assert updated_request.review_notes == 'Approved - budget available'
    
    def test_manager_reject_request(self, client, setup_data):
        """Test manager can reject request"""
        # Setup: Create pending request
        request_obj = AssetRequest(
            requested_by=setup_data['employee'].id,
            asset_type_id=setup_data['laptop_type'].id,
            quantity=1,
            reason='Need laptop',
            urgency='Low',
            department_id=setup_data['it_dept'].id,
            status='Pending'
        )
        db.session.add(request_obj)
        db.session.commit()
        
        # Login as manager
        response = client.post('/api/auth/login', json={
            'username': 'manager',
            'password': 'password123'
        })
        token = response.get_json()['data']['access_token']
        headers = {'Authorization': f'Bearer {token}'}
        
        # Reject request (requires reason)
        response = client.post(
            f'/api/review/assets/{request_obj.id}/reject',
            json={'notes': 'Budget constraints'},
            headers=headers
        )
        
        assert response.status_code == 200
        
        # Verify status changed
        updated_request = AssetRequest.query.get(request_obj.id)
        assert updated_request.status == 'Rejected'
        assert updated_request.review_notes == 'Budget constraints'
    
    def test_employee_cannot_approve(self, client, setup_data):
        """Test employee cannot access approval endpoint"""
        # Login as employee
        response = client.post('/api/auth/login', json={
            'username': 'employee',
            'password': 'password123'
        })
        token = response.get_json()['data']['access_token']
        headers = {'Authorization': f'Bearer {token}'}
        
        # Try to view requests
        response = client.get('/api/review/assets', headers=headers)
        
        assert response.status_code == 403
        assert 'Permission denied' in response.get_json()['error']


class TestRepairRequests:
    """Test repair request endpoints"""
    
    # Similar structure as AssetRequests tests
    # Test: employee can create repair request
    # Test: manager can view repair requests
    # Test: manager can approve repair
    # Test: manager can mark as completed
    # Test: employee cannot approve repairs