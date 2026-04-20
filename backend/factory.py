"""
Review Routes Blueprint - handles request review and approval for managers/admins
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from extensions import db
from models.user import User
from models.asset_request import AssetRequest
from models.repair_request import RepairRequest

review_bp = Blueprint('review', __name__)


# ===========================
# ASSET REQUESTS FOR REVIEW
# ===========================

@review_bp.route('/assets', methods=['GET'])
@jwt_required()
def get_asset_requests_for_review():
    """
    Get asset requests for review (manager/admin only)
    - Managers: see department requests
    - Admin: see all requests
    """
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    # Only managers and admins can review
    if user.role.hierarchy_level > 2:
        return jsonify({'error': 'Only managers and admins can review requests'}), 403
    
    page = int(request.args.get('page', 1))
    per_page = int(request.args.get('per_page', 10))
    status = request.args.get('status', '')
    
    query = AssetRequest.query
    
    # Filter based on role
    if user.role.hierarchy_level == 2:  # Manager
        query = query.filter_by(department_id=user.department_id)
    # Admin (hierarchy 0-1) sees all
    
    # Filter by status if provided (default to pending)
    if status:
        query = query.filter_by(status=status)
    else:
        query = query.filter_by(status='Pending')
    
    pagination = query.order_by(AssetRequest.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    return jsonify({
        'requests': [r.to_dict() for r in pagination.items],
        'total': pagination.total,
        'pages': pagination.pages,
        'current_page': page
    }), 200


@review_bp.route('/assets/<int:request_id>/approve', methods=['POST'])
@jwt_required()
def approve_asset_request(request_id):
    """Approve an asset request"""
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    # Only managers and admins can approve
    if user.role.hierarchy_level > 2:
        return jsonify({'error': 'Only managers and admins can approve requests'}), 403
    
    data = request.get_json() or {}
    asset_req = AssetRequest.query.get_or_404(request_id)
    
    # Manager can only approve their department's requests
    if user.role.hierarchy_level == 2 and asset_req.department_id != user.department_id:
        return jsonify({'error': 'Unauthorized'}), 403
    
    try:
        asset_req.status = 'Approved'
        asset_req.reviewed_by = current_user_id
        asset_req.review_notes = data.get('notes', '')
        asset_req.reviewed_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            'message': 'Request approved successfully',
            'request': asset_req.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to approve request: {str(e)}'}), 500


@review_bp.route('/assets/<int:request_id>/reject', methods=['POST'])
@jwt_required()
def reject_asset_request(request_id):
    """Reject an asset request"""
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    # Only managers and admins can reject
    if user.role.hierarchy_level > 2:
        return jsonify({'error': 'Only managers and admins can reject requests'}), 403
    
    data = request.get_json() or {}
    asset_req = AssetRequest.query.get_or_404(request_id)
    
    # Manager can only reject their department's requests
    if user.role.hierarchy_level == 2 and asset_req.department_id != user.department_id:
        return jsonify({'error': 'Unauthorized'}), 403
    
    try:
        asset_req.status = 'Rejected'
        asset_req.reviewed_by = current_user_id
        asset_req.review_notes = data.get('notes', '')
        asset_req.reviewed_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            'message': 'Request rejected successfully',
            'request': asset_req.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to reject request: {str(e)}'}), 500


# ===========================
# REPAIR REQUESTS FOR REVIEW
# ===========================

@review_bp.route('/repairs', methods=['GET'])
@jwt_required()
def get_repair_requests_for_review():
    """
    Get repair requests for review (manager/admin only)
    - Managers: see department requests
    - Admin: see all requests
    """
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    # Only managers and admins can review
    if user.role.hierarchy_level > 2:
        return jsonify({'error': 'Only managers and admins can review requests'}), 403
    
    page = int(request.args.get('page', 1))
    per_page = int(request.args.get('per_page', 10))
    status = request.args.get('status', '')
    
    query = RepairRequest.query
    
    # Filter based on role
    if user.role.hierarchy_level == 2:  # Manager
        query = query.filter_by(department_id=user.department_id)
    # Admin (hierarchy 0-1) sees all
    
    # Filter by status if provided (default to pending)
    if status:
        query = query.filter_by(status=status)
    else:
        query = query.filter_by(status='Pending')
    
    pagination = query.order_by(RepairRequest.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    return jsonify({
        'requests': [r.to_dict() for r in pagination.items],
        'total': pagination.total,
        'pages': pagination.pages,
        'current_page': page
    }), 200


@review_bp.route('/repairs/<int:request_id>/approve', methods=['POST'])
@jwt_required()
def approve_repair_request(request_id):
    """Approve a repair request"""
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    # Only managers and admins can approve
    if user.role.hierarchy_level > 2:
        return jsonify({'error': 'Only managers and admins can approve requests'}), 403
    
    data = request.get_json() or {}
    repair_req = RepairRequest.query.get_or_404(request_id)
    
    # Manager can only approve their department's requests
    if user.role.hierarchy_level == 2 and repair_req.department_id != user.department_id:
        return jsonify({'error': 'Unauthorized'}), 403
    
    try:
        repair_req.status = 'Approved'
        repair_req.reviewed_by = current_user_id
        repair_req.review_notes = data.get('notes', '')
        repair_req.reviewed_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            'message': 'Request approved successfully',
            'request': repair_req.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to approve request: {str(e)}'}), 500


@review_bp.route('/repairs/<int:request_id>/reject', methods=['POST'])
@jwt_required()
def reject_repair_request(request_id):
    """Reject a repair request"""
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    # Only managers and admins can reject
    if user.role.hierarchy_level > 2:
        return jsonify({'error': 'Only managers and admins can reject requests'}), 403
    
    data = request.get_json() or {}
    repair_req = RepairRequest.query.get_or_404(request_id)
    
    # Manager can only reject their department's requests
    if user.role.hierarchy_level == 2 and repair_req.department_id != user.department_id:
        return jsonify({'error': 'Unauthorized'}), 403
    
    try:
        repair_req.status = 'Rejected'
        repair_req.reviewed_by = current_user_id
        repair_req.review_notes = data.get('notes', '')
        repair_req.reviewed_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            'message': 'Request rejected successfully',
            'request': repair_req.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to reject request: {str(e)}'}), 500


@review_bp.route('/repairs/<int:request_id>/complete', methods=['POST'])
@jwt_required()
def complete_repair_request(request_id):
    """Mark a repair request as completed"""
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    # Only managers and admins can mark complete
    if user.role.hierarchy_level > 2:
        return jsonify({'error': 'Only managers and admins can complete requests'}), 403
    
    data = request.get_json() or {}
    repair_req = RepairRequest.query.get_or_404(request_id)
    
    # Manager can only complete their department's requests
    if user.role.hierarchy_level == 2 and repair_req.department_id != user.department_id:
        return jsonify({'error': 'Unauthorized'}), 403
    
    try:
        repair_req.status = 'Completed'
        repair_req.completed_at = datetime.utcnow()
        repair_req.completion_notes = data.get('notes', '')
        
        db.session.commit()
        
        return jsonify({
            'message': 'Request completed successfully',
            'request': repair_req.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to complete request: {str(e)}'}), 500