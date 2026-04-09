from flask import Blueprint, request, jsonify
from app import db
from app.models.vendors import Vendor
from sqlalchemy.exc import IntegrityError
from app.services.vendor_service import generate_vendor_code

vendor_bp = Blueprint('vendor_bp', __name__, url_prefix='/vendors')


# -------------------------
# CREATE Vendor
# -------------------------
@vendor_bp.route('/', methods=['POST'])
def create_vendor():
    data = request.get_json()

    if not data:
        return jsonify({"error": "No input data provided"}), 400

    if not data.get('name'):
        return jsonify({"error": "name is required"}), 400

    try:
        # Check duplicate email
        if data.get('email'):
            existing_email = Vendor.query.filter_by(
                email=data.get('email').lower()
            ).first()
            if existing_email:
                return jsonify({"error": "Email already exists"}), 400

        # Generate vendor code
        for _ in range(3):
            vendor_code = generate_vendor_code(data.get('name'))
            if not Vendor.query.filter_by(vendor_code=vendor_code).first():
                break
        else:
            return jsonify({"error": "Failed to generate unique vendor code"}), 500

        vendor = Vendor(
            name=data.get('name'),
            vendor_code=vendor_code,
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

        # ✅ IMPORTANT: return full vendor object
        return jsonify(vendor.to_dict()), 201

    except ValueError as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400

    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "Vendor code or email already exists"}), 400

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


# -------------------------
# GET Vendors (pagination + search)
# -------------------------
@vendor_bp.route('/', methods=['GET'])
def get_vendors():
    page = request.args.get('page', 1, type=int)
    per_page = min(request.args.get('per_page', 10, type=int), 100)
    search = request.args.get('search', '', type=str)

    query = Vendor.query

    # ✅ SEARCH SUPPORT
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

    try:
        if 'vendor_code' in data:
            return jsonify({"error": "vendor_code cannot be updated"}), 400

        # Prevent duplicate email
        if data.get('email'):
            existing_email = Vendor.query.filter(
                Vendor.email == data.get('email').lower(),
                Vendor.id != id
            ).first()
            if existing_email:
                return jsonify({"error": "Email already exists"}), 400

        fields = [
            "name", "status", "contact_person",
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

    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "Email already exists"}), 400

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
    