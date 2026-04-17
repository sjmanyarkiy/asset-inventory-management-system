from flask import Blueprint, jsonify, request
from datetime import datetime

asset_bp = Blueprint("assets", __name__)

# -------------------
# SAMPLE DATA (extended with assignment support)
# -------------------
assets = [
    {"id": 1, "name": "Laptop", "category": "IT", "status": "Assigned", "assigned_to": 2},
    {"id": 2, "name": "Printer", "category": "Office", "status": "Available", "assigned_to": None},
    {"id": 3, "name": "Monitor", "category": "IT", "status": "Repair", "assigned_to": None},
    {"id": 4, "name": "Camera", "category": "Media", "status": "Assigned", "assigned_to": 3},
    {"id": 5, "name": "Projector", "category": "Media", "status": "Available", "assigned_to": None},
]

next_id = len(assets) + 1

VALID_STATUSES = {"Assigned", "Available", "Repair"}


# -------------------
# HELPERS
# -------------------
def find_asset(asset_id):
    return next((a for a in assets if a["id"] == asset_id), None)


def enrich_asset(asset):
    """Make frontend-friendly response"""
    return {
        **asset,
        "assigned_user": asset["assigned_to"],  # frontend compatibility
        "is_assigned": asset["assigned_to"] is not None
    }


# -------------------
# GET /assets
# -------------------
@asset_bp.route("/assets", methods=["GET"])
def get_assets():
    search_query = request.args.get("search", "").lower()
    status_filter = request.args.get("status", "").lower()
    page = int(request.args.get("page", 1))
    per_page = int(request.args.get("per_page", 5))

    filtered = assets

    if search_query:
        filtered = [
            a for a in filtered
            if search_query in a["name"].lower()
            or search_query in a["category"].lower()
        ]

    if status_filter:
        filtered = [
            a for a in filtered
            if a["status"].lower() == status_filter
        ]

    total = len(filtered)
    start = (page - 1) * per_page
    paginated = filtered[start:start + per_page]

    return jsonify({
        "page": page,
        "per_page": per_page,
        "total": total,
        "assets": [enrich_asset(a) for a in paginated]
    })


# -------------------
# GET SINGLE ASSET
# -------------------
@asset_bp.route("/assets/<int:asset_id>", methods=["GET"])
def get_asset(asset_id):
    asset = find_asset(asset_id)
    if not asset:
        return jsonify({"error": "Asset not found"}), 404

    return jsonify(enrich_asset(asset))


# -------------------
# CREATE ASSET
# -------------------
@asset_bp.route("/assets", methods=["POST"])
def create_asset():
    global next_id
    data = request.get_json(silent=True) or {}

    missing = [f for f in ("name", "category", "status") if not data.get(f)]
    if missing:
        return jsonify({"error": f"Missing fields: {', '.join(missing)}"}), 400

    if data["status"] not in VALID_STATUSES:
        return jsonify({"error": f"Invalid status"}), 400

    new_asset = {
        "id": next_id,
        "name": data["name"].strip(),
        "category": data["category"].strip(),
        "status": data["status"],
        "assigned_to": None
    }

    assets.append(new_asset)
    next_id += 1

    return jsonify(enrich_asset(new_asset)), 201


# -------------------
# UPDATE ASSET
# -------------------
@asset_bp.route("/assets/<int:asset_id>", methods=["PUT"])
def update_asset(asset_id):
    asset = find_asset(asset_id)
    if not asset:
        return jsonify({"error": "Asset not found"}), 404

    data = request.get_json(silent=True) or {}

    if "status" in data and data["status"] not in VALID_STATUSES:
        return jsonify({"error": "Invalid status"}), 400

    asset["name"] = (data.get("name") or asset["name"]).strip()
    asset["category"] = (data.get("category") or asset["category"]).strip()
    asset["status"] = data.get("status", asset["status"])

    return jsonify(enrich_asset(asset))


# -------------------
# ASSIGN ASSET (EMPLOYEE)
# -------------------
@asset_bp.route("/assets/<int:asset_id>/assign", methods=["POST"])
def assign_asset(asset_id):
    asset = find_asset(asset_id)
    if not asset:
        return jsonify({"error": "Asset not found"}), 404

    data = request.get_json() or {}
    user_id = data.get("user_id")

    if not user_id:
        return jsonify({"error": "user_id is required"}), 400

    if asset["assigned_to"] is not None:
        return jsonify({"error": "Asset already assigned"}), 400

    asset["assigned_to"] = user_id
    asset["status"] = "Assigned"

    return jsonify({
        "message": "Asset assigned successfully",
        "asset": enrich_asset(asset)
    })


# -------------------
# RETURN / UNASSIGN ASSET
# -------------------
@asset_bp.route("/assets/<int:asset_id>/return", methods=["POST"])
def return_asset(asset_id):
    asset = find_asset(asset_id)
    if not asset:
        return jsonify({"error": "Asset not found"}), 404

    if asset["assigned_to"] is None:
        return jsonify({"error": "Asset is not assigned"}), 400

    asset["assigned_to"] = None
    asset["status"] = "Available"

    return jsonify({
        "message": "Asset returned successfully",
        "asset": enrich_asset(asset)
    })


# -------------------
# DELETE ASSET
# -------------------
@asset_bp.route("/assets/<int:asset_id>", methods=["DELETE"])
def delete_asset(asset_id):
    asset = find_asset(asset_id)
    if not asset:
        return jsonify({"error": "Asset not found"}), 404

    assets.remove(asset)
    return jsonify({"message": "Asset deleted"})


# -------------------
# STATS / DASHBOARD
# -------------------
@asset_bp.route("/assets/stats", methods=["GET"])
def asset_stats():
    by_status = {}
    by_category = {}
    assigned_count = 0

    for a in assets:
        by_status[a["status"]] = by_status.get(a["status"], 0) + 1
        by_category[a["category"]] = by_category.get(a["category"], 0) + 1
        if a["assigned_to"]:
            assigned_count += 1

    return jsonify({
        "total": len(assets),
        "assigned": assigned_count,
        "unassigned": len(assets) - assigned_count,
        "by_status": by_status,
        "by_category": by_category
    })