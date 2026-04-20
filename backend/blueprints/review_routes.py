"""
Manager Request Review Routes
Managers can view, approve, and reject asset/repair requests from their department
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity
from models.asset_request import AssetRequest
from models.repair_request import RepairRequest
from models.user import User
from extensions import db
from functools import wraps
import jwt
import os
from datetime import datetime

review_bp = Blueprint('review', __name__)
# current_user_id = get_jwt_identity()


# def token_required(f):
#     """Verify JWT token"""
#     @wraps(f)
#     def decorated(*args, **kwargs):
#         token = None
#         if 'Authorization' in request.headers:
#             auth_header = request.headers['Authorization']
#             try:
#                 token = auth_header.split(" ")[1]
#             except IndexError:
#                 return jsonify({'error': 'Invalid token format'}), 401

#         if not token:
#             return jsonify({'error': 'Token is missing'}), 401

#         try:
#             data = jwt.decode(token, os.getenv('JWT_SECRET_KEY'), algorithms=['HS256'])
#             # current_user_id = data.get('user_id')
#             current_user_id = data.get('sub')
#         except jwt.ExpiredSignatureError:
#             return jsonify({'error': 'Token has expired'}), 401
#         except jwt.InvalidTokenError:
#             return jsonify({'error': 'Invalid token'}), 401

#         return f(current_user_id, *args, **kwargs)
#     return decorated


# ============================================================================
# ASSET REQUEST REVIEWS
# ============================================================================

@review_bp.route('/assets', methods=['GET'])
@jwt_required()
def get_asset_requests_for_review():
    try:
        current_user_id = get_jwt_identity()
        # user = User.query.get(current_user_id)
        user = db.session.get(User, int(current_user_id))
        if not user:
            return jsonify({'error': 'User not found'}), 404

        # ✅ FIXED: Managers (1) + Admins (2+) can review
        if user.role.hierarchy_level > 2:  # Employees (0) cannot
            return jsonify({'error': 'Permission denied'}), 403

        query = AssetRequest.query.filter_by(status='Pending')
        print("JWT:", current_user_id)
        print("USER FOUND:", user)
        print("ROLE:", getattr(user.role, "hierarchy_level", None))

        # Managers filter by their departments
        if user.role.hierarchy_level == 2:  # Manager only sees OWN dept
            if user.managed_departments:
                dept_ids = [d.id for d in user.managed_departments]
                query = query.filter(AssetRequest.department_id.in_(dept_ids))
            else:
                return jsonify({'requests': []}), 200

        requests_list = query.all()
        return jsonify({
            'requests': [r.to_dict() for r in requests_list],  # Use model method
            'count': len(requests_list)
        }), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@review_bp.route('/assets/<int:request_id>/approve', methods=['POST'])
@jwt_required()
def approve_asset_request(request_id):
    """Manager approves an asset request"""
    try:
        current_user_id = get_jwt_identity()
        # user = User.query.get(current_user_id)
        user = db.session.get(User, int(current_user_id))
        if not user or user.role.hierarchy_level > 2:
            return jsonify({'error': 'Permission denied'}), 403

        asset_request = AssetRequest.query.get(request_id)
        if not asset_request:
            return jsonify({'error': 'Request not found'}), 404

        if asset_request.status != 'Pending':
            return jsonify({'error': f'Cannot approve {asset_request.status} request'}), 400

        # Verify manager has permission
        if user.role.hierarchy_level > 2:  # Manager
            dept_ids = [d.id for d in user.managed_departments]
            if asset_request.department_id not in dept_ids:
                return jsonify({'error': 'Permission denied - not your department'}), 403

        data = request.get_json() or {}

        # Update request
        asset_request.status = 'Approved'
        asset_request.reviewed_by = current_user_id
        asset_request.reviewed_at = datetime.utcnow()
        asset_request.review_notes = data.get('notes', '')

        db.session.commit()

        return jsonify({
            'message': 'Request approved',
            'request_id': asset_request.id,
            'status': asset_request.status,
            'reviewed_at': asset_request.reviewed_at.isoformat()
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@review_bp.route('/assets/<int:request_id>/reject', methods=['POST'])
@jwt_required()
def reject_asset_request(request_id):
    """Manager rejects an asset request"""
    try:
        current_user_id = get_jwt_identity()
        # user = User.query.get(current_user_id)
        user = db.session.get(User, int(current_user_id))
        if not user or user.role.hierarchy_level > 1:
            return jsonify({'error': 'Permission denied'}), 403

        asset_request = AssetRequest.query.get(request_id)
        if not asset_request:
            return jsonify({'error': 'Request not found'}), 404

        if asset_request.status != 'Pending':
            return jsonify({'error': f'Cannot reject {asset_request.status} request'}), 400

        # Verify manager has permission
        if user.role.hierarchy_level > 2:  # Manager
            dept_ids = [d.id for d in user.managed_departments]
            if asset_request.department_id not in dept_ids:
                return jsonify({'error': 'Permission denied - not your department'}), 403

        data = request.get_json()
        if not data or not data.get('notes'):
            return jsonify({'error': 'Rejection notes are required'}), 400

        # Update request
        asset_request.status = 'Rejected'
        asset_request.reviewed_by = current_user_id
        asset_request.reviewed_at = datetime.utcnow()
        asset_request.review_notes = data.get('notes')

        db.session.commit()

        return jsonify({
            'message': 'Request rejected',
            'request_id': asset_request.id,
            'status': asset_request.status,
            'reviewed_at': asset_request.reviewed_at.isoformat()
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


# ============================================================================
# REPAIR REQUEST REVIEWS
# ============================================================================

@review_bp.route('/repairs', methods=['GET'])
@jwt_required()
def get_repair_requests_for_review():
    """Get repair requests for manager review"""
    try:
        current_user_id = get_jwt_identity()
        # user = User.query.get(current_user_id)
        user = db.session.get(User, int(current_user_id))
        if not user:
            return jsonify({'error': 'User not found'}), 404

        # Check if manager or admin
        if user.role.hierarchy_level > 1:
            return jsonify({'error': 'Permission denied'}), 403

        # Get filter status (pending, completed, etc)
        status_filter = request.args.get('status', 'Pending')

        query = RepairRequest.query.filter_by(status=status_filter)

        # If Manager, filter by department
        if user.role.hierarchy_level > 2:
            if user.managed_departments:
                dept_ids = [d.id for d in user.managed_departments]
                query = query.filter(RepairRequest.department_id.in_(dept_ids))
            else:
                return jsonify({'requests': []}), 200

        repairs_list = query.all()

        return jsonify({
            'requests': [
                {
                    'id': r.id,
                    'asset_id': r.asset_id,
                    'asset': {'id': r.asset.id, 'asset_name': r.asset.asset_name} if r.asset else None,
                    'issue_description': r.issue_description,
                    'urgency': r.urgency,
                    'status': r.status,
                    'department_id': r.department_id,
                    'requested_by': {
                        # 'id': r.requested_user.id,
                        'requested_by': {
                            'id': r.requested_user.id,
                            'username': r.requested_user.username,
                        } if r.requested_user is not None else None,
                        'username': r.requested_user.username,
                        'first_name': r.requested_user.first_name,
                        'last_name': r.requested_user.last_name,
                    } if r.requested_user else None,
                    'created_at': r.created_at.isoformat() if r.created_at else None,
                    'completed_at': r.completed_at.isoformat() if r.completed_at else None,
                }
                for r in repairs_list
            ],
            'count': len(repairs_list)
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@review_bp.route('/repairs/<int:request_id>/approve', methods=['POST'])
@jwt_required()
def approve_repair_request(request_id):
    """Manager approves a repair request (assigns to maintenance)"""
    try:
        current_user_id = get_jwt_identity()
        # user = User.query.get(current_user_id)
        user = db.session.get(User, int(current_user_id))
        if not user or user.role.hierarchy_level > 1:
            print("USER:", user.role.hierarchy_level)
            return jsonify({'error': 'Permission denied'}), 403

        repair_request = RepairRequest.query.get(request_id)
        if not repair_request:
            return jsonify({'error': 'Request not found'}), 404

        if repair_request.status != 'Pending':
            return jsonify({'error': f'Cannot approve {repair_request.status} request'}), 400

        # Verify manager has permission
        if user.role.hierarchy_level > 2:
            dept_ids = [d.id for d in user.managed_departments]
            if repair_request.department_id not in dept_ids:
                return jsonify({'error': 'Permission denied'}), 403

        data = request.get_json() or {}

        repair_request.status = 'Approved'
        repair_request.reviewed_by = current_user_id
        repair_request.reviewed_at = datetime.utcnow()
        repair_request.review_notes = data.get('notes', '')

        db.session.commit()

        return jsonify({
            'message': 'Repair request approved',
            'request_id': repair_request.id,
            'status': repair_request.status
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@review_bp.route('/repairs/<int:request_id>/reject', methods=['POST'])
@jwt_required()
def reject_repair_request(request_id):
    """Manager rejects a repair request"""
    try:
        current_user_id = get_jwt_identity()
        # user = User.query.get(current_user_id)
        user = db.session.get(User, int(current_user_id))
        if not user or user.role.hierarchy_level > 1:
            return jsonify({'error': 'Permission denied'}), 403

        repair_request = RepairRequest.query.get(request_id)
        if not repair_request:
            return jsonify({'error': 'Request not found'}), 404

        if repair_request.status != 'Pending':
            return jsonify({'error': f'Cannot reject {repair_request.status} request'}), 400

        # Verify manager has permission
        if user.role.hierarchy_level > 2:
            dept_ids = [d.id for d in user.managed_departments]
            if repair_request.department_id not in dept_ids:
                return jsonify({'error': 'Permission denied'}), 403

        data = request.get_json()
        if not data or not data.get('notes'):
            return jsonify({'error': 'Rejection notes are required'}), 400

        repair_request.status = 'Rejected'
        repair_request.reviewed_by = current_user_id
        repair_request.reviewed_at = datetime.utcnow()
        repair_request.review_notes = data.get('notes')

        db.session.commit()

        return jsonify({
            'message': 'Repair request rejected',
            'request_id': repair_request.id,
            'status': repair_request.status
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@review_bp.route('/repairs/<int:request_id>/complete', methods=['POST'])
@jwt_required()
def complete_repair_request(request_id):
    """Mark repair request as completed"""
    try:
        current_user_id = get_jwt_identity()
        # user = User.query.get(current_user_id)
        user = db.session.get(User, int(current_user_id))
        if not user or user.role.hierarchy_level > 1:
            return jsonify({'error': 'Permission denied'}), 403

        repair_request = RepairRequest.query.get(request_id)
        if not repair_request:
            return jsonify({'error': 'Request not found'}), 404

        if repair_request.status != 'Approved':
            return jsonify({'error': 'Can only complete approved requests'}), 400

        # Verify manager has permission
        if user.role.hierarchy_level > 2:
            dept_ids = [d.id for d in user.managed_departments]
            if repair_request.department_id not in dept_ids:
                return jsonify({'error': 'Permission denied'}), 403

        data = request.get_json() or {}

        repair_request.status = 'Completed'
        repair_request.completed_at = datetime.utcnow()
        repair_request.completion_notes = data.get('notes', '')

        db.session.commit()

        return jsonify({
            'message': 'Repair request completed',
            'request_id': repair_request.id,
            'status': repair_request.status,
            'completed_at': repair_request.completed_at.isoformat()
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500