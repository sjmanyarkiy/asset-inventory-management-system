from datetime import datetime
from extensions import db


class Vendor(db.Model):
    """Vendor model - represents suppliers and vendors for assets"""
    __tablename__ = 'vendors'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), unique=True, nullable=False, index=True)
    vendor_code = db.Column(db.String(50), unique=True, nullable=False)
    email = db.Column(db.String(120))
    phone = db.Column(db.String(20))
    contact_person = db.Column(db.String(120))
    address = db.Column(db.Text)
    city = db.Column(db.String(80))
    country = db.Column(db.String(80))
    status = db.Column(db.String(20), default='active')  # active, inactive
    payment_terms = db.Column(db.String(100))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    assets = db.relationship('Asset', backref='vendor', lazy=True)

    def to_dict(self):
        """Convert to dictionary for JSON response"""
        return {
            'id': self.id,
            'name': self.name,
            'vendor_code': self.vendor_code,
            'email': self.email,
            'phone': self.phone,
            'contact_person': self.contact_person,
            'address': self.address,
            'city': self.city,
            'country': self.country,
            'status': self.status,
            'payment_terms': self.payment_terms,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }