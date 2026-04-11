from flask import Blueprint, request, jsonify
from app import db
from app.models.asset_category import AssetCategory
from sqlalchemy import or_

category_bp = Blueprint('category_bp', __name__, url_prefix='/categories')


# =========================
# CREATE CATEGORY
# =========================
@category_bp.route('', methods=['POST'])
def create_category():
    data = request.get_json()

    if not data:
        return jsonify({"error": "No input data provided"}), 400

    name = data.get("name")
    category_code = data.get("category_code")
    description = data.get("description")

    if not name or not category_code:
        return jsonify({"error": "name and category_code are required"}), 400

    existing = AssetCategory.query.filter(
        or_(
            AssetCategory.name == name,
            AssetCategory.category_code == category_code
        )
    ).first()

    if existing:
        return jsonify({"error": "Category already exists"}), 400

    try:
        category = AssetCategory(
            name=name.strip(),
            category_code=category_code.strip().upper(),
            description=description
        )

        db.session.add(category)
        db.session.commit()

        return jsonify(category.to_dict()), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


# =========================
# GET ALL CATEGORIES (FOR DROPDOWN + SEARCH)
# =========================
@category_bp.route('', methods=['GET'])
def get_categories():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 100, type=int)
    search = request.args.get('search', '', type=str)

    query = AssetCategory.query

    if search:
        query = query.filter(
            or_(
                AssetCategory.name.ilike(f"%{search}%"),
                AssetCategory.category_code.ilike(f"%{search}%")
            )
        )

    pagination = query.order_by(AssetCategory.id.desc()).paginate(
        page=page,
        per_page=per_page,
        error_out=False
    )

    return jsonify({
        "total": pagination.total,
        "pages": pagination.pages,
        "current_page": pagination.page,
        "data": [c.to_dict() for c in pagination.items]
    })


# =========================
# GET SINGLE
# =========================
@category_bp.route('/<int:id>', methods=['GET'])
def get_category(id):
    category = AssetCategory.query.get_or_404(id)
    return jsonify(category.to_dict())


# =========================
# UPDATE
# =========================
@category_bp.route('/<int:id>', methods=['PUT'])
def update_category(id):
    category = AssetCategory.query.get_or_404(id)
    data = request.get_json()

    if not data:
        return jsonify({"error": "No input data provided"}), 400

    category.name = data.get("name", category.name)
    category.category_code = data.get("category_code", category.category_code).upper()
    category.description = data.get("description", category.description)

    try:
        db.session.commit()
        return jsonify(category.to_dict())
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


# =========================
# DELETE
# =========================
@category_bp.route('/<int:id>', methods=['DELETE'])
def delete_category(id):
    category = AssetCategory.query.get_or_404(id)

    try:
        db.session.delete(category)
        db.session.commit()
        return jsonify({"message": "Category deleted"})
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500