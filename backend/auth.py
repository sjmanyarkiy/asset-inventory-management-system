from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from .models import db, User

bp = Blueprint("auth", __name__, url_prefix="/api/auth")


@bp.route("/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    email = data.get("email")
    password = data.get("password")
    if not email or not password:
        return jsonify({"msg": "email and password required"}), 400

    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return jsonify({"msg": "Bad credentials"}), 401

    access_token = create_access_token(identity=user.id)
    return jsonify({"access_token": access_token, "user": {"id": user.id, "name": user.name, "role": user.role}})


@bp.route("/register", methods=["POST"])
def register():
    data = request.get_json() or {}
    name = data.get("name")
    email = data.get("email")
    password = data.get("password")
    role = data.get("role", "EMPLOYEE")

    if not name or not email or not password:
        return jsonify({"msg": "name, email, and password required"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"msg": "email already in use"}), 400

    # only allow creating privileged roles if request is authenticated and caller is admin
    caller = None
    try:
        caller_id = get_jwt_identity()
        if caller_id:
            caller = User.query.get(caller_id)
    except Exception:
        caller = None

    if role in ("ADMIN", "PROCUREMENT", "FINANCE") and (caller is None or caller.role != "ADMIN"):
        return jsonify({"msg": "only admins can assign privileged roles"}), 403

    u = User(name=name, email=email, role=role)
    u.set_password(password)
    db.session.add(u)
    db.session.commit()

    return jsonify({"msg": "user created", "user": {"id": u.id, "email": u.email, "role": u.role}}), 201


def requires_roles(*roles):
    def decorator(fn):
        @jwt_required()
        def wrapper(*args, **kwargs):
            uid = get_jwt_identity()
            user = User.query.get(uid)
            if user is None:
                return jsonify({"msg": "User not found"}), 404
            if user.role not in roles:
                return jsonify({"msg": "Forbidden"}), 403
            return fn(*args, **kwargs)

        # preserve name
        wrapper.__name__ = fn.__name__
        return wrapper

    return decorator
