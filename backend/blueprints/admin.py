from flask import Blueprint, jsonify, request
from extensions import db
from models.user import User
from models.role import Role

admin_bp = Blueprint("admin", __name__, url_prefix="/api/admin")


# -------------------------
# GET USERS (FULL CONSISTENT DATA)
# -------------------------
@admin_bp.route("/users", methods=["GET"])
def get_users():
    page = int(request.args.get("page", 1))
    per_page = int(request.args.get("per_page", 10))

    search = request.args.get("search", "").strip().lower()
    role_id = request.args.get("role")

    query = User.query

    # -------------------
    # SEARCH FILTER
    # -------------------
    if search:
        query = query.filter(
            db.or_(
                User.username.ilike(f"%{search}%"),
                User.email.ilike(f"%{search}%"),
                User.first_name.ilike(f"%{search}%"),
                User.last_name.ilike(f"%{search}%")
            )
        )

    # -------------------
    # ROLE FILTER
    # -------------------
    if role_id:
        query = query.filter(User.role_id == role_id)

    pagination = query.paginate(page=page, per_page=per_page, error_out=False)

    return jsonify({
        "users": [u.to_dict() for u in pagination.items],
        "total": pagination.total,
        "page": page
    })


# -------------------------
# GET ROLES
# -------------------------
@admin_bp.route("/roles", methods=["GET"])
def get_roles():
    roles = Role.query.all()
    return jsonify([
        {
            "id": r.id,
            "name": r.name,
            "description": r.description,
            "hierarchy_level": r.hierarchy_level
        }
        for r in roles
    ])


# -------------------------
# TOGGLE USER STATUS (PERSISTED)
# -------------------------
@admin_bp.route("/users/<int:user_id>/toggle-status", methods=["PATCH"])
def toggle_user_status(user_id):
    user = User.query.get_or_404(user_id)

    user.is_active = not user.is_active
    db.session.commit()

    return jsonify({
        "message": "User status updated",
        "user": user.to_dict()
    }), 200


# -------------------------
# ASSIGN ROLE (PERSISTED)
# -------------------------
@admin_bp.route("/users/<int:user_id>/assign-role", methods=["POST"])
def assign_role(user_id):
    user = User.query.get_or_404(user_id)

    data = request.get_json() or {}
    role_id = data.get("role_id")

    if not role_id:
        return jsonify({"error": "role_id is required"}), 400

    role = Role.query.get(role_id)
    if not role:
        return jsonify({"error": "Role not found"}), 404

    user.role_id = role.id
    db.session.commit()

    return jsonify({
        "message": "Role updated successfully",
        "user": user.to_dict()
    }), 200