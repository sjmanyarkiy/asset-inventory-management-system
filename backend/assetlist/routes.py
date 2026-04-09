# assetlist/routes.py
from flask import Blueprint, jsonify, request

asset_bp = Blueprint("assets", __name__)  

# Sample assets
assets = [
    {"id": 1,  "name": "Laptop",     "category": "IT",         "status": "Assigned"},
    {"id": 2,  "name": "Printer",    "category": "Office",     "status": "Available"},
    {"id": 3,  "name": "Monitor",    "category": "IT",         "status": "Repair"},
    {"id": 4,  "name": "Camera",     "category": "Media",      "status": "Assigned"},
    {"id": 5,  "name": "Projector",  "category": "Media",      "status": "Available"},
    {"id": 6,  "name": "Router",     "category": "Networking", "status": "Assigned"},
    {"id": 7,  "name": "Keyboard",   "category": "IT",         "status": "Available"},
    {"id": 8,  "name": "Mouse",      "category": "IT",         "status": "Repair"},
    {"id": 9,  "name": "Desk Phone", "category": "Office",     "status": "Assigned"},
    {"id": 10, "name": "Whiteboard", "category": "Office",     "status": "Available"},
    {"id": 11, "name": "Tablet",     "category": "IT",         "status": "Assigned"},
    {"id": 12, "name": "Speaker",    "category": "Media",      "status": "Repair"},
]

next_id = len(assets) + 1
VALID_STATUSES = {"Assigned", "Available", "Repair"}

def find_asset(asset_id):
    return next((a for a in assets if a["id"] == asset_id), None)


# -------------------
# GET /assets
# -------------------
@asset_bp.route("/assets", methods=["GET"])
def get_assets():
    search_query  = request.args.get("search", "").lower()
    status_filter = request.args.get("status", "").lower()
    page          = int(request.args.get("page", 1))
    per_page      = int(request.args.get("per_page", 5))

    filtered = assets
    if search_query:
        filtered = [a for a in filtered if search_query in a["name"].lower() or search_query in a["category"].lower()]
    if status_filter:
        filtered = [a for a in filtered if a["status"].lower() == status_filter]

    total     = len(filtered)
    start     = (page - 1) * per_page
    paginated = filtered[start: start + per_page]

    return jsonify({"page": page, "per_page": per_page, "total": total, "assets": paginated})


# -------------------
# GET /assets/<id>
# -------------------
@asset_bp.route("/assets/<int:asset_id>", methods=["GET"])
def get_asset(asset_id):
    asset = find_asset(asset_id)
    if asset:
        return jsonify(asset)
    return jsonify({"error": "Asset not found"}), 404


# -------------------
# POST /assets
# -------------------
@asset_bp.route("/assets", methods=["POST"])
def create_asset():
    global next_id
    data = request.get_json(silent=True) or {}

    missing = [f for f in ("name", "category", "status") if not data.get(f)]
    if missing:
        return jsonify({"error": f"Missing fields: {', '.join(missing)}"}), 400
    if data["status"] not in VALID_STATUSES:
        return jsonify({"error": f"status must be one of {sorted(VALID_STATUSES)}"}), 400

    new_asset = {"id": next_id, "name": data["name"].strip(), "category": data["category"].strip(), "status": data["status"]}
    assets.append(new_asset)
    next_id += 1
    return jsonify(new_asset), 201


# -------------------
# PUT /assets/<id>
# -------------------
@asset_bp.route("/assets/<int:asset_id>", methods=["PUT"])
def update_asset(asset_id):
    asset = find_asset(asset_id)
    if not asset:
        return jsonify({"error": "Asset not found"}), 404

    data = request.get_json(silent=True) or {}
    if "status" in data and data["status"] not in VALID_STATUSES:
        return jsonify({"error": f"status must be one of {sorted(VALID_STATUSES)}"}), 400

    asset["name"]     = (data.get("name") or asset["name"]).strip()
    asset["category"] = (data.get("category") or asset["category"]).strip()
    asset["status"]   = data.get("status", asset["status"])
    return jsonify(asset)


# -------------------
# DELETE /assets/<id>
# -------------------
@asset_bp.route("/assets/<int:asset_id>", methods=["DELETE"])
def delete_asset(asset_id):
    asset = find_asset(asset_id)
    if not asset:
        return jsonify({"error": "Asset not found"}), 404
    assets.remove(asset)
    return jsonify({"message": f"Asset {asset_id} deleted successfully"})


# -------------------
# GET /assets/stats
# -------------------
@asset_bp.route("/assets/stats", methods=["GET"])
def asset_stats():
    by_status, by_category = {}, {}
    for a in assets:
        by_status[a["status"]]      = by_status.get(a["status"], 0) + 1
        by_category[a["category"]]  = by_category.get(a["category"], 0) + 1
    return jsonify({"total": len(assets), "by_status": by_status, "by_category": by_category})