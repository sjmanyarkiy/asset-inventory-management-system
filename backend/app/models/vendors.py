from app import db
from sqlalchemy.orm import validates
import re


class Vendor(db.Model):
    __tablename__ = 'vendors'

    id = db.Column(db.Integer, primary_key=True)

    name = db.Column(db.String(150), nullable=False, index=True)

    vendor_code = db.Column(
        db.String(50),
        nullable=False,
        unique=True,
        index=True
    )

    status = db.Column(
        db.Enum('active', 'on_hold', 'blacklisted', name='vendor_status'),
        nullable=False,
        default='active',
        server_default='active'
    )

    contact_person = db.Column(db.String(150))
    email = db.Column(db.String(120), unique=True, index=True)
    phone = db.Column(db.String(20))

    postal_address = db.Column(db.String(255))
    physical_address = db.Column(db.String(255))

    bank_name = db.Column(db.String(150))
    bank_account_number = db.Column(db.String(100))
    bank_branch = db.Column(db.String(150))

    payment_terms = db.Column(db.String(100))
    description = db.Column(db.String(255))

    created_at = db.Column(db.DateTime, server_default=db.func.now())
    updated_at = db.Column(db.DateTime, server_default=db.func.now(), onupdate=db.func.now())

    assets = db.relationship('Asset', back_populates='vendor', lazy='select')

    # ---------------- VALIDATIONS ----------------
    @validates('vendor_code')
    def validate_vendor_code(self, key, value):
        if not value:
            raise ValueError("Vendor code is required")
        return value.strip().upper()

    @validates('email')
    def validate_email(self, key, value):
        if value:
            value = value.strip().lower()
            EMAIL_REGEX = re.compile(r"^[^@]+@[^@]+\.[^@]+$")
            if not EMAIL_REGEX.match(value):
                raise ValueError("Invalid email address")
        return value

    # ---------------- SERIALIZER ----------------
    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "vendor_code": self.vendor_code,
            "status": self.status,
            "contact_person": self.contact_person,
            "email": self.email,
            "phone": self.phone,
            "postal_address": self.postal_address,
            "physical_address": self.physical_address,
            "bank_name": self.bank_name,
            "bank_account_number": self.bank_account_number,
            "bank_branch": self.bank_branch,
            "payment_terms": self.payment_terms,
            "description": self.description,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }

    def __repr__(self):
        return f"<Vendor {self.name} ({self.vendor_code})>"