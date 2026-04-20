from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from models.asset_category import AssetCategory
from models.asset_type import AssetType
from models.vendor import Vendor
from models.department import Department

ref_bp = Blueprint('reference', __name__)

@ref_bp.route('/asset-categories', methods=['GET'])
@jwt_required()
def get_asset_categories():
    cats = AssetCategory.query.all()
    return jsonify({'data': [c.to_dict() for c in cats]})

@ref_bp.route('/asset-types', methods=['GET'])
@jwt_required()
def get_asset_types():
    types = AssetType.query.all()
    return jsonify({'data': [t.to_dict() for t in types]})

@ref_bp.route('/vendors', methods=['GET'])
@jwt_required()
def get_vendors():
    vendors = Vendor.query.all()
    return jsonify({'data': [v.to_dict() for v in vendors]})

@ref_bp.route('/departments', methods=['GET'])
@jwt_required()
def get_departments():
    depts = Department.query.all()
    return jsonify({'data': [d.to_dict() for d in depts]})