from flask import Blueprint, request, jsonify
from extensions import db
from app.models.departments import Department
from sqlalchemy import or_

department_bp = Blueprint('department_bp', __name__, url_prefix='/departments')


# =========================
# CREATE
# =========================
@department_bp.route('', methods=['POST'])
def create_department():
    try:
        data = request.get_json()

        if not data or not data.get('name') or not data.get('department_code'):
            return jsonify({"error": "name and department_code are required"}), 400

        existing = Department.query.filter(
            or_(
                Department.name == data['name'],
                Department.department_code == data['department_code']
            )
        ).first()

        if existing:
            return jsonify({"error": "Department already exists"}), 400

        dept = Department(
            name=data['name'],
            department_code=data['department_code'],
            description=data.get('description'),
            location=data.get('location')
        )

        db.session.add(dept)
        db.session.commit()

        return jsonify(dept.to_dict()), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


# =========================
# GET ALL (FIXED FOR DROPDOWN)
# =========================
@department_bp.route('', methods=['GET'])
def get_departments():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 100, type=int)
    search = request.args.get('search', '')

    query = Department.query

    if search:
        query = query.filter(
            or_(
                Department.name.ilike(f"%{search}%"),
                Department.department_code.ilike(f"%{search}%"),
                Department.location.ilike(f"%{search}%")
            )
        )

    pagination = query.order_by(Department.id.desc()).paginate(
        page=page,
        per_page=per_page,
        error_out=False
    )

    return jsonify({
        "total": pagination.total,
        "pages": pagination.pages,
        "current_page": pagination.page,
        "data": [d.to_dict() for d in pagination.items]
    })


# =========================
# GET SINGLE
# =========================
@department_bp.route('/<int:id>', methods=['GET'])
def get_department(id):
    dept = Department.query.get_or_404(id)
    return jsonify(dept.to_dict())


# =========================
# UPDATE
# =========================
@department_bp.route('/<int:id>', methods=['PUT'])
def update_department(id):
    try:
        dept = Department.query.get_or_404(id)
        data = request.get_json()

        if not data:
            return jsonify({"error": "No input data"}), 400

        if 'department_code' in data:
            return jsonify({"error": "department_code cannot be updated"}), 400

        existing = Department.query.filter(
            Department.id != id,
            or_(
                Department.name == data.get('name'),
                Department.department_code == data.get('department_code')
            )
        ).first()

        if existing:
            return jsonify({"error": "Department already exists"}), 400

        dept.name = data.get('name', dept.name)
        dept.description = data.get('description', dept.description)
        dept.location = data.get('location', dept.location)

        db.session.commit()

        return jsonify(dept.to_dict())

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


# =========================
# DELETE
# =========================
@department_bp.route('/<int:id>', methods=['DELETE'])
def delete_department(id):
    try:
        dept = Department.query.get_or_404(id)
        db.session.delete(dept)
        db.session.commit()

        return jsonify({"message": "Department deleted successfully"})

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500