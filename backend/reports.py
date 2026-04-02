from flask import Blueprint, request, jsonify, send_file
from flask_jwt_extended import jwt_required, get_jwt_identity
from .models import db, User, Asset, Assignment, Repair, Access
from .auth import requires_roles
from io import StringIO
import csv

bp = Blueprint("reports", __name__, url_prefix="/api/reports")


def _paginate_query(query, page, per_page):
    items = query.limit(per_page).offset((page - 1) * per_page).all()
    return items


@bp.route("/assigned", methods=["GET"])
def get_assigned():
    page = int(request.args.get("page", 1))
    per_page = int(request.args.get("per_page", 20))
    user_id = request.args.get("user_id")
    q = db.session.query(Assignment, Asset).join(Asset, Assignment.asset_id == Asset.id)
    if user_id:
        q = q.filter(Assignment.user_id == int(user_id))

    # Authorization: if requesting other user's assignments, require manager/admin role
    current_uid = None
    try:
        current_uid = get_jwt_identity()
    except Exception:
        current_uid = None

    if user_id and current_uid and int(user_id) != int(current_uid):
        # only allow managers/admins to view other users' assignments
        user = User.query.get(current_uid)
        if not user or user.role not in ("ADMIN", "PROCUREMENT", "FINANCE"):
            return jsonify({"msg": "Forbidden"}), 403

    rows = _paginate_query(q, page, per_page)
    items = []
    for assignment, asset in rows:
        items.append(
            {
                "assignment_id": assignment.id,
                "asset_id": asset.id,
                "asset_tag": asset.tag,
                "asset_name": asset.name,
                "assigned_to": assignment.user_id,
                "assigned_at": assignment.assigned_at.isoformat() if assignment.assigned_at else None,
            }
        )

    return jsonify({"items": items, "total": len(items)})


@bp.route("/access", methods=["GET"])
@jwt_required()
@requires_roles("ADMIN", "PROCUREMENT", "FINANCE")
def get_access():
    page = int(request.args.get("page", 1))
    per_page = int(request.args.get("per_page", 20))
    asset_id = request.args.get("asset_id")

    q = db.session.query(Access, User).join(User, Access.user_id == User.id)
    if asset_id:
        q = q.filter(Access.asset_id == int(asset_id))

    rows = _paginate_query(q, page, per_page)
    items = []
    for access, user in rows:
        items.append({"user_id": user.id, "user_name": user.name, "access_level": access.access_level})

    return jsonify({"items": items, "total": len(items)})


@bp.route("/repaired", methods=["GET"])
@jwt_required()
def get_repaired():
    page = int(request.args.get("page", 1))
    per_page = int(request.args.get("per_page", 20))
    asset_id = request.args.get("asset_id")

    q = db.session.query(Repair).order_by(Repair.reported_at.desc())
    if asset_id:
        q = q.filter(Repair.asset_id == int(asset_id))

    rows = _paginate_query(q, page, per_page)
    items = []
    for r in rows:
        items.append({"repair_id": r.id, "asset_id": r.asset_id, "status": r.status, "reported_at": r.reported_at.isoformat()})

    return jsonify({"items": items, "total": len(items)})


@bp.route("/export", methods=["POST"])
@jwt_required()
def export_report():
    body = request.get_json() or {}
    rtype = body.get("type")
    filters = body.get("filters", {})

    # For this scaffold, only support CSV streaming synchronously for small datasets
    si = StringIO()
    writer = csv.writer(si)

    if rtype == "assigned":
        writer.writerow(["assignment_id", "asset_id", "asset_name", "assigned_to", "assigned_at"])
        q = db.session.query(Assignment, Asset).join(Asset, Assignment.asset_id == Asset.id)
        rows = q.limit(1000).all()
        for assignment, asset in rows:
            writer.writerow([assignment.id, asset.id, asset.name, assignment.user_id, assignment.assigned_at])
    else:
        writer.writerow(["message"])
        writer.writerow(["unsupported type in scaffold"])

    si.seek(0)
    return send_file(
        si,
        mimetype="text/csv",
        as_attachment=True,
        download_name="report.csv",
    )
