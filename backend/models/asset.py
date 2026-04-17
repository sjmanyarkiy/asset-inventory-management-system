from datetime import datetime
from extensions import db


class Asset(db.Model):
    """Asset model for inventory management system"""
    __tablename__ = 'assets'

    id = db.Column(db.Integer, primary_key=True)

    # Identity
    asset_name = db.Column(db.String(120), nullable=False, index=True)
    asset_code = db.Column(db.String(50), unique=True, nullable=False, index=True)
    asset_type = db.Column(db.String(80), nullable=False)
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
    assigned_user = db.relationship(
        'User',
        foreign_keys=[assigned_to],
        backref='assigned_assets'
    )

    # Lifecycle state
    status = db.Column(
        db.String(50),
        default='Available',
        nullable=False
    )
    condition = db.Column(
        db.String(50),
        default='Good',
        nullable=False
    )

    # Meta
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )

    created_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    creator = db.relationship(
        'User',
        foreign_keys=[created_by],
        backref='created_assets'
    )

    # -----------------------------
    # SERIALIZATION (IMPORTANT)
    # -----------------------------
    def to_dict(self):
        """Safe frontend-friendly serialization"""

        return {
            "id": self.id,
            "asset_name": self.asset_name,
            "asset_code": self.asset_code,
            "asset_type": self.asset_type,
            "description": self.description,

            "serial_number": self.serial_number,
            "location": self.location,

            "purchase_date": self.purchase_date.isoformat() if self.purchase_date else None,
            "purchase_price": self.purchase_price,
            "depreciation_rate": self.depreciation_rate,
            "current_value": self.current_value,

            # CORE FIX: frontend uses this
            "assigned_to": self.assigned_to,

            # IMPORTANT: full user object for UI display
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

    # -----------------------------
    # HELPERS (OPTIONAL BUT USEFUL)
    # -----------------------------

    def is_assigned(self):
        return self.assigned_to is not None

    def assign_to(self, user_id):
        self.assigned_to = user_id
        self.status = "Assigned"
        self.updated_at = datetime.utcnow()

    def unassign(self):
        self.assigned_to = None
        self.status = "Available"
        self.updated_at = datetime.utcnow()