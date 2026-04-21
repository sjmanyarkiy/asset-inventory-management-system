from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity
from datetime import datetime
from extensions import db
from models.asset import Asset
from models.role import Role
from models.user import User
from models.audit_log import AuditLog
from functools import wraps
import jwt
import os
import json

assets_bp = Blueprint("assets", __name__)

def log_action(action, asset_id, user_id, target_user_id=None, metadata=None):
    """Log asset actions to audit trail"""
    log = AuditLog(
        action=action,
        asset_id=asset_id,
        performed_by=user_id,
        target_user=target_user_id,
        metadata=json.dumps(metadata or {}),
        timestamp=datetime.utcnow()
    )
    db.session.add(log)
    db.session.commit()


# ----------------------------
# GET ALL ASSETS (with pagination, search, filtering)
# ----------------------------

@assets_bp.route("/", methods=["GET"])
@jwt_required()
def get_assets():
    current_user_id = get_jwt_identity()
    print(f"🔍 DEBUG: current_user_id = {current_user_id}, type = {type(current_user_id)}")
    """Get all assets with search and filtering"""
    try:
        page = int(request.args.get("page", 1))
        per_page = int(request.args.get("per_page", 10))
        search = request.args.get("search", "").lower()
        status = request.args.get("status", "").lower()

        # Base query
        query = Asset.query.filter_by(is_active=True)

        # Search by asset name or code
        if search:
            query = query.filter(
                (Asset.asset_name.ilike(f"%{search}%")) |
                (Asset.asset_code.ilike(f"%{search}%"))
            )

        # Filter by status
        if status:
            query = query.filter(Asset.status.ilike(status))

        # Paginate
        paginated = query.paginate(page=page, per_page=per_page, error_out=False)

        print(f"✅ Assets found: {len(paginated.items)}")

        return jsonify({
            "assets": [a.to_dict() for a in paginated.items],
            "total": paginated.total,
            "page": page,
            "per_page": per_page,
            "pages": paginated.pages
        }), 200

    except Exception as e:
        import traceback
        print(f"❌ ERROR in get_assets: {str(e)}")
        print(traceback.format_exc())
        return jsonify({'error': str(e)}), 500


# ----------------------------
# GET SINGLE ASSET
# ----------------------------

@assets_bp.route("/<int:asset_id>", methods=["GET"])
@jwt_required()
def get_asset(asset_id):
    current_user_id = get_jwt_identity()
    """Get single asset by ID"""
    try:
        asset = Asset.query.get(asset_id)
        if not asset:
            return jsonify({'error': 'Asset not found'}), 404

        return jsonify(asset.to_dict()), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ----------------------------
# ASSIGN ASSET
# ----------------------------

@assets_bp.route("/<int:asset_id>/assign", methods=["POST"])
@jwt_required()
def assign_asset(asset_id):
    current_user_id = get_jwt_identity()
    """Assign asset to a user (admin/manager only)"""
    try:
        user = User.query.get(current_user_id)
        if not user or user.role.hierarchy_level > 2:  # Admin/SuperAdmin only
            return jsonify({'error': 'Permission denied'}), 403

        data = request.get_json() or {}
        user_id = data.get("user_id")

        if not user_id:
            return jsonify({'error': 'user_id is required'}), 400

        asset = Asset.query.get(asset_id)
        if not asset:
            return jsonify({'error': 'Asset not found'}), 404

        target_user = User.query.get(user_id)
        if not target_user:
            return jsonify({'error': 'User not found'}), 404

        # Prevent double assignment
        if asset.assigned_to:
            return jsonify({'error': 'Asset already assigned'}), 400

        # Assign
        asset.assign_to(user_id)
        db.session.commit()

        # Log action
        log_action(
            'ASSET_ASSIGNED',
            asset.id,
            current_user_id,
            user_id,
            {'asset': asset.asset_name}
        )

        return jsonify({
            'message': 'Asset assigned successfully',
            'asset': asset.to_dict()
        }), 200

    # except Exception as e:
    #     db.session.rollback()
    #     return jsonify({'error': str(e)}), 500
    except Exception as e:
        import traceback
        print("❌ ASSIGN ASSET ERROR:", str(e))
        print(traceback.format_exc())
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


