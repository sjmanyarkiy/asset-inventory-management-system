from flask import Blueprint, request, jsonify
from app import db
from app.models.vendor import Vendor
from sqlalchemy import or_
from app.services.vendor_service import generate_vendor_code
from app.services.safe_delete_service import check_safe_delete

vendor_bp = Blueprint('vendor_bp', __name__, url_prefix='/vendors')


# =========================
# CREATE VENDOR
# =========================
@vendor_bp.route('', methods=['POST'])
def create_vendor():
    try:
        data = request.get_json()

        if not data or not data.get('name'):
            return jsonify({"error": "name is required"}), 400

        name = data['name'].strip()

        email = data.get('email')
        if email:
            email = email.strip().lower()

            existing_email = Vendor.query.filter_by(email=email).first()
            if existing_email:
                return jsonify({"error": "Email already exists"}), 400

        vendor_code = None
        for _ in range(5):
            code = generate_vendor_code(name)
            if not Vendor.query.filter_by(vendor_code=code).first():
                vendor_code = code
                break

        if not vendor_code:
            return jsonify({"error": "Failed to generate vendor code"}), 500

        vendor = Vendor(
            name=name,
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

        return jsonify({
            "message": "Vendor created successfully",
            "data": vendor.to_dict()
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({
            "error": "Vendor creation failed",
            "details": str(e)
        }), 500


# =========================
# GET ALL VENDORS
# =========================
@vendor_bp.route('', methods=['GET'])
def get_vendors():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 100, type=int)
    search = request.args.get('search', '')

    query = Vendor.query

    if search:
        search = f"%{search}%"
        query = query.filter(
            or_(
                Vendor.name.ilike(search),
                Vendor.email.ilike(search),
                Vendor.vendor_code.ilike(search)
            )
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
# GET SINGLE VENDOR
# =========================
@vendor_bp.route('/<int:id>', methods=['GET'])
def get_vendor(id):
    vendor = Vendor.query.get_or_404(id)
    return jsonify(vendor.to_dict())


# =========================
# UPDATE VENDOR (FIXED + SAFE)
# =========================
@vendor_bp.route('/<int:id>', methods=['PUT'])
def update_vendor(id):
    try:
        vendor = Vendor.query.get_or_404(id)
        data = request.get_json()

        if not data:
            return jsonify({"error": "No input data provided"}), 400

        # BLOCK vendor_code change (business rule)
        if "vendor_code" in data:
            return jsonify({"error": "vendor_code cannot be updated"}), 400

        # EMAIL SAFE UPDATE
        if data.get("email"):
            email = data["email"].strip().lower()

            existing = Vendor.query.filter(
                Vendor.email == email,
                Vendor.id != id
            ).first()

            if existing:
                return jsonify({"error": "Email already exists"}), 400

            vendor.email = email

        # SAFE FIELD UPDATE
        allowed_fields = [
            "name", "status", "contact_person",
            "phone", "postal_address", "physical_address",
            "payment_terms", "description",
            "bank_name", "bank_account_number", "bank_branch"
        ]

        for field in allowed_fields:
            if field in data and data[field] is not None:
                setattr(vendor, field, data[field])

        db.session.commit()

        return jsonify({
            "message": "Vendor updated successfully",
            "data": vendor.to_dict()
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({
            "error": "Vendor update failed",
            "details": str(e)
        }), 500


# =========================
# DELETE VENDOR (SAFE DELETE SERVICE)
# =========================
@vendor_bp.route('/<int:id>', methods=['DELETE'])
def delete_vendor(id):
    try:
        vendor = Vendor.query.get_or_404(id)

        # GLOBAL SAFE DELETE CHECK
        safe, msg = check_safe_delete("vendor", id)

        if not safe:
            return jsonify({"error": msg}), 400

        db.session.delete(vendor)
        db.session.commit()

        return jsonify({
            "message": "Vendor deleted successfully",
            "id": id
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({
            "error": "Vendor delete failed",
            "details": str(e)
        }), 500