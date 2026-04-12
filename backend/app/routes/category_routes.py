from flask import Blueprint, request, jsonify
from app import db
from app.models.asset_category import AssetCategory
from app.models.asset import Asset
from sqlalchemy import or_

category_bp = Blueprint('category_bp', __name__, url_prefix='/categories')


# =========================
# CREATE CATEGORY
# =========================
@category_bp.route('', methods=['POST'])
def create_category():
    try:
        data = request.get_json()

        if not data or not data.get("name") or not data.get("category_code"):
            return jsonify({"error": "name and category_code required"}), 400

        existing = AssetCategory.query.filter(
            or_(
                AssetCategory.name == data["name"],
                AssetCategory.category_code == data["category_code"]
            )
        ).first()

        if existing:
            return jsonify({"error": "Category already exists"}), 400

        cat = AssetCategory(
            name=data["name"].strip(),
            category_code=data["category_code"].strip().upper(),
            description=data.get("description")
        )

        db.session.add(cat)
        db.session.commit()

        return jsonify(cat.to_dict()), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


# =========================
# GET ALL CATEGORIES
# =========================
@category_bp.route('', methods=['GET'])
def get_categories():
    search = request.args.get('search', '')

    query = AssetCategory.query

    if search:
        query = query.filter(
            or_(
                AssetCategory.name.ilike(f"%{search}%"),
                AssetCategory.category_code.ilike(f"%{search}%"),
                AssetCategory.description.ilike(f"%{search}%")
            )
        )

    cats = query.order_by(AssetCategory.id.desc()).all()

    return jsonify({
        "data": [c.to_dict() for c in cats]
    })


# =========================
# UPDATE CATEGORY (SAFE)
# =========================
@category_bp.route('/<int:id>', methods=['PUT'])
def update_category(id):
    try:
        cat = AssetCategory.query.get_or_404(id)
        data = request.get_json()

        if not data:
            return jsonify({"error": "No input data"}), 400

        existing = AssetCategory.query.filter(
            AssetCategory.id != id,
            or_(
                AssetCategory.name == data.get("name"),
                AssetCategory.category_code == data.get("category_code")
            )
        ).first()

        if existing:
            return jsonify({"error": "Category already exists"}), 400

        if "name" in data and data["name"]:
            cat.name = data["name"].strip()

        if "description" in data:
            cat.description = data["description"]

        if "category_code" in data and data["category_code"] != cat.category_code:
            return jsonify({
                "error": "category_code cannot be updated"
            }), 400

        db.session.commit()

        return jsonify(cat.to_dict())

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


# =========================
# DELETE CATEGORY (SAFE FIXED)
# =========================
@category_bp.route('/<int:id>', methods=['DELETE'])
def delete_category(id):
    try:
        cat = AssetCategory.query.get_or_404(id)

        # 🔥 SAFE CHECK (prevents FK crash)
        asset_count = Asset.query.filter_by(category_id=id).count()

        if asset_count > 0:
            return jsonify({
                "error": "Cannot delete. Category is in use by assets."
            }), 400

        db.session.delete(cat)
        db.session.commit()

        return jsonify({"message": "Category deleted successfully"})

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500