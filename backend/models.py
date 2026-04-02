from datetime import datetime
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()


class User(db.Model):
    __tablename__ = "users"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False)
    role = db.Column(db.String(50), nullable=False)  # ADMIN, PROCUREMENT, EMPLOYEE
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class Asset(db.Model):
    __tablename__ = "assets"
    id = db.Column(db.Integer, primary_key=True)
    barcode = db.Column(db.String(128), unique=True, nullable=False)
    tag = db.Column(db.String(128), nullable=True)
    name = db.Column(db.String(255), nullable=False)
    category = db.Column(db.String(128), nullable=True)
    location = db.Column(db.String(128), nullable=True)
    status = db.Column(db.String(50), default="available")
    image_url = db.Column(db.String(512), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


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
