from flask import Blueprint, request, jsonify
from app import db
from app.models.vendors import Vendor

# ✅ Added url_prefix='/vendors'
vendor_bp = Blueprint('vendor_bp', __name__, url_prefix='/vendors')


# -------------------------
# CREATE Vendor
# -------------------------
@vendor_bp.route('/', methods=['POST'])
def create_vendor():
    data = request.get_json()

    if not data:
        return jsonify({"error": "No input data provided"}), 400

    if not data.get('name') or not data.get('vendor_code'):
        return jsonify({"error": "name and vendor_code are required"}), 400

    existing = Vendor.query.filter_by(vendor_code=data.get('vendor_code')).first()
    if existing:
        return jsonify({"error": "Vendor code already exists"}), 400

    if data.get('email'):
        existing_email = Vendor.query.filter_by(email=data.get('email')).first()
        if existing_email:
            return jsonify({"error": "Email already exists"}), 400

    try:
        vendor = Vendor(
            name=data.get('name'),
            vendor_code=data.get('vendor_code'),
            status=data.get('status', 'active'),
            contact_person=data.get('contact_person'),
            email=data.get('email'),
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

    except ValueError as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


# -------------------------
# GET All Vendors (pagination)
# -------------------------
@vendor_bp.route('/', methods=['GET'])
def get_vendors():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)

    vendors = Vendor.query.paginate(page=page, per_page=per_page, error_out=False)

    return jsonify({
        "total": vendors.total,
        "pages": vendors.pages,
        "current_page": vendors.page,
        "data": [v.to_dict() for v in vendors.items]
    })


# -------------------------
# GET Single Vendor
# -------------------------
@vendor_bp.route('/<int:id>', methods=['GET'])
def get_vendor(id):
    vendor = Vendor.query.get_or_404(id)
    return jsonify(vendor.to_dict())


# -------------------------
# UPDATE Vendor
# -------------------------
@vendor_bp.route('/<int:id>', methods=['PUT'])
def update_vendor(id):
    vendor = Vendor.query.get_or_404(id)
    data = request.get_json()

    if not data:
        return jsonify({"error": "No input data provided"}), 400

    if data.get('vendor_code'):
        existing = Vendor.query.filter(
            Vendor.vendor_code == data.get('vendor_code'),
            Vendor.id != id
        ).first()
        if existing:
            return jsonify({"error": "Vendor code already exists"}), 400

    if data.get('email'):
        existing_email = Vendor.query.filter(
            Vendor.email == data.get('email'),
            Vendor.id != id
        ).first()
        if existing_email:
            return jsonify({"error": "Email already exists"}), 400

    try:
        fields = [
            "name", "vendor_code", "status", "contact_person",
            "email", "phone", "postal_address", "physical_address",
            "payment_terms", "description",
            "bank_name", "bank_account_number", "bank_branch"
        ]

        for field in fields:
            if field in data:
                setattr(vendor, field, data[field])

        db.session.commit()

        return jsonify(vendor.to_dict())

    except ValueError as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


# -------------------------
# DELETE Vendor
# -------------------------
@vendor_bp.route('/<int:id>', methods=['DELETE'])
def delete_vendor(id):
    vendor = Vendor.query.get_or_404(id)

    try:
        db.session.delete(vendor)
        db.session.commit()
        return jsonify({"message": "Vendor deleted successfully"})
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


# -------------------------
# SEARCH Vendor
# -------------------------
@vendor_bp.route('/search', methods=['GET'])
def search_vendors():
    query = request.args.get('q', '')

    vendors = Vendor.query.filter(
        Vendor.name.ilike(f"%{query}%")
    ).all()

    return jsonify([v.to_dict() for v in vendors])