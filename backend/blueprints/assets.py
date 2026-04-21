from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
from extensions import db
from models.asset import Asset
from models.user import User
from models.audit_log import AuditLog
import os
import json
import traceback

assets_bp = Blueprint("assets", __name__)

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# ----------------------------
# GET ALL ASSETS
# ----------------------------
@assets_bp.route("/", methods=["GET"])
@jwt_required()
def get_assets():
    try:
        page = int(request.args.get("page", 1))
        per_page = int(request.args.get("per_page", 10))
        search = request.args.get("search", "")
        status = request.args.get("status", "")

        query = Asset.query.filter_by(is_active=True)

        if search:
            query = query.filter(
                (Asset.asset_name.ilike(f"%{search}%")) |
                (Asset.asset_code.ilike(f"%{search}%"))
            )

        if status:
            query = query.filter(Asset.status.ilike(status))

        paginated = query.paginate(page=page, per_page=per_page, error_out=False)

        return jsonify({
            "assets": [a.to_dict() for a in paginated.items],
            "total": paginated.total,
            "page": page,
            "pages": paginated.pages
        }), 200

    except Exception as e:
        print(traceback.format_exc())
        return jsonify({"error": str(e)}), 500


# ----------------------------
# GET SINGLE ASSET
# ----------------------------
@assets_bp.route("/<int:asset_id>", methods=["GET"])
@jwt_required()
def get_asset(asset_id):
    try:
        asset = Asset.query.get(asset_id)
        if not asset:
            return jsonify({"error": "Asset not found"}), 404

        return jsonify(asset.to_dict()), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ----------------------------
# CREATE ASSET (FIXED + IMAGE UPLOAD)
# ----------------------------
@assets_bp.route("/", methods=["POST"])
@jwt_required()
def create_asset():
    try:
        data = request.form
        file = request.files.get("image_file")

        image_url = None

        if file:
            filename = secure_filename(file.filename)
            filepath = os.path.join(UPLOAD_FOLDER, filename)
            file.save(filepath)
            image_url = f"/uploads/{filename}"

        asset = Asset(
            asset_name=data.get("name"),
            asset_code=data.get("asset_code"),
            barcode=data.get("barcode"),
            status=data.get("status", "available"),
            description=data.get("description"),
            category_id=data.get("category_id"),
            asset_type_id=data.get("asset_type_id"),
            vendor_id=data.get("vendor_id"),
            department_id=data.get("department_id"),
            image_url=image_url
        )

        db.session.add(asset)
        db.session.commit()

        return jsonify({
            "message": "Asset created",
            "asset": asset.to_dict()
        }), 201

    except Exception as e:
        db.session.rollback()
        print(traceback.format_exc())
        return jsonify({"error": str(e)}), 500


# ----------------------------
# UPDATE ASSET
# ----------------------------
@assets_bp.route("/<int:asset_id>", methods=["PUT"])
@jwt_required()
def update_asset(asset_id):
    try:
        asset = Asset.query.get(asset_id)
        if not asset:
            return jsonify({"error": "Asset not found"}), 404

        data = request.form
        file = request.files.get("image_file")

        if file:
            filename = secure_filename(file.filename)
            filepath = os.path.join(UPLOAD_FOLDER, filename)
            file.save(filepath)
            asset.image_url = f"/uploads/{filename}"

        asset.asset_name = data.get("name", asset.asset_name)
        asset.asset_code = data.get("asset_code", asset.asset_code)
        asset.barcode = data.get("barcode", asset.barcode)
        asset.status = data.get("status", asset.status)
        asset.description = data.get("description", asset.description)
        asset.category_id = data.get("category_id", asset.category_id)
        asset.asset_type_id = data.get("asset_type_id", asset.asset_type_id)
        asset.vendor_id = data.get("vendor_id", asset.vendor_id)
        asset.department_id = data.get("department_id", asset.department_id)

        db.session.commit()

        return jsonify({
            "message": "Asset updated",
            "asset": asset.to_dict()
        }), 200

    except Exception as e:
        db.session.rollback()
        print(traceback.format_exc())
        return jsonify({"error": str(e)}), 500


# ----------------------------
# ASSIGN ASSET
# ----------------------------
@assets_bp.route("/<int:asset_id>/assign", methods=["POST"])
@jwt_required()
def assign_asset(asset_id):
    try:
        current_user_id = int(get_jwt_identity())
        user = User.query.get(current_user_id)

        if not user or user.role.hierarchy_level > 2:
            return jsonify({"error": "Permission denied"}), 403

        data = request.get_json()
        user_id = data.get("user_id")

        asset = Asset.query.get(asset_id)
        target_user = User.query.get(user_id)

        if not asset or not target_user:
            return jsonify({"error": "Invalid asset or user"}), 404

        if asset.assigned_to:
            return jsonify({"error": "Already assigned"}), 400

        asset.assign_to(user_id)
        db.session.commit()

        return jsonify({
            "message": "Asset assigned",
            "asset": asset.to_dict()
        }), 200

    except Exception as e:
        db.session.rollback()
        print(traceback.format_exc())
        return jsonify({"error": str(e)}), 500


# ----------------------------
# RETURN ASSET
# ----------------------------
@assets_bp.route("/<int:asset_id>/return", methods=["POST"])
@jwt_required()
def return_asset(asset_id):
    try:
        current_user_id = int(get_jwt_identity())
        user = User.query.get(current_user_id)

        if not user or user.role.hierarchy_level > 2:
            return jsonify({"error": "Permission denied"}), 403

        asset = Asset.query.get(asset_id)

        if not asset:
            return jsonify({"error": "Asset not found"}), 404

        if not asset.assigned_to:
            return jsonify({"error": "Not assigned"}), 400

        asset.unassign()
        db.session.commit()

        return jsonify({
            "message": "Asset returned",
            "asset": asset.to_dict()
        }), 200

    except Exception as e:
        db.session.rollback()
        print(traceback.format_exc())
        return jsonify({"error": str(e)}), 500