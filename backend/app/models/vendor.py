from app import db
from sqlalchemy.orm import validates
import re


class Vendor(db.Model):
    __tablename__ = 'vendors'

    id = db.Column(db.Integer, primary_key=True)

    # CORE INFO
    name = db.Column(db.String(150), nullable=False, index=True)
    vendor_code = db.Column(db.String(50), unique=True, nullable=False, index=True)

    status = db.Column(
        db.Enum('active', 'on_hold', 'blacklisted', name='vendor_status'),
        default='active',
        nullable=False
    )

    # CONTACT
    contact_person = db.Column(db.String(150))
    email = db.Column(db.String(120), unique=True, index=True)
    phone = db.Column(db.String(20))

    # ADDRESS
    postal_address = db.Column(db.String(255))
    physical_address = db.Column(db.String(255))

    # BANKING
    bank_name = db.Column(db.String(150))
    bank_account_number = db.Column(db.String(100))
    bank_branch = db.Column(db.String(150))

    payment_terms = db.Column(db.String(100))
    description = db.Column(db.String(255))

    # AUDIT
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    updated_at = db.Column(db.DateTime, onupdate=db.func.now())

    # RELATIONSHIP
    assets = db.relationship("Asset", back_populates="vendor")

    # =========================
    # VALIDATION
    # =========================
    @validates('vendor_code')
    def validate_vendor_code(self, key, value):
        return value.strip().upper() if value else value

    @validates('email')
    def validate_email(self, key, value):
        if value:
            value = value.strip().lower()
            if not re.match(r"^[^@]+@[^@]+\.[^@]+$", value):
                raise ValueError("Invalid email format")
        return value

    # =========================
    # SERIALIZER (FRONTEND SAFE)
    # =========================
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

            "payment_terms": self.payment_terms,
            "description": self.description
        }

    def __repr__(self):
        return f"<Vendor {self.name}>"