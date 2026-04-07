from flask import Blueprint, request, jsonify
from app import db
from app.models.asset_type import AssetType
from app.models.asset_category import AssetCategory
from sqlalchemy import or_

type_bp = Blueprint('type_bp', __name__, url_prefix='/types')



# -------------------------
# CREATE Asset Type
# -------------------------
@type_bp.route('/', methods=['POST'])
def create_asset_type():
    data = request.get_json()

    if not data:
        return jsonify({"error": "No input data provided"}), 400

    name = data.get('name')
    type_code = data.get('type_code')
    category_id = data.get('category_id')

    if not name or not type_code or not category_id:
        return jsonify({"error": "name, type_code, and category_id are required"}), 400

    category = AssetCategory.query.get(category_id)
    if not category:
        return jsonify({"error": "Invalid category_id"}), 400

    existing_code = AssetType.query.filter_by(type_code=type_code).first()
    if existing_code:
        return jsonify({"error": "type_code already exists"}), 400

    existing_name = AssetType.query.filter_by(
        name=name,
        category_id=category_id
    ).first()

    if existing_name:
        return jsonify({"error": "Asset type already exists in this category"}), 400

    try:
        asset_type = AssetType(
            name=name,
            type_code=type_code,
            description=data.get('description'),
            category_id=category_id
        )

        db.session.add(asset_type)
        db.session.commit()

        return jsonify(asset_type.to_dict()), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


# -------------------------
# GET All Asset Types (pagination)
# -------------------------
@type_bp.route('/', methods=['GET'])
def get_asset_types():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)

    types = AssetType.query.paginate(
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


# -------------------------
# GET Single Asset Type
# -------------------------
@type_bp.route('/<int:id>', methods=['GET'])
def get_asset_type(id):
    asset_type = AssetType.query.get_or_404(id)
    return jsonify(asset_type.to_dict())


# -------------------------
# UPDATE Asset Type
# -------------------------
@type_bp.route('/<int:id>', methods=['PUT'])
def update_asset_type(id):
    asset_type = AssetType.query.get_or_404(id)
    data = request.get_json()

    if not data:
        return jsonify({"error": "No input data provided"}), 400

    name = data.get('name', asset_type.name)
    type_code = data.get('type_code', asset_type.type_code)
    category_id = data.get('category_id', asset_type.category_id)

    if category_id:
        category = AssetCategory.query.get(category_id)
        if not category:
            return jsonify({"error": "Invalid category_id"}), 400

    if type_code:
        existing_code = AssetType.query.filter(
            AssetType.type_code == type_code,
            AssetType.id != id
        ).first()

        if existing_code:
            return jsonify({"error": "type_code already exists"}), 400

    existing_name = AssetType.query.filter(
        AssetType.name == name,
        AssetType.category_id == category_id,
        AssetType.id != id
    ).first()

    if existing_name:
        return jsonify({"error": "Asset type already exists in this category"}), 400

    try:
        asset_type.name = name
        asset_type.type_code = type_code
        asset_type.category_id = category_id
        asset_type.description = data.get('description', asset_type.description)

        db.session.commit()

        return jsonify(asset_type.to_dict())

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


# -------------------------
# DELETE Asset Type
# -------------------------
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


# -------------------------
# SEARCH Asset Types
# -------------------------
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


# -------------------------
# GET Types by Category
# -------------------------
@type_bp.route('/category/<int:category_id>', methods=['GET'])
def get_types_by_category(category_id):
    types = AssetType.query.filter_by(category_id=category_id).all()
    return jsonify([t.to_dict() for t in types])
