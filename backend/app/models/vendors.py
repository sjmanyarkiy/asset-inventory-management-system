from app import db
from sqlalchemy.orm import validates

class Vendor(db.Model):
    __tablename__ = 'vendors'

    id = db.Column(db.Integer, primary_key=True)

    # Core Info
    name = db.Column(db.String(150), nullable=False, index=True)
    vendor_code = db.Column(db.String(50), nullable=False, unique=True, index=True)

    # Controlled status (ENUM)
    status = db.Column(
        db.Enum('active', 'on_hold', 'blacklisted', name='vendor_status'),
        nullable=False,
        default='active'
    )

    # Contact Info
    contact_person = db.Column(db.String(150))
    email = db.Column(db.String(120), unique=True, index=True)
    phone = db.Column(db.String(20))

    # Address Info
    postal_address = db.Column(db.String(255))
    physical_address = db.Column(db.String(255))

    # Banking Info
    bank_name = db.Column(db.String(150))
    bank_account_number = db.Column(db.String(100))
    bank_branch = db.Column(db.String(150))

    # Business Info
    payment_terms = db.Column(db.String(100))
    description = db.Column(db.String(255))

    # Audit Fields
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    updated_at = db.Column(db.DateTime, onupdate=db.func.now())

    # Relationships (FIXED)
    assets = db.relationship(
        'Asset',
        back_populates='vendor',
        lazy=True
    )

    # -------------------------
    # Validators
    # -------------------------
    @validates('vendor_code')
    def validate_vendor_code(self, key, value):
        if not value:
            raise ValueError("Vendor code is required")
        return value.strip().upper()

    @validates('email')
    def validate_email(self, key, value):
        if value and "@" not in value:
            raise ValueError("Invalid email address")
        return value.lower() if value else value

    # -------------------------
    # Utility Methods
    # -------------------------
    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "vendor_code": self.vendor_code,
            "status": self.status,
            "contact_person": self.contact_person,
            "email": self.email,
            "phone": self.phone,
            "payment_terms": self.payment_terms,
            "created_at": self.created_at,
        }

    def __repr__(self):
        return f"<Vendor {self.name} ({self.vendor_code})>"