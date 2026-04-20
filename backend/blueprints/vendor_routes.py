from flask import Blueprint, request, jsonify
from extensions import db
from models.vendor import Vendor
from sqlalchemy.exc import IntegrityError
from services.vendor_service import generate_vendor_code

vendor_bp = Blueprint('vendor_bp', __name__)


# =========================
# CREATE VENDOR (CLEAN FIXED)
# =========================
@vendor_bp.route('/', methods=['POST'])
def create_vendor():
    try:
        data = request.get_json()

        if not data or not data.get('name'):
            return jsonify({"error": "name is required"}), 400

        # normalize email
        email = data.get('email')
        if email:
            email = email.lower()

            if Vendor.query.filter_by(email=email).first():
                return jsonify({"error": "Email already exists"}), 400

        # generate unique vendor code
        vendor_code = None
        for _ in range(3):
            code = generate_vendor_code(data['name'])
            if not Vendor.query.filter_by(vendor_code=code).first():
                vendor_code = code
                break

        if not vendor_code:
            return jsonify({"error": "Failed to generate vendor code"}), 500

        vendor = Vendor(
            name=data['name'],
            vendor_code=vendor_code,
            status=data.get('status', 'active'),
            contact_person=data.get('contact_person'),
            email=email,
            phone=data.get('phone'),
            postal_address=data.get('postal_address'),
            physical_address=data.get('physical_address'),
            payment_terms=data.get('payment_terms'),
            description=data.get('description'),
            bank_name=data.get('bank_name'),
            bank_account_number=data.get('bank_account_number'),
            bank_branch=data.get('bank_branch')
        )

        db.session.add(vendor)
        db.session.commit()

        return jsonify(vendor.to_dict()), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


# =========================
# GET ALL VENDORS (FIXED FOR DROPDOWN)
# =========================
@vendor_bp.route('/', methods=['GET'])
def get_vendors():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 100, type=int)
    search = request.args.get('search', '')

    query = Vendor.query

    if search:
        query = query.filter(
            Vendor.name.ilike(f"%{search}%") |
            Vendor.email.ilike(f"%{search}%") |
            Vendor.vendor_code.ilike(f"%{search}%")
        )

    pagination = query.order_by(Vendor.id.desc()).paginate(
        page=page,
        per_page=per_page,
        error_out=False
    )

    return jsonify({
        "total": pagination.total,
        "pages": pagination.pages,
        "current_page": pagination.page,
        "data": [v.to_dict() for v in pagination.items]
    })


# =========================
# GET SINGLE
# =========================
@vendor_bp.route('/<int:id>', methods=['GET'])
def get_vendor(id):
    vendor = Vendor.query.get_or_404(id)
    return jsonify(vendor.to_dict())


# =========================
# UPDATE VENDOR (SAFE)
# =========================
@vendor_bp.route('/<int:id>', methods=['PUT'])
def update_vendor(id):
    try:
        vendor = Vendor.query.get_or_404(id)
        data = request.get_json()

        if not data:
            return jsonify({"error": "No input data provided"}), 400

        if 'vendor_code' in data:
            return jsonify({"error": "vendor_code cannot be updated"}), 400

        # email uniqueness check
        if data.get('email'):
            email = data['email'].lower()

            existing = Vendor.query.filter(
                Vendor.email == email,
                Vendor.id != id
            ).first()

            if existing:
                return jsonify({"error": "Email already exists"}), 400

            vendor.email = email

        # update fields
        fields = [
            "name", "status", "contact_person",
            "phone", "postal_address", "physical_address",
            "payment_terms", "description",
            "bank_name", "bank_account_number", "bank_branch"
        ]

        for field in fields:
            if field in data:
                setattr(vendor, field, data[field])

        db.session.commit()

        return jsonify(vendor.to_dict())

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


# =========================
# DELETE
# =========================
@vendor_bp.route('/<int:id>', methods=['DELETE'])
def delete_vendor(id):
    try:
        vendor = Vendor.query.get_or_404(id)

        db.session.delete(vendor)
        db.session.commit()

        return jsonify({"message": "Vendor deleted successfully"})

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500