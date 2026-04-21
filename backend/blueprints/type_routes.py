from flask import Blueprint, request, jsonify
from extensions import db
from models.asset_type import AssetType

type_bp = Blueprint('type_bp', __name__)


# =========================
# CREATE TYPE
# =========================
@type_bp.route('', methods=['POST'])
def create_asset_type():
    data = request.get_json()

    if not data:
        return jsonify({"error": "No input data provided"}), 400

    name = data.get("name")
    description = data.get("description")

    if not name:
        return jsonify({"error": "name is required"}), 400

    existing = AssetType.query.filter(AssetType.name.ilike(name.strip())).first()

    if existing:
        return jsonify({"error": "Asset type already exists"}), 400

    try:
        asset_type = AssetType(
            name=name.strip(),
            description=description
        )

        db.session.add(asset_type)
        db.session.commit()

        return jsonify(asset_type.to_dict()), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


# =========================
# GET ALL TYPES (FOR DROPDOWN + SEARCH)
# =========================
@type_bp.route('/', methods=['GET'])
def get_asset_types():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 100, type=int)
    search = request.args.get('search', '', type=str)

    query = AssetType.query

    if search:
        query = query.filter(AssetType.name.ilike(f"%{search}%"))

    pagination = query.order_by(AssetType.id.desc()).paginate(
        page=page,
        per_page=per_page,
        error_out=False
    )

    return jsonify({
        "total": pagination.total,
        "pages": pagination.pages,
        "current_page": pagination.page,
        "data": [t.to_dict() for t in pagination.items]
    })


# =========================
# GET SINGLE
# =========================
@type_bp.route('/<int:id>', methods=['GET'])
def get_asset_type(id):
    asset_type = AssetType.query.get_or_404(id)
    return jsonify(asset_type.to_dict())


# =========================
# UPDATE
# =========================
@type_bp.route('/<int:id>', methods=['PUT'])
def update_asset_type(id):
    asset_type = AssetType.query.get_or_404(id)
    data = request.get_json()

    name = data.get("name", asset_type.name)
    description = data.get("description", asset_type.description)

    duplicate = AssetType.query.filter(
        AssetType.id != id,
        AssetType.name.ilike(name.strip())
    ).first()
    if duplicate:
        return jsonify({"error": "Asset type already exists"}), 400

    try:
        asset_type.name = name.strip()
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
        return jsonify({"message": "Asset type deleted"})
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500