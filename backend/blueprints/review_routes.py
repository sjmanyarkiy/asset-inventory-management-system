"""
Manager Request Review Routes (Production Refactor)

Responsibilities:
- Fetch pending/filtered requests
- Approve / reject asset requests
- Approve / reject / complete repair requests
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime

from models.asset_request import AssetRequest
from models.repair_request import RepairRequest
from models.user import User
from extensions import db

review_bp = Blueprint("review", __name__)


# =========================================================
# Helpers
# =========================================================

def get_current_user():
    user_id = get_jwt_identity()
    return db.session.get(User, int(user_id))


def require_manager_or_admin(user):
    """
    hierarchy_level:
    1 = Admin
    2 = Manager
    3+ = Employee (or lower privilege depending on your system)
    """
    if not user:
        return False
    return user.role and user.role.hierarchy_level <= 2


def get_allowed_department_filter(user, query, model):
    """
    Managers are restricted to their departments
    """
    if user.role.hierarchy_level == 2:  # Manager
        if user.managed_departments:
            dept_ids = [d.id for d in user.managed_departments]
            return query.filter(model.department_id.in_(dept_ids))
        return query.filter(False)  # no departments → no data
    return query


def serialize_repair(r):
    return {
        "id": r.id,
        "asset_id": r.asset_id,
        "asset": {
            "id": r.asset.id,
            "asset_name": r.asset.asset_name
        } if r.asset else None,
        "issue_description": r.issue_description,
        "urgency": r.urgency,
        "status": r.status,
        "department_id": r.department_id,
        "requested_by": {
            "id": r.requested_user.id,
            "username": r.requested_user.username,
            "first_name": r.requested_user.first_name,
            "last_name": r.requested_user.last_name,
        } if r.requested_user else None,
        "created_at": r.created_at.isoformat() if r.created_at else None,
        "completed_at": r.completed_at.isoformat() if r.completed_at else None,
    }


def update_request_status(obj, status, user_id, notes=None, extra_fields=None):
    obj.status = status
    obj.reviewed_by = user_id
    obj.reviewed_at = datetime.utcnow()
    obj.review_notes = notes or ""

    if extra_fields:
        for k, v in extra_fields.items():
            setattr(obj, k, v)


# =========================================================
# ASSET REQUESTS
# =========================================================

@review_bp.route("/assets", methods=["GET"])
@jwt_required()
def get_asset_requests():
    try:
        user = get_current_user()
        if not require_manager_or_admin(user):
            return jsonify({"error": "Permission denied"}), 403

        status = request.args.get("status", "Pending")

        query = AssetRequest.query.filter_by(status=status)
        query = get_allowed_department_filter(user, query, AssetRequest)

        requests = query.order_by(AssetRequest.created_at.desc()).all()

        return jsonify({
            "requests": [r.to_dict() for r in requests],
            "count": len(requests)
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@review_bp.route("/assets/<int:request_id>/approve", methods=["POST"])
@jwt_required()
def approve_asset(request_id):
    try:
        user = get_current_user()
        if not require_manager_or_admin(user):
            return jsonify({"error": "Permission denied"}), 403

        req = AssetRequest.query.get_or_404(request_id)

        if req.status != "Pending":
            return jsonify({"error": "Invalid state transition"}), 400

        data = request.get_json() or {}

        update_request_status(
            req,
            status="Approved",
            user_id=user.id,
            notes=data.get("notes")
        )

        db.session.commit()

        return jsonify({"message": "Asset request approved"}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@review_bp.route("/assets/<int:request_id>/reject", methods=["POST"])
@jwt_required()
def reject_asset(request_id):
    try:
        user = get_current_user()
        if not require_manager_or_admin(user):
            return jsonify({"error": "Permission denied"}), 403

        req = AssetRequest.query.get_or_404(request_id)

        if req.status != "Pending":
            return jsonify({"error": "Invalid state transition"}), 400

        data = request.get_json() or {}
        if not data.get("notes"):
            return jsonify({"error": "Rejection notes required"}), 400

        update_request_status(
            req,
            status="Rejected",
            user_id=user.id,
            notes=data["notes"]
        )

        db.session.commit()

        return jsonify({"message": "Asset request rejected"}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


# =========================================================
# REPAIR REQUESTS
# =========================================================

@review_bp.route("/repairs", methods=["GET"])
@jwt_required()
def get_repair_requests():
    try:
        user = get_current_user()
        if not require_manager_or_admin(user):
            return jsonify({"error": "Permission denied"}), 403

        status = request.args.get("status", "Pending")

        query = RepairRequest.query.filter_by(status=status)
        query = get_allowed_department_filter(user, query, RepairRequest)

        requests = query.order_by(RepairRequest.created_at.desc()).all()

        return jsonify({
            "requests": [serialize_repair(r) for r in requests],
            "count": len(requests)
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@review_bp.route("/repairs/<int:request_id>/approve", methods=["POST"])
@jwt_required()
def approve_repair(request_id):
    try:
        user = get_current_user()
        if not require_manager_or_admin(user):
            return jsonify({"error": "Permission denied"}), 403

        req = RepairRequest.query.get_or_404(request_id)

        if req.status != "Pending":
            return jsonify({"error": "Invalid state transition"}), 400

        data = request.get_json() or {}

        update_request_status(
            req,
            status="Approved",
            user_id=user.id,
            notes=data.get("notes")
        )

        db.session.commit()

        return jsonify({"message": "Repair request approved"}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@review_bp.route("/repairs/<int:request_id>/reject", methods=["POST"])
@jwt_required()
def reject_repair(request_id):
    try:
        user = get_current_user()
        if not require_manager_or_admin(user):
            return jsonify({"error": "Permission denied"}), 403

        req = RepairRequest.query.get_or_404(request_id)

        if req.status != "Pending":
            return jsonify({"error": "Invalid state transition"}), 400

        data = request.get_json() or {}
        if not data.get("notes"):
            return jsonify({"error": "Rejection notes required"}), 400

        update_request_status(
            req,
            status="Rejected",
            user_id=user.id,
            notes=data["notes"]
        )

        db.session.commit()

        return jsonify({"message": "Repair request rejected"}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@review_bp.route("/repairs/<int:request_id>/complete", methods=["POST"])
@jwt_required()
def complete_repair(request_id):
    try:
        user = get_current_user()
        if not require_manager_or_admin(user):
            return jsonify({"error": "Permission denied"}), 403

        req = RepairRequest.query.get_or_404(request_id)

        if req.status != "Approved":
            return jsonify({"error": "Only approved requests can be completed"}), 400

        data = request.get_json() or {}

        # ✅ Update repair request
        update_request_status(
            req,
            status="Completed",
            user_id=user.id,
            notes=data.get("notes"),
            extra_fields={"completed_at": datetime.utcnow()}
        )

        # ✅ VERY IMPORTANT: update the asset
        asset = req.asset
        if asset:
            asset.unassign()  
            asset.condition = "Good" 

        db.session.commit()

        return jsonify({"message": "Repair request completed"}), 200

    except Exception as e:
        db.session.rollback()
        print(" COMPLETE REPAIR ERROR:", str(e))
        return jsonify({"error": str(e)}), 500