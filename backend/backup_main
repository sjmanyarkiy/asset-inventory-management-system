from dotenv import load_dotenv
load_dotenv()

from flask import Flask, jsonify
from flask_cors import CORS
import os

from app import db
from flask_migrate import Migrate
from app.routes import register_routes


def create_app():
    app = Flask(__name__)

    # =========================
    # 🔥 FIXED CORS CONFIG
    # =========================
    CORS(
        app,
        resources={r"/*": {
            "origins": "http://localhost:5173",
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"]
        }}
    )

    # =========================
    # 🔥 PREVENT TRAILING SLASH REDIRECT ISSUES
    # =========================
    app.url_map.strict_slashes = False

    # =========================
    # DATABASE CONFIG
    # =========================
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    # =========================
    # INIT EXTENSIONS
    # =========================
    db.init_app(app)
    Migrate(app, db)

    # =========================
    # REGISTER ROUTES
    # =========================
    register_routes(app)

    # =========================
    # HEALTH CHECK ROUTE
    # =========================
    @app.route("/")
    def home():
        return jsonify({
            "message": "Backend running with PostgreSQL"
        })

    return app


app = create_app()

if __name__ == "__main__":
    app.run(
        debug=os.getenv("FLASK_DEBUG", "True") == "True",
        host="0.0.0.0",
        port=5000
    )

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

# =========================
# FILE UPLOAD CONFIG
# =========================
UPLOAD_FOLDER = "uploads/assets"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


# =========================
# CREATE ASSET
# =========================
@asset_bp.route('', methods=['POST'])
def create_asset():
    try:
        data = request.form
        file = request.files.get("image_file")

        if not data:
            return jsonify({"error": "No input data provided"}), 400

        if not data.get('name') or not data.get('barcode'):
            return jsonify({"error": "name and barcode are required"}), 400

        # =========================
        # HANDLE FILE UPLOAD
        # =========================
        image_file_path = None

        if file:
            filename = secure_filename(file.filename)
            filepath = os.path.join(UPLOAD_FOLDER, filename)
            file.save(filepath)
            image_file_path = filepath

        # Convert ImmutableMultiDict → dict
        data = dict(data)
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
        return jsonify({"error": str(e)}), 500


# =========================
# GET ALL ASSETS
# =========================
@asset_bp.route('', methods=['GET'])
def get_assets():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)

    query = Asset.query

    # filters
    filters = {
        "category_id": request.args.get('category_id'),
        "asset_type_id": request.args.get('asset_type_id'),
        "vendor_id": request.args.get('vendor_id'),
        "department_id": request.args.get('department_id'),
        "status": request.args.get('status')
    }

    for key, value in filters.items():
        if value:
            query = query.filter(getattr(Asset, key) == value)

    # search
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

        data = request.form
        file = request.files.get("image_file")

        if not data:
            return jsonify({"error": "No input data provided"}), 400

        # =========================
        # HANDLE FILE UPLOAD
        # =========================
        if file:
            filename = secure_filename(file.filename)
            filepath = os.path.join(UPLOAD_FOLDER, filename)
            file.save(filepath)
            asset.image_file = filepath

        # =========================
        # VALIDATIONS
        # =========================
        data = dict(data)

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

        # =========================
        # UPDATE FIELDS
        # =========================
        for field in [
            "name", "asset_code", "barcode", "status",
            "description", "image_url",
            "category_id", "asset_type_id",
            "vendor_id", "department_id"
        ]:
            if field in data:
                setattr(asset, field, data[field])

        db.session.commit()

        return jsonify({
            "message": "Asset updated successfully",
            "data": asset.to_dict()
        })

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


# =========================
# DELETE ASSET
# =========================
@asset_bp.route('/<int:id>', methods=['DELETE'])
def delete_asset(id):
    try:
        asset = db.session.get(Asset, id)

        if not asset:
            return jsonify({"error": "Asset not found"}), 404

        db.session.delete(asset)
        db.session.commit()

        return jsonify({"message": "Asset deleted successfully"})

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500