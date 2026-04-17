from flask import Blueprint, jsonify
from models.asset import Asset

reports_bp = Blueprint("reports", __name__)

@reports_bp.route("/reports/assigned", methods=["GET"])
def assigned():
    assets = Asset.query.filter_by(status="Assigned").all()
    return jsonify([a.to_dict() for a in assets])


@reports_bp.route("/reports/repaired", methods=["GET"])
def repaired():
    assets = Asset.query.filter_by(status="Repair").all()
    return jsonify([a.to_dict() for a in assets])


@reports_bp.route("/reports/access", methods=["GET"])
def access():
    return jsonify([
        {"user": "demo", "action": "login", "time": "2026-04-14"}
    ])