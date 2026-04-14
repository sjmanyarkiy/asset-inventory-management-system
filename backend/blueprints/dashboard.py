from flask import Blueprint, jsonify
from models.assets import Asset

dashboard_bp = Blueprint("dashboard", __name__)

@dashboard_bp.route("/dashboard/stats")
def stats():
    total = Asset.query.count()
    assigned = Asset.query.filter_by(status="Assigned").count()
    available = Asset.query.filter_by(status="Available").count()
    repair = Asset.query.filter_by(status="Repair").count()

    utilization = (assigned / total * 100) if total else 0

    return jsonify({
        "total_assets": total,
        "assigned": assigned,
        "available": available,
        "repair": repair,
        "utilization_rate": round(utilization, 2)
    })