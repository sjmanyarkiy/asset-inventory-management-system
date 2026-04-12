from flask import Blueprint, request, jsonify
from app import db
from app.models.asset_type import AssetType
from app.models.asset_category import AssetCategory
from sqlalchemy import or_
from app.services.safe_delete_service import check_safe_delete

type_bp = Blueprint('type_bp', __name__, url_prefix='/types')


# =========================
# CREATE TYPE
# =========================
@type_bp.route('', methods=['POST'])
def create_asset_type():
    try:
        data = request.get_json()

        if not data or not data.get("name") or not data.get("type_code") or not data.get("category_id"):
            return jsonify({"error": "name, type_code, category_id required"}), 400

        category = AssetCategory.query.get(data["category_id"])
        if not category:
            return jsonify({"error": "Invalid category_id"}), 400

        existing = AssetType.query.filter(
            or_(
                AssetType.name == data["name"].strip(),
                AssetType.type_code == data["type_code"].strip().upper()
            )
        ).first()

        if existing:
            return jsonify({"error": "Asset type already exists"}), 400

        t = AssetType(
            name=data["name"].strip(),
            type_code=data["type_code"].strip().upper(),
            category_id=data["category_id"],
            description=data.get("description")
        )

        db.session.add(t)
        db.session.commit()

        return jsonify({
            "message": "Asset type created successfully",
            "data": t.to_dict()
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Asset type creation failed", "details": str(e)}), 500


# =========================
# GET ALL TYPES
# =========================
@type_bp.route('', methods=['GET'])
def get_asset_types():
    search = request.args.get('search', '')

    query = AssetType.query.join(AssetCategory)

    if search:
        search = f"%{search}%"
        query = query.filter(
            or_(
                AssetType.name.ilike(search),
                AssetType.type_code.ilike(search),
                AssetType.description.ilike(search),
                AssetCategory.name.ilike(search)
            )
        )

    types = query.order_by(AssetType.id.desc()).all()

    return jsonify({
        "data": [t.to_dict() for t in types]
    }), 200


# =========================
# UPDATE TYPE
# =========================
@type_bp.route('/<int:id>', methods=['PUT'])
def update_asset_type(id):
    try:
        t = AssetType.query.get_or_404(id)
        data = request.get_json()

        if not data:
            return jsonify({"error": "No input data"}), 400

        # block type_code update
        if "type_code" in data:
            return jsonify({"error": "type_code cannot be updated"}), 400

        # duplicate check (safe)
        existing = AssetType.query.filter(
            AssetType.id != id,
            or_(
                AssetType.name == data.get("name"),
                AssetType.type_code == data.get("type_code")
            )
        ).first()

        if existing:
            return jsonify({"error": "Asset type already exists"}), 400

        if "name" in data and data["name"]:
            t.name = data["name"].strip()

        if "category_id" in data:
            category = AssetCategory.query.get(data["category_id"])
            if not category:
                return jsonify({"error": "Invalid category_id"}), 400
            t.category_id = data["category_id"]

        if "description" in data:
            t.description = data["description"]

        db.session.commit()

        return jsonify({
            "message": "Asset type updated successfully",
            "data": t.to_dict()
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Asset type update failed", "details": str(e)}), 500


# =========================
# DELETE TYPE (SAFE DELETE)
# =========================
@type_bp.route('/<int:id>', methods=['DELETE'])
def delete_asset_type(id):
    try:
        t = AssetType.query.get_or_404(id)

        can_delete, message = check_safe_delete("asset_type", id)

        if not can_delete:
            return jsonify({
                "error": "Cannot delete asset type",
                "details": message
            }), 400

        db.session.delete(t)
        db.session.commit()

        return jsonify({
            "message": "Asset type deleted successfully",
            "id": id
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({
            "error": "Asset type deletion failed",
            "details": str(e)
        }), 500