from flask import Blueprint, request, jsonify
from app import db
from app.models.asset_type import AssetType
from app.models.asset_category import AssetCategory
from sqlalchemy import or_

type_bp = Blueprint('type_bp', __name__, url_prefix='/types')


# =========================
# CREATE ASSET TYPE (FINAL FIXED)
# =========================
@type_bp.route('/', methods=['POST'])
def create_asset_type():
    try:
        data = request.get_json()
        print("🔍 Incoming data:", data)  # DEBUG

        if not data:
            return jsonify({"error": "No input data provided"}), 400

        name = data.get('name')
        type_code = data.get('type_code')
        category_id = data.get('category_id')
        description = data.get('description')

        # 🔥 STRONG VALIDATION
        if not name or not str(name).strip():
            return jsonify({"error": "Name is required"}), 400

        if not type_code or not str(type_code).strip():
            return jsonify({"error": "Type code is required"}), 400

        if not category_id:
            return jsonify({"error": "Category is required"}), 400

        # 🔥 Ensure category_id is INT
        try:
            category_id = int(category_id)
        except:
            return jsonify({"error": "category_id must be a number"}), 400

        # validate category
        category = AssetCategory.query.get(category_id)
        if not category:
            return jsonify({"error": "Invalid category_id"}), 400

        # normalize values
        name = name.strip()
        type_code = type_code.strip().upper()

        # prevent duplicate type_code
        if AssetType.query.filter_by(type_code=type_code).first():
            return jsonify({"error": "type_code already exists"}), 400

        # prevent duplicate name per category
        if AssetType.query.filter_by(name=name, category_id=category_id).first():
            return jsonify({"error": "Asset type already exists in this category"}), 400

        asset_type = AssetType(
            name=name,
            type_code=type_code,
            category_id=category_id,
            description=description
        )

        db.session.add(asset_type)
        db.session.commit()

        print("✅ Created:", asset_type.to_dict())  # DEBUG

        return jsonify(asset_type.to_dict()), 201

    except Exception as e:
        db.session.rollback()
        print("❌ ERROR:", str(e))  # DEBUG
        return jsonify({
            "error": "Failed to create asset type",
            "details": str(e)
        }), 500


# =========================
# GET ALL + LIVE SEARCH + PAGINATION
# =========================
@type_bp.route('/', methods=['GET'])
def get_asset_types():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    search = request.args.get('search', '', type=str)

    query = AssetType.query

    if search:
        query = query.filter(
            or_(
                AssetType.name.ilike(f"%{search}%"),
                AssetType.type_code.ilike(f"%{search}%"),
                AssetType.description.ilike(f"%{search}%")
            )
        )

    types = query.paginate(
        page=page,
        per_page=per_page,
        error_out=False
    )

    return jsonify({
        "total": types.total,
        "pages": types.pages,
        "current_page": types.page,
        "data": [t.to_dict() for t in types.items]
    })


# =========================
# GET SINGLE
# =========================
@type_bp.route('/<int:id>', methods=['GET'])
def get_asset_type(id):
    asset_type = AssetType.query.get_or_404(id)
    return jsonify(asset_type.to_dict())


# =========================
# UPDATE ASSET TYPE
# =========================
@type_bp.route('/<int:id>', methods=['PUT'])
def update_asset_type(id):
    asset_type = AssetType.query.get_or_404(id)
    data = request.get_json()

    if not data:
        return jsonify({"error": "No input data provided"}), 400

    name = data.get('name', asset_type.name)
    type_code = data.get('type_code', asset_type.type_code)
    category_id = data.get('category_id', asset_type.category_id)
    description = data.get('description', asset_type.description)

    category = AssetCategory.query.get(category_id)
    if not category:
        return jsonify({"error": "Invalid category_id"}), 400

    if AssetType.query.filter(
        AssetType.type_code == type_code,
        AssetType.id != id
    ).first():
        return jsonify({"error": "type_code already exists"}), 400

    if AssetType.query.filter(
        AssetType.name == name,
        AssetType.category_id == category_id,
        AssetType.id != id
    ).first():
        return jsonify({"error": "Asset type already exists in this category"}), 400

    try:
        asset_type.name = name
        asset_type.type_code = type_code
        asset_type.category_id = category_id
        asset_type.description = description

        db.session.commit()

        return jsonify(asset_type.to_dict())

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


# =========================
# DELETE
# =========================
@type_bp.route('/<int:id>', methods=['DELETE'])
def delete_asset_type(id):
    asset_type = AssetType.query.get_or_404(id)

    try:
        db.session.delete(asset_type)
        db.session.commit()

        return jsonify({"message": "Asset type deleted successfully"})

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


# =========================
# SEARCH (OPTIONAL)
# =========================
@type_bp.route('/search', methods=['GET'])
def search_asset_types():
    query = request.args.get('q', '')

    types = AssetType.query.filter(
        or_(
            AssetType.name.ilike(f"%{query}%"),
            AssetType.type_code.ilike(f"%{query}%"),
            AssetType.description.ilike(f"%{query}%")
        )
    ).all()

    return jsonify([t.to_dict() for t in types])