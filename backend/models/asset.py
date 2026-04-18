from datetime import datetime
from extensions import db


class Asset(db.Model):
    """Asset model for inventory management system"""
    __tablename__ = 'assets'

    id = db.Column(db.Integer, primary_key=True)

    # Identity & Classification
    asset_name = db.Column(db.String(120), nullable=False, index=True)
    asset_code = db.Column(db.String(50), unique=True, nullable=False, index=True)
    asset_type_id = db.Column(db.Integer, db.ForeignKey('asset_types.id'), nullable=False)
    category_id = db.Column(db.Integer, db.ForeignKey('asset_categories.id'), nullable=True)
    vendor_id = db.Column(db.Integer, db.ForeignKey('vendors.id'), nullable=True)
    department_id = db.Column(db.Integer, db.ForeignKey('departments.id'), nullable=True)
    description = db.Column(db.Text)

    # Tracking
    serial_number = db.Column(db.String(100), unique=True, nullable=True)
    location = db.Column(db.String(120))

    # Financial
    purchase_date = db.Column(db.DateTime)
    purchase_price = db.Column(db.Float)
    depreciation_rate = db.Column(db.Float, default=0.0)
    current_value = db.Column(db.Float)

    # Assignment (CORE FEATURE)
    assigned_to = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    assigned_at = db.Column(db.DateTime, nullable=True)

    # Lifecycle state
    status = db.Column(db.String(50), default='Available', nullable=False)
    condition = db.Column(db.String(50), default='Good', nullable=False)

    # Meta
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'))

    # Relationships (no backrefs - they're defined on the other side)
    assigned_user = db.relationship('User', foreign_keys=[assigned_to], backref='assigned_assets')
    creator = db.relationship('User', foreign_keys=[created_by], backref='created_assets')

    def to_dict(self):
        """Safe frontend-friendly serialization"""
        return {
            "id": self.id,
            "asset_name": self.asset_name,
            "asset_code": self.asset_code,
            "asset_type_id": self.asset_type_id,
            "category_id": self.category_id,
            "vendor_id": self.vendor_id,
            "department_id": self.department_id,
            "description": self.description,
            "serial_number": self.serial_number,
            "location": self.location,
            "purchase_date": self.purchase_date.isoformat() if self.purchase_date else None,
            "purchase_price": self.purchase_price,
            "depreciation_rate": self.depreciation_rate,
            "current_value": self.current_value,
            "assigned_to": self.assigned_to,
            "assigned_at": self.assigned_at.isoformat() if self.assigned_at else None,
            "assigned_user": {
                "id": self.assigned_user.id,
                "first_name": self.assigned_user.first_name,
                "last_name": self.assigned_user.last_name,
                "email": self.assigned_user.email,
                "username": self.assigned_user.username,
            } if self.assigned_user else None,
            "status": self.status,
            "condition": self.condition,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "created_by": self.created_by
        }

    def is_assigned(self):
        return self.assigned_to is not None

    def assign_to(self, user_id):
        self.assigned_to = user_id
        self.status = "Assigned"
        self.assigned_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()

    def unassign(self):
        self.assigned_to = None
        self.status = "Available"
        self.assigned_at = None
        self.updated_at = datetime.utcnow()