from flask import Blueprint, request, jsonify
from app import db
from app.models.asset import Asset
from sqlalchemy import or_

import os
from werkzeug.utils import secure_filename

from app.services.asset_service import (
    create_asset_service,
    validate_asset_foreign_keys,
    check_asset_duplicates
)

asset_bp = Blueprint('asset_bp', __name__, url_prefix='/assets')

UPLOAD_FOLDER = "uploads/assets"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


# =========================
# CREATE ASSET
# =========================
@asset_bp.route('', methods=['POST'])
def create_asset():
    try:
        data = dict(request.form)
        file = request.files.get("image_file")

        required_fields = ["name", "barcode", "category_id", "asset_type_id"]
        missing_fields = [field for field in required_fields if not str(data.get(field, "")).strip()]
        if missing_fields:
            return jsonify({
                "error": f"Missing required fields: {', '.join(missing_fields)}"
            }), 400

        for field in ["category_id", "asset_type_id", "vendor_id", "department_id"]:
            if field in data and str(data[field]).strip() != "":
                try:
                    data[field] = int(data[field])
                except ValueError:
                    return jsonify({"error": f"{field} must be a number"}), 400

        image_file_path = None

        if file:
            filename = secure_filename(file.filename)
            filepath = os.path.join(UPLOAD_FOLDER, filename)
            file.save(filepath)
            image_file_path = filepath

        data["image_file"] = image_file_path

        asset, error = create_asset_service(data)

        if error:
            return jsonify({"error": error}), 400

        db.session.commit()

        return jsonify({
            "message": "Asset created successfully",
            "data": asset.to_dict()
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({
            "error": "Asset creation failed",
            "details": str(e)
        }), 500


# =========================
# GET ALL ASSETS
# =========================
@asset_bp.route('', methods=['GET'])
def get_assets():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)

    query = Asset.query

    filters = {
        "category_id": request.args.get('category_id', type=int),
        "asset_type_id": request.args.get('asset_type_id', type=int),
        "vendor_id": request.args.get('vendor_id', type=int),
        "department_id": request.args.get('department_id', type=int),
        "status": request.args.get('status')
    }

    for key, value in filters.items():
        if value:
            query = query.filter(getattr(Asset, key) == value)

    search = request.args.get('q')
    if search:
        query = query.filter(
            or_(
                Asset.name.ilike(f"%{search}%"),
                Asset.asset_code.ilike(f"%{search}%"),
                Asset.barcode.ilike(f"%{search}%")
            )
        )

    query = query.order_by(Asset.id.desc())

    pagination = query.paginate(page=page, per_page=per_page, error_out=False)

    return jsonify({
        "total": pagination.total,
        "pages": pagination.pages,
        "current_page": pagination.page,
        "data": [a.to_dict() for a in pagination.items]
    })


# =========================
# GET SINGLE ASSET
# =========================
@asset_bp.route('/<int:id>', methods=['GET'])
def get_asset(id):
    asset = db.session.get(Asset, id)

    if not asset:
        return jsonify({"error": "Asset not found"}), 404

    return jsonify(asset.to_dict())


# =========================
# UPDATE ASSET
# =========================
@asset_bp.route('/<int:id>', methods=['PUT'])
def update_asset(id):
    try:
        asset = db.session.get(Asset, id)

        if not asset:
            return jsonify({"error": "Asset not found"}), 404

        data = dict(request.form)
        file = request.files.get("image_file")

        if file:
            filename = secure_filename(file.filename)
            filepath = os.path.join(UPLOAD_FOLDER, filename)
            file.save(filepath)
            asset.image_file = filepath

        for field in ["category_id", "asset_type_id", "vendor_id", "department_id"]:
            if field in data and data[field]:
                try:
                    data[field] = int(data[field])
                except:
                    return jsonify({"error": f"{field} must be a number"}), 400

        error = validate_asset_foreign_keys(data)
        if error:
            return jsonify({"error": error}), 400

        error = check_asset_duplicates(
            data.get('asset_code'),
            data.get('barcode'),
            exclude_id=id
        )
        if error:
            return jsonify({"error": error}), 400

        fields = [
            "name", "asset_code", "barcode", "status",
            "description", "image_url",
            "category_id", "asset_type_id",
            "vendor_id", "department_id"
        ]

        for field in fields:
            if field in data:
                setattr(asset, field, data[field])

        db.session.commit()

        return jsonify({
            "message": "Asset updated successfully",
            "data": asset.to_dict()
        })

    except Exception as e:
        db.session.rollback()
        return jsonify({
            "error": "Asset update failed",
            "details": str(e)
        }), 500


# =========================
# DELETE ASSET (CLEAN - NO DEPENDENCY CHECK HERE)
# =========================
@asset_bp.route('/<int:id>', methods=['DELETE'])
def delete_asset(id):
    try:
        asset = db.session.get(Asset, id)

        if not asset:
            return jsonify({"error": "Asset not found"}), 404

        db.session.delete(asset)
        db.session.commit()

        return jsonify({
            "message": "Asset deleted successfully",
            "id": id
        })

    except Exception as e:
        db.session.rollback()
        return jsonify({
            "error": "Asset delete failed",
            "details": str(e)
        }), 500