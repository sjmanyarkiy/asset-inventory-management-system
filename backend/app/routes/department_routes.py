from flask import Blueprint, request, jsonify
from app import db
from app.models.departments import Department
from sqlalchemy import or_

department_bp = Blueprint('department_bp', __name__, url_prefix='/departments')


# -------------------------
# CREATE Department
# -------------------------
@department_bp.route('/', methods=['POST'])
def create_department():
    data = request.get_json()

    if not data:
        return jsonify({"error": "No input data provided"}), 400

    if not data.get('name') or not data.get('department_code'):
        return jsonify({"error": "name and department_code are required"}), 400

    existing = Department.query.filter(
        or_(
            Department.name == data.get('name'),
            Department.department_code == data.get('department_code')
        )
    ).first()

    if existing:
        return jsonify({"error": "Department name or code already exists"}), 400

    try:
        department = Department(
            name=data.get('name'),
            department_code=data.get('department_code'),
            description=data.get('description'),
            location=data.get('location')
        )

        db.session.add(department)
        db.session.commit()

        return jsonify(department.to_dict()), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


# -------------------------
# GET All Departments (WITH SEARCH + PAGINATION) ✅ FIXED
# -------------------------
@department_bp.route('/', methods=['GET'])
def get_departments():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    search = request.args.get('search', '', type=str)

    query = Department.query

    # ✅ SEARCH LOGIC (MAIN FIX)
    if search:
        query = query.filter(
            or_(
                Department.name.ilike(f"%{search}%"),
                Department.department_code.ilike(f"%{search}%"),
                Department.location.ilike(f"%{search}%")
            )
        )

    departments = query.paginate(
        page=page,
        per_page=per_page,
        error_out=False
    )

    return jsonify({
        "total": departments.total,
        "pages": departments.pages,
        "current_page": departments.page,
        "data": [d.to_dict() for d in departments.items]
    })


# -------------------------
# GET Single Department
# -------------------------
@department_bp.route('/<int:id>', methods=['GET'])
def get_department(id):
    department = Department.query.get_or_404(id)
    return jsonify(department.to_dict())


# -------------------------
# UPDATE Department
# -------------------------
@department_bp.route('/<int:id>', methods=['PUT'])
def update_department(id):
    department = Department.query.get_or_404(id)
    data = request.get_json()

    if not data:
        return jsonify({"error": "No input data provided"}), 400

    if data.get('name') or data.get('department_code'):
        existing = Department.query.filter(
            or_(
                Department.name == data.get('name'),
                Department.department_code == data.get('department_code')
            ),
            Department.id != id
        ).first()

        if existing:
            return jsonify({"error": "Department name or code already exists"}), 400

    try:
        department.name = data.get('name', department.name)
        department.department_code = data.get('department_code', department.department_code)
        department.description = data.get('description', department.description)
        department.location = data.get('location', department.location)

        db.session.commit()

        return jsonify(department.to_dict())

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


# -------------------------
# DELETE Department
# -------------------------
@department_bp.route('/<int:id>', methods=['DELETE'])
def delete_department(id):
    department = Department.query.get_or_404(id)

    try:
        db.session.delete(department)
        db.session.commit()

        return jsonify({"message": "Department deleted successfully"})

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500