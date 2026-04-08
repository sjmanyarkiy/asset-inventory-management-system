from flask import Blueprint, request, jsonify
from app import db
from app.models.asset import Asset
from app.models.asset_category import AssetCategory
from app.models.asset_type import AssetType
from app.models.vendors import Vendor
from app.models.departments import Department
from sqlalchemy import or_

asset_bp = Blueprint('asset_bp', __name__, url_prefix='/assets')


# -------------------------
# CREATE Asset
# -------------------------
@asset_bp.route('/', methods=['POST'])
def create_asset():
    data = request.get_json()

    if not data:
        return jsonify({"error": "No input data provided"}), 400

    required_fields = ['name', 'barcode', 'category_id', 'asset_type_id']
    for field in required_fields:
        if not data.get(field):
            return jsonify({"error": f"{field} is required"}), 400

    if not AssetCategory.query.get(data.get('category_id')):
        return jsonify({"error": "Invalid category_id"}), 400

    if not AssetType.query.get(data.get('asset_type_id')):
        return jsonify({"error": "Invalid asset_type_id"}), 400

    if data.get('vendor_id') and not Vendor.query.get(data.get('vendor_id')):
        return jsonify({"error": "Invalid vendor_id"}), 400

    if data.get('department_id') and not Department.query.get(data.get('department_id')):
        return jsonify({"error": "Invalid department_id"}), 400

    if Asset.query.filter_by(barcode=data.get('barcode')).first():
        return jsonify({"error": "Barcode already exists"}), 400

    if data.get('asset_code') and Asset.query.filter_by(asset_code=data.get('asset_code')).first():
        return jsonify({"error": "Asset code already exists"}), 400

    try:
        asset = Asset(
            name=data.get('name'),
            asset_code=data.get('asset_code'),
            barcode=data.get('barcode'),
            status=data.get('status', 'available'),
            description=data.get('description'),
            image_url=data.get('image_url'),
            category_id=data.get('category_id'),
            asset_type_id=data.get('asset_type_id'),
            vendor_id=data.get('vendor_id'),
            department_id=data.get('department_id')
        )

        db.session.add(asset)
        db.session.commit()

        return jsonify(asset.to_dict()), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


# -------------------------
# GET ALL ASSETS
# -------------------------
@asset_bp.route('/', methods=['GET'])
def get_assets():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)

    query = Asset.query

    category_id = request.args.get('category_id')
    asset_type_id = request.args.get('asset_type_id')
    vendor_id = request.args.get('vendor_id')
    department_id = request.args.get('department_id')
    status = request.args.get('status')
    search = request.args.get('q')

    if category_id:
        query = query.filter_by(category_id=category_id)

    if asset_type_id:
        query = query.filter_by(asset_type_id=asset_type_id)

    if vendor_id:
        query = query.filter_by(vendor_id=vendor_id)

    if department_id:
        query = query.filter_by(department_id=department_id)

    if status:
        query = query.filter_by(status=status)

    if search:
        query = query.filter(
            or_(
                Asset.name.ilike(f"%{search}%"),
                Asset.asset_code.ilike(f"%{search}%"),
                Asset.barcode.ilike(f"%{search}%")
            )
        )

    assets = query.paginate(page=page, per_page=per_page, error_out=False)

    return jsonify({
        "total": assets.total,
        "pages": assets.pages,
        "current_page": assets.page,
        "data": [a.to_dict() for a in assets.items]
    })


# -------------------------
# GET SINGLE ASSET
# -------------------------
@asset_bp.route('/<int:id>', methods=['GET'])
def get_asset(id):
    asset = Asset.query.get_or_404(id)
    return jsonify(asset.to_dict())


# -------------------------
# UPDATE ASSET
# -------------------------
@asset_bp.route('/<int:id>', methods=['PUT'])
def update_asset(id):
    asset = Asset.query.get_or_404(id)
    data = request.get_json()

    if not data:
        return jsonify({"error": "No input data provided"}), 400

    if data.get('category_id') and not AssetCategory.query.get(data.get('category_id')):
        return jsonify({"error": "Invalid category_id"}), 400

    if data.get('asset_type_id') and not AssetType.query.get(data.get('asset_type_id')):
        return jsonify({"error": "Invalid asset_type_id"}), 400

    if data.get('vendor_id') and not Vendor.query.get(data.get('vendor_id')):
        return jsonify({"error": "Invalid vendor_id"}), 400

    if data.get('department_id') and not Department.query.get(data.get('department_id')):
        return jsonify({"error": "Invalid department_id"}), 400

    if data.get('barcode'):
        existing = Asset.query.filter(
            Asset.barcode == data.get('barcode'),
            Asset.id != id
        ).first()
        if existing:
            return jsonify({"error": "Barcode already exists"}), 400

    if data.get('asset_code'):
        existing = Asset.query.filter(
            Asset.asset_code == data.get('asset_code'),
            Asset.id != id
        ).first()
        if existing:
            return jsonify({"error": "Asset code already exists"}), 400

    try:
        asset.name = data.get('name', asset.name)
        asset.asset_code = data.get('asset_code', asset.asset_code)
        asset.barcode = data.get('barcode', asset.barcode)
        asset.status = data.get('status', asset.status)
        asset.description = data.get('description', asset.description)
        asset.image_url = data.get('image_url', asset.image_url)

        asset.category_id = data.get('category_id', asset.category_id)
        asset.asset_type_id = data.get('asset_type_id', asset.asset_type_id)
        asset.vendor_id = data.get('vendor_id', asset.vendor_id)
        asset.department_id = data.get('department_id', asset.department_id)

        db.session.commit()

        return jsonify(asset.to_dict())

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


# -------------------------
# DELETE ASSET
# -------------------------
@asset_bp.route('/<int:id>', methods=['DELETE'])
def delete_asset(id):
    asset = Asset.query.get_or_404(id)

    try:
        db.session.delete(asset)
        db.session.commit()
        return jsonify({"message": "Asset deleted successfully"})
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
    