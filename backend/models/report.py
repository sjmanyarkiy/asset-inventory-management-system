from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from models.asset import Asset

db = SQLAlchemy()


class Assignment(db.Model):
    __tablename__ = "assignments"
    id = db.Column(db.Integer, primary_key=True)
    asset_id = db.Column(db.Integer, db.ForeignKey("assets.id"), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    assigned_at = db.Column(db.DateTime, default=datetime.utcnow)
    returned_at = db.Column(db.DateTime, nullable=True)
    assigned_by = db.Column(db.Integer, nullable=True)
    notes = db.Column(db.Text, nullable=True)


class Repair(db.Model):
    __tablename__ = "repairs"
    id = db.Column(db.Integer, primary_key=True)
    asset_id = db.Column(db.Integer, db.ForeignKey("assets.id"), nullable=False)
    reported_at = db.Column(db.DateTime, default=datetime.utcnow)
    repaired_at = db.Column(db.DateTime, nullable=True)
    technician_id = db.Column(db.Integer, nullable=True)
    description = db.Column(db.Text, nullable=True)
    cost = db.Column(db.Numeric(10, 2), nullable=True)
    status = db.Column(db.String(50), default="pending")


class Access(db.Model):
    __tablename__ = "access"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    asset_id = db.Column(db.Integer, db.ForeignKey("assets.id"), nullable=False)
    access_level = db.Column(db.String(50), default="view")
