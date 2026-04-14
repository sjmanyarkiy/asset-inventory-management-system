from flask import Blueprint, request, jsonify
from datetime import datetime
from backend.models.report import db
from models.assets import Asset
from models.role import Role
from models.users import User
from models.audit_log import AuditLog
import json

assets_bp = Blueprint("assets", __name__)


# ----------------------------
# Helpers
# ----------------------------

def log_action(action, asset_id, user_id, target_user_id=None, metadata=None):
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


def send_email(to_email, subject, message):
    # replace later with Flask-Mail or SMTP service
    print(f"EMAIL → {to_email} | {subject} | {message}")


# ----------------------------
# GET ALL ASSETS
# ----------------------------

@assets_bp.route("/assets", methods=["GET"])
def get_assets():
    page = int(request.args.get("page", 1))
    per_page = int(request.args.get("per_page", 10))

    assets_query = Asset.query

    assets = assets_query.paginate(page=page, per_page=per_page, error_out=False)

    # return jsonify({
    #     "assets": [
    #         {
    #             "id": a.id,
    #             "name": a.name,
    #             "category": a.category,
    #             "status": a.status,
    #             "assigned_to": {
    #                 "id": a.assigned_to_user.id,
    #                 "name": a.assigned_to_user.first_name
    #             } if a.assigned_to_user else None
    #         }
    #         for a in assets.items
    #     ],
    #     "total": assets.total
    # })
    return jsonify({
        "assets": [a.to_dict() for a in assets.items],
        "total": assets.total
    })


# ----------------------------
# ASSIGN ASSET
# ----------------------------

# @assets_bp.route("/assets/<int:asset_id>/assign", methods=["POST"])
# def assign_asset(asset_id):
#     data = request.json
#     user_id = data.get("user_id")
#     current_user_id = data.get("current_user_id")

#     asset = Asset.query.get_or_404(asset_id)
#     user = User.query.get_or_404(user_id)
#     current_user = User.query.get_or_404(current_user_id)

#     # validation
#     # if asset.status == "Assigned":
#     #     return jsonify({"error": "Asset already assigned"}), 400
#     if asset.status != "Available":
#      return jsonify({"error": "Asset not available"}), 400

#     # asset.status = "Assigned"
#     # asset.assigned_to = user.id
#     # asset.updated_at = datetime.utcnow()
#     asset.assign_to(user.id)

#     db.session.commit()

#     log_action(
#         "ASSIGN_ASSET",
#         asset.id,
#         current_user.id,
#         user.id,
#         # {"asset": asset.name}
#         {"asset": asset.asset_name}
#     )

#     send_email(
#         user.email,
#         "Asset Assigned",
#         f"You have been assigned {asset.name}"
#     )

#     # return jsonify({"message": "Asset assigned successfully"})
#     return jsonify({
#         "message": "Asset assigned successfully",
#         "asset": asset.to_dict()
#     }), 200
@assets_bp.route("/assets/<int:asset_id>/assign", methods=["POST"])
def assign_asset(asset_id):
    data = request.get_json() or {}

    user_id = data.get("user_id")

    asset = Asset.query.get_or_404(asset_id)
    user = User.query.get_or_404(user_id)

    # prevent double assignment
    if asset.assigned_to:
        return jsonify({"error": "Asset already assigned"}), 400

    asset.assigned_to = user.id
    asset.status = "Assigned"
    asset.assigned_at = datetime.utcnow()
    asset.updated_at = datetime.utcnow()

    asset.unassign()
    db.session.commit()
    db.session.refresh(asset)

    return jsonify({
        "message": "Asset assigned successfully",
        "asset": asset.to_dict()
    }), 200

# ----------------------------
# RETURN ASSET
# ----------------------------

@assets_bp.route("/assets/<int:asset_id>/return", methods=["POST"])
def return_asset(asset_id):
    data = request.json
    current_user_id = data.get("current_user_id")

    asset = Asset.query.get_or_404(asset_id)
    current_user = User.query.get_or_404(current_user_id)

    asset.status = "Available"
    asset.assigned_to = None
    asset.updated_at = datetime.utcnow()

    db.session.commit()

    log_action(
        "RETURN_ASSET",
        asset.id,
        current_user.id,
        # metadata={"asset": asset.name}
        metadata={"asset": asset.asset_name}
    )

    return jsonify({"message": "Asset returned successfully"})


# ----------------------------
# ASSET HISTORY
# ----------------------------

@assets_bp.route("/assets/<int:asset_id>/history", methods=["GET"])
def asset_history(asset_id):
    logs = AuditLog.query.filter_by(asset_id=asset_id).order_by(AuditLog.timestamp.desc()).all()

    return jsonify({
        "history": [
            {
                "id": l.id,
                "action": l.action,
                "performed_by": l.performed_by,
                "target": l.target,
                "metadata": json.loads(l.metadata or "{}"),
                "timestamp": l.timestamp
            }
            for l in logs
        ]
    })