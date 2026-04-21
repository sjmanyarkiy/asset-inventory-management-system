"""
Requests Blueprint - handles asset and repair requests
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from extensions import db
from models.user import User
from models.asset_request import AssetRequest
from models.repair_request import RepairRequest
from models.asset_type import AssetType
from models.department import Department
from models.asset import Asset

requests_bp = Blueprint('requests', __name__)


# ===========================
# ASSET REQUESTS
# ===========================

@requests_bp.route('/assets', methods=['GET'])
@jwt_required()
def get_asset_requests():
    """
    Get asset requests based on user role
    - Employees: see own requests
    - Managers: see department requests
    - Admin: see all requests
    """
    current_user_id = int(get_jwt_identity())
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    page = int(request.args.get('page', 1))
    per_page = int(request.args.get('per_page', 10))
    status = request.args.get('status', '')
    
    query = AssetRequest.query
    
    # Filter based on role
    if user.role.hierarchy_level >= 3:  # Employee
        query = query.filter_by(requested_by=current_user_id)
    elif user.role.hierarchy_level == 2:  # Manager
        query = query.filter_by(department_id=user.department_id) 
    # Admin (hierarchy 0-1) sees all
    
    # Filter by status if provided
    if status:
        query = query.filter_by(status=status)
    
    pagination = query.order_by(AssetRequest.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    return jsonify({
        'requests': [r.to_dict() for r in pagination.items],
        'total': pagination.total,
        'pages': pagination.pages,
        'current_page': page
    }), 200


@requests_bp.route('/assets', methods=['POST'])
@jwt_required()
def create_asset_request():
    """
    Create a new asset request
    Required fields:
    - asset_type_id (int)
    - quantity (int)
    - reason (string)
    - urgency (Low/Medium/High)
    """
    current_user_id = int(get_jwt_identity())
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    data = request.get_json() or {}
    
    # Validate required fields
    required = ['asset_type_id', 'quantity', 'reason', 'urgency']
    missing = [f for f in required if f not in data or not data[f]]
    if missing:
        return jsonify({'error': f'Missing required fields: {", ".join(missing)}'}), 400
    
    # Validate asset type exists
    asset_type = AssetType.query.get(data['asset_type_id'])
    if not asset_type:
        return jsonify({'error': 'Asset type not found'}), 404
    
    # Validate urgency
    if data['urgency'] not in ['Low', 'Medium', 'High']:
        return jsonify({'error': 'Urgency must be Low, Medium, or High'}), 400
    
    # Validate quantity
    try:
        quantity = int(data['quantity'])
        if quantity <= 0:
            raise ValueError
    except (ValueError, TypeError):
        return jsonify({'error': 'Quantity must be a positive integer'}), 400
    
    if not user.department_id:
        return jsonify({'error': 'User is not assigned to any department'}), 400
    
    try:
        new_request = AssetRequest(
            requested_by=current_user_id,
            asset_type_id=data['asset_type_id'],
            quantity=quantity,
            reason=data['reason'],
            urgency=data['urgency'],
            department_id = user.department_id,  # Default to user's department
            status='Pending'
        )
        
        db.session.add(new_request)
        db.session.commit()
        
        return jsonify({
            'message': 'Asset request created successfully',
            'request': new_request.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to create request: {str(e)}'}), 500


@requests_bp.route('/assets/<int:request_id>', methods=['GET'])
@jwt_required()
def get_asset_request(request_id):
    """Get a specific asset request"""
    current_user_id = int(get_jwt_identity())
    user = User.query.get(current_user_id)
    
    asset_req = AssetRequest.query.get_or_404(request_id)
    
    # Check permissions
    if (user.role.hierarchy_level >= 3 and asset_req.requested_by != current_user_id):
        return jsonify({'error': 'Unauthorized'}), 403
    
    return jsonify(asset_req.to_dict()), 200


@requests_bp.route('/assets/<int:request_id>/review', methods=['POST'])
@jwt_required()
def review_asset_request(request_id):
    """
    Manager/Admin reviews asset request
    Required fields:
    - status (Approved/Rejected)
    - review_notes (optional)
    """
    current_user_id = int(get_jwt_identity())
    user = User.query.get(current_user_id)
    
    # Only managers and admins can review
    if user.role.hierarchy_level > 2:
        return jsonify({'error': 'Only managers and admins can review requests'}), 403
    
    data = request.get_json() or {}
    status = data.get('status', '').strip()
    
    if status not in ['Approved', 'Rejected']:
        return jsonify({'error': 'Status must be Approved or Rejected'}), 400
    
    asset_req = AssetRequest.query.get_or_404(request_id)
    
    try:
        asset_req.status = status
        asset_req.reviewed_by = current_user_id
        asset_req.review_notes = data.get('review_notes', '')
        asset_req.reviewed_at = datetime.utcnow()
        
        db.session.commit()
        
        # TODO: Send email notification to requester
        # send_request_review_email(asset_req.requester.email, status)
        
        return jsonify({
            'message': f'Request {status.lower()} successfully',
            'request': asset_req.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to review request: {str(e)}'}), 500


# ===========================
# REPAIR REQUESTS
# ===========================

@requests_bp.route('/repairs', methods=['GET'])
@jwt_required()
def get_repair_requests():
    """
    Get repair requests based on user role
    - Employees: see own requests
    - Managers: see department requests
    - Admin: see all requests
    """
    current_user_id = int(get_jwt_identity())
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    page = int(request.args.get('page', 1))
    per_page = int(request.args.get('per_page', 10))
    status = request.args.get('status', '')
    
    query = RepairRequest.query
    
    # Filter based on role
    if user.role.hierarchy_level >= 3:  # Employee
        query = query.filter_by(requested_by=current_user_id)
    elif user.role.hierarchy_level == 2:  # Manager
        query = query.filter_by(department_id=user.department_id)  # Assuming user has department_id
    # Admin sees all
    
    # Filter by status if provided
    if status:
        query = query.filter_by(status=status)
    
    pagination = query.order_by(RepairRequest.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    return jsonify({
        'requests': [r.to_dict() for r in pagination.items],
        'total': pagination.total,
        'pages': pagination.pages,
        'current_page': page
    }), 200


@requests_bp.route('/repairs', methods=['POST'])
@jwt_required()
def create_repair_request():
    """
    Create a new repair request
    Required fields:
    - asset_id (int)
    - issue_description (string)
    - urgency (Low/Medium/High)
    """
    current_user_id = int(get_jwt_identity())
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    data = request.get_json() or {}
    
    # Validate required fields
    required = ['asset_id', 'issue_description', 'urgency']
    missing = [f for f in required if f not in data or not data[f]]
    if missing:
        return jsonify({'error': f'Missing required fields: {", ".join(missing)}'}), 400
    
    # Validate asset exists and is assigned to user
    asset = Asset.query.get(data['asset_id'])
    if not asset:
        return jsonify({'error': 'Asset not found'}), 404
    
    if asset.assigned_to != current_user_id:
        return jsonify({'error': 'You can only request repairs for assets assigned to you'}), 403
    
    # Validate urgency
    if data['urgency'] not in ['Low', 'Medium', 'High']:
        return jsonify({'error': 'Urgency must be Low, Medium, or High'}), 400
    
    try:
        print("DEBUG DATA:", data)
        print("DEBUG USER:", current_user_id)
        print("DEBUG ASSET:", asset.id, asset.assigned_user_id)

        new_request = RepairRequest(
            requested_by=current_user_id,
            asset_id=data['asset_id'],
            issue_description=data['issue_description'],
            urgency=data['urgency'],
            department_id=department_id,
            status='Pending'
        )
        
        db.session.add(new_request)
        db.session.commit()

        return jsonify({
            'message': 'Repair request created successfully',
            'request': new_request.to_dict()
        }), 201

    except Exception as e:
        db.session.rollback()
        print("ERROR:", str(e))  # 👈 VERY IMPORTANT
        return jsonify({'error': str(e)}), 500


@requests_bp.route('/repairs/<int:request_id>', methods=['GET'])
@jwt_required()
def get_repair_request(request_id):
    """Get a specific repair request"""
    current_user_id = int(get_jwt_identity())
    user = User.query.get(current_user_id)
    
    repair_req = RepairRequest.query.get_or_404(request_id)
    
    # Check permissions
    if (user.role.hierarchy_level >= 3 and repair_req.requested_by != current_user_id):
        return jsonify({'error': 'Unauthorized'}), 403
    
    return jsonify(repair_req.to_dict()), 200


@requests_bp.route('/repairs/<int:request_id>/review', methods=['POST'])
@jwt_required()
def review_repair_request(request_id):
    """
    Manager/Admin reviews repair request
    Required fields:
    - status (Approved/Rejected/In Progress/Completed)
    - review_notes (optional)
    - completion_notes (optional, for Completed status)
    """
    current_user_id = int(get_jwt_identity())
    user = User.query.get(current_user_id)
    
    # Only managers and admins can review
    if user.role.hierarchy_level > 2:
        return jsonify({'error': 'Only managers and admins can review requests'}), 403
    
    data = request.get_json() or {}
    status = data.get('status', '').strip()
    
    valid_statuses = ['Approved', 'Rejected', 'In Progress', 'Completed']
    if status not in valid_statuses:
        return jsonify({'error': f'Status must be one of: {", ".join(valid_statuses)}'}), 400
    
    repair_req = RepairRequest.query.get_or_404(request_id)
    
    try:
        repair_req.status = status
        repair_req.reviewed_by = current_user_id
        repair_req.review_notes = data.get('review_notes', '')
        repair_req.reviewed_at = datetime.utcnow()
        
        # If completed, record completion info
        if status == 'Completed':
            repair_req.completed_at = datetime.utcnow()
            repair_req.completion_notes = data.get('completion_notes', '')
        
        db.session.commit()
        
        # TODO: Send email notification to requester
        # send_repair_review_email(repair_req.requester.email, status)
        
        return jsonify({
            'message': f'Repair request {status.lower()} successfully',
            'request': repair_req.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to review repair request: {str(e)}'}), 500