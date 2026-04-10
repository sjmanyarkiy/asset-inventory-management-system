from flask import Blueprint, request, jsonify
from app import db
from app.models.asset_category import AssetCategory
from sqlalchemy import or_

category_bp = Blueprint('category_bp', __name__, url_prefix='/categories')


# -------------------------
# CREATE Category
# -------------------------
@category_bp.route('/', methods=['POST'])
def create_category():
    data = request.get_json()

    if not data:
        return jsonify({"error": "No input data provided"}), 400

    if not data.get('name') or not data.get('category_code'):
        return jsonify({"error": "name and category_code are required"}), 400

    existing = AssetCategory.query.filter(
        or_(
            AssetCategory.name == data.get('name'),
            AssetCategory.category_code == data.get('category_code')
        )
    ).first()

    if existing:
        return jsonify({"error": "Category name or code already exists"}), 400

    try:
        category = AssetCategory(
            name=data.get('name'),
            category_code=data.get('category_code'),
            description=data.get('description')
        )

        db.session.add(category)
        db.session.commit()

        return jsonify(category.to_dict()), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


# -------------------------
# GET All Categories (WITH LIVE SEARCH)
# -------------------------
@category_bp.route('/', methods=['GET'])
def get_categories():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    search = request.args.get('search', '', type=str)

    query = AssetCategory.query

    # ✅ LIVE SEARCH FIX
    if search:
        query = query.filter(
            or_(
                AssetCategory.name.ilike(f"%{search}%"),
                AssetCategory.category_code.ilike(f"%{search}%"),
                AssetCategory.description.ilike(f"%{search}%")
            )
        )

    categories = query.paginate(
        page=page,
        per_page=per_page,
        error_out=False
    )

    return jsonify({
        "total": categories.total,
        "pages": categories.pages,
        "current_page": categories.page,
        "data": [c.to_dict() for c in categories.items]
    })


# -------------------------
# GET Single Category
# -------------------------
@category_bp.route('/<int:id>', methods=['GET'])
def get_category(id):
    category = AssetCategory.query.get_or_404(id)
    return jsonify(category.to_dict())


# -------------------------
# UPDATE Category
# -------------------------
@category_bp.route('/<int:id>', methods=['PUT'])
def update_category(id):
    category = AssetCategory.query.get_or_404(id)
    data = request.get_json()

    if not data:
        return jsonify({"error": "No input data provided"}), 400

    if data.get('name') or data.get('category_code'):
        existing = AssetCategory.query.filter(
            or_(
                AssetCategory.name == data.get('name'),
                AssetCategory.category_code == data.get('category_code')
            ),
            AssetCategory.id != id
        ).first()

        if existing:
            return jsonify({"error": "Category name or code already exists"}), 400

    try:
        category.name = data.get('name', category.name)
        category.category_code = data.get('category_code', category.category_code)
        category.description = data.get('description', category.description)

        db.session.commit()

        return jsonify(category.to_dict())

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


# -------------------------
# DELETE Category
# -------------------------
@category_bp.route('/<int:id>', methods=['DELETE'])
def delete_category(id):
    category = AssetCategory.query.get_or_404(id)

    try:
        db.session.delete(category)
        db.session.commit()

        return jsonify({"message": "Category deleted successfully"})

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500