# ----------------------------
# RETURN / UNASSIGN ASSET
# ----------------------------

@assets_bp.route("/<int:asset_id>/return", methods=["POST"])
@jwt_required()
def return_asset(asset_id):
    current_user_id = get_jwt_identity()
    """Return asset (unassign from user)"""
    try:
        user = User.query.get(current_user_id)
        if not user or user.role.hierarchy_level > 2:  # Admin/Manager
            return jsonify({'error': 'Permission denied'}), 403

        asset = Asset.query.get(asset_id)
        if not asset:
            return jsonify({'error': 'Asset not found'}), 404

        if not asset.assigned_to:
            return jsonify({'error': 'Asset is not currently assigned'}), 400

        # Unassign
        asset.unassign()
        db.session.commit()

        # Log action
        log_action(
            'ASSET_RETURNED',
            asset.id,
            current_user_id,
            None,
            {'asset': asset.asset_name}
        )

        return jsonify({
            'message': 'Asset returned successfully',
            'asset': asset.to_dict()
        }), 200

    # except Exception as e:
    #     db.session.rollback()
    #     return jsonify({'error': str(e)}), 500

    except Exception as e:
        import traceback
        print("RETURN ERROR:", str(e))
        print(traceback.format_exc())
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
    
    except Exception as e:
        import traceback
        print("❌ RETURN ASSET ERROR:", str(e))
        print(traceback.format_exc())
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
    


# ----------------------------
# ASSET HISTORY
# ----------------------------

@assets_bp.route("/<int:asset_id>/history", methods=["GET"])
@jwt_required()
def asset_history(asset_id):
    current_user_id = get_jwt_identity()
    """Get audit log history for an asset"""
    try:
        asset = Asset.query.get(asset_id)
        if not asset:
            return jsonify({'error': 'Asset not found'}), 404

        logs = AuditLog.query.filter_by(asset_id=asset_id).order_by(
            AuditLog.timestamp.desc()
        ).all()

        return jsonify({
            'asset_id': asset_id,
            'history': [
                {
                    'id': l.id,
                    'action': l.action,
                    'performed_by': l.performed_by,
                    'target_user': l.target_user,
                    'metadata': json.loads(l.metadata or '{}'),
                    'timestamp': l.timestamp.isoformat() if l.timestamp else None
                }
                for l in logs
            ],
            'total': len(logs)
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    

@assets_bp.route('/debug/seed-assets', methods=['GET'])
def seed_assets():
    from models.asset import Asset
    from extensions import db

    if Asset.query.first():
        return {"message": "Assets already exist"}

    asset = Asset(
        asset_name="Test Laptop",
        asset_code="AST-001",
        asset_type_id=1,
        category_id=None,
        status="Available"
    )

    db.session.add(asset)
    db.session.commit()

    return {"message": "Assets seeded successfully"}

# @assets_bp.route('/<int:asset_id>/barcode', methods=['GET'])
# @jwt_required()
# def get_asset_barcode(asset_id):
#     """Get barcode image for an asset"""
#     try:
#         asset = Asset.query.get(asset_id)
#         if not asset:
#             return jsonify({'error': 'Asset not found'}), 404
        
#         if not asset.barcode_image:
#             return jsonify({'error': 'Barcode not generated'}), 400
        
#         # Return as PNG
#         return send_file(
#             io.BytesIO(asset.barcode_image),
#             mimetype='image/png',
#             as_attachment=False
#         )
#     except Exception as e:
#         return jsonify({'error': str(e)}), 500


# @assets_bp.route('/barcode/<barcode_code>', methods=['GET'])
# @jwt_required()
# def lookup_asset_by_barcode(barcode_code):
#     """Lookup asset by barcode code"""
#     try:
#         asset = Asset.query.filter_by(barcode_data=barcode_code).first()
#         if not asset:
#             return jsonify({'error': 'Asset not found'}), 404
        
#         return jsonify({'asset': asset.to_dict()}), 200
#     except Exception as e:
#         return jsonify({'error': str(e)}), 500