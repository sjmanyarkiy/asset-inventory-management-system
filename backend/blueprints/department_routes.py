from flask import Blueprint, request, jsonify
from extensions import db
from models.department import Department
from sqlalchemy import or_

# from app.services.safe_delete_service import check_safe_delete

department_bp = Blueprint('department_bp', __name__)


# =========================
# CREATE DEPARTMENT
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
            name=data['name'].strip(),
            department_code=data['department_code'].strip().upper(),
            description=data.get('description'),
            location=data.get('location')
        )

        db.session.add(dept)
        db.session.commit()

        return jsonify({
            "message": "Department created successfully",
            "data": dept.to_dict()
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({
            "error": "Department creation failed",
            "details": str(e)
        }), 500


# =========================
# GET ALL DEPARTMENTS
# =========================
@department_bp.route('', methods=['GET'])
def get_departments():
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

    departments = query.order_by(Department.id.desc()).all()

    return jsonify({
        "data": [d.to_dict() for d in departments]
    })


# =========================
# GET SINGLE DEPARTMENT
# =========================
@department_bp.route('/<int:id>', methods=['GET'])
def get_department(id):
    dept = Department.query.get_or_404(id)
    return jsonify(dept.to_dict())


# =========================
# UPDATE DEPARTMENT
# =========================
@department_bp.route('/<int:id>', methods=['PUT'])
def update_department(id):
    try:
        dept = Department.query.get_or_404(id)
        data = request.get_json()

        if not data:
            return jsonify({"error": "No input data"}), 400

        existing = Department.query.filter(
            Department.id != id,
            or_(
                Department.name == data.get('name'),
                Department.department_code == data.get('department_code')
            )
        ).first()

        if existing:
            return jsonify({"error": "Department already exists"}), 400

        if 'name' in data and data['name']:
            dept.name = data['name'].strip()

        if 'description' in data:
            dept.description = data['description']

        if 'location' in data:
            dept.location = data['location']

        if 'department_code' in data and data['department_code'] != dept.department_code:
            return jsonify({
                "error": "department_code cannot be updated"
            }), 400

        db.session.commit()

        return jsonify({
            "message": "Department updated successfully",
            "data": dept.to_dict()
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({
            "error": "Department update failed",
            "details": str(e)
        }), 500


# =========================
# DELETE DEPARTMENT (GLOBAL SAFE DELETE)
# =========================
@department_bp.route('/<int:id>', methods=['DELETE'])
def delete_department(id):
    try:
        dept = Department.query.get_or_404(id)

        # 🔥 GLOBAL SAFE DELETE CHECK
        safe, msg = check_safe_delete("department", id)

        if not safe:
            return jsonify({
                "error": msg
            }), 400

        db.session.delete(dept)
        db.session.commit()

        return jsonify({
            "message": "Department deleted successfully",
            "id": id
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({
            "error": "Department delete failed",
            "details": str(e)
        }), 500