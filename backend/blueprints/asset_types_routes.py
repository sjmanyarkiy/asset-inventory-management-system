"""
Asset Types API Routes
GET /api/asset-types - List all asset types
GET /api/asset-types/<id> - Get single asset type
POST /api/asset-types - Create new asset type (admin only)
PUT /api/asset-types/<id> - Update asset type (admin only)
DELETE /api/asset-types/<id> - Delete asset type (admin only)
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.asset_type import AssetType
from extensions import db
from functools import wraps
import jwt
import os

asset_types_bp = Blueprint('asset_types', __name__, url_prefix='/api/asset-types')
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
#             current_user_id = data.get('user_id')
#         except jwt.ExpiredSignatureError:
#             return jsonify({'error': 'Token has expired'}), 401
#         except jwt.InvalidTokenError:
#             return jsonify({'error': 'Invalid token'}), 401

#         return f(current_user_id, *args, **kwargs)
#     return decorated


@asset_types_bp.route('', methods=['GET'])
@jwt_required()
def get_all_asset_types(current_user_id):
    current_user_id = get_jwt_identity()
    """Get all asset types"""
    try:
        asset_types = AssetType.query.all()
        return jsonify({
            'data': [at.to_dict() for at in asset_types],
            'count': len(asset_types)
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@asset_types_bp.route('/<int:asset_type_id>', methods=['GET'])
@jwt_required()
def get_asset_type(current_user_id, asset_type_id):
    current_user_id = get_jwt_identity()
    """Get single asset type by ID"""
    try:
        asset_type = AssetType.query.get(asset_type_id)
        if not asset_type:
            return jsonify({'error': 'Asset type not found'}), 404
        
        return jsonify(asset_type.to_dict()), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@asset_types_bp.route('', methods=['POST'])
@jwt_required()
def create_asset_type(current_user_id):
    """Create new asset type (admin only)"""
    from models.user import User
    
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        if not user or user.role.hierarchy_level > 1:  # Admin/SuperAdmin only
            return jsonify({'error': 'Permission denied'}), 403

        data = request.get_json()
        
        if not data.get('name'):
            return jsonify({'error': 'Asset type name is required'}), 400

        # Check if exists
        existing = AssetType.query.filter_by(name=data['name']).first()
        if existing:
            return jsonify({'error': 'Asset type already exists'}), 400

        asset_type = AssetType(
            name=data['name'],
            description=data.get('description', '')
        )
        
        db.session.add(asset_type)
        db.session.commit()
        
        return jsonify(asset_type.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@asset_types_bp.route('/<int:asset_type_id>', methods=['PUT'])
@jwt_required()
def update_asset_type(current_user_id, asset_type_id):
    """Update asset type (admin only)"""
    from models.user import User
    
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        if not user or user.role.hierarchy_level > 1:
            return jsonify({'error': 'Permission denied'}), 403

        asset_type = AssetType.query.get(asset_type_id)
        if not asset_type:
            return jsonify({'error': 'Asset type not found'}), 404

        data = request.get_json()
        
        if 'name' in data:
            asset_type.name = data['name']
        if 'description' in data:
            asset_type.description = data['description']

        db.session.commit()
        return jsonify(asset_type.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@asset_types_bp.route('/<int:asset_type_id>', methods=['DELETE'])
@jwt_required()
def delete_asset_type(current_user_id, asset_type_id):
    """Delete asset type (admin only)"""
    from models.user import User
    
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        if not user or user.role.hierarchy_level > 1:
            return jsonify({'error': 'Permission denied'}), 403

        asset_type = AssetType.query.get(asset_type_id)
        if not asset_type:
            return jsonify({'error': 'Asset type not found'}), 404

        db.session.delete(asset_type)
        db.session.commit()
        
        return jsonify({'message': 'Asset type deleted'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500