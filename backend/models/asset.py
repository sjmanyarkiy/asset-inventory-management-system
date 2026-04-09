from datetime import datetime
from extensions import db


class Asset(db.Model):
    """Asset model for inventory management"""
    __tablename__ = 'assets'
    
    id = db.Column(db.Integer, primary_key=True)
    asset_name = db.Column(db.String(120), nullable=False)
    asset_code = db.Column(db.String(50), unique=True, nullable=False, index=True)
    asset_type = db.Column(db.String(80), nullable=False)
    description = db.Column(db.Text)
    serial_number = db.Column(db.String(100), unique=True, nullable=True)
    purchase_date = db.Column(db.DateTime)
    purchase_price = db.Column(db.Float)
    depreciation_rate = db.Column(db.Float, default=0.0)
    current_value = db.Column(db.Float)
    location = db.Column(db.String(120))
    assigned_to = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    status = db.Column(db.String(50), default='Available')  # Available, In Use, Maintenance, Retired
    condition = db.Column(db.String(50), default='Good')  # Good, Fair, Poor
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    
    assigned_user = db.relationship('User', foreign_keys=[assigned_to], backref='assigned_assets')
    creator = db.relationship('User', foreign_keys=[created_by], backref='created_assets')
    
    def to_dict(self):
        """Convert asset to dictionary"""
        return {
            'id': self.id,
            'asset_name': self.asset_name,
            'asset_code': self.asset_code,
            'asset_type': self.asset_type,
            'description': self.description,
            'serial_number': self.serial_number,
            'purchase_date': self.purchase_date.isoformat() if self.purchase_date else None,
            'purchase_price': self.purchase_price,
            'depreciation_rate': self.depreciation_rate,
            'current_value': self.current_value,
            'location': self.location,
            'assigned_to': self.assigned_to,
            'assigned_user': self.assigned_user.to_dict() if self.assigned_user else None,
            'status': self.status,
            'condition': self.condition,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }