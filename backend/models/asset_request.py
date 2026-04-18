from datetime import datetime
from extensions import db


class AssetRequest(db.Model):
    """Asset request model - for requesting new assets"""
    __tablename__ = 'asset_requests'

    id = db.Column(db.Integer, primary_key=True)
    
    # Requester info
    requested_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    requester = db.relationship('User', foreign_keys=[requested_by], backref='asset_requests')
    
    # Request details
    asset_type_id = db.Column(db.Integer, db.ForeignKey('asset_types.id'), nullable=False)
    asset_type = db.relationship('AssetType', backref='requested_assets')
    
    quantity = db.Column(db.Integer, default=1, nullable=False)
    reason = db.Column(db.Text, nullable=False)
    urgency = db.Column(db.String(20), default='Medium')  # Low, Medium, High
    department_id = db.Column(db.Integer, db.ForeignKey('departments.id'), nullable=False)
    department = db.relationship('Department', backref='asset_requests')
    
    # Approval workflow
    status = db.Column(db.String(20), default='Pending')  # Pending, Approved, Rejected
    reviewed_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    reviewer = db.relationship('User', foreign_keys=[reviewed_by], backref='reviewed_asset_requests')
    review_notes = db.Column(db.Text, nullable=True)
    reviewed_at = db.Column(db.DateTime, nullable=True)
    
    # Meta
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        """Convert to dictionary for JSON response"""
        return {
            'id': self.id,
            'requested_by': self.requested_by,
            'requester': {
                'id': self.requester.id,
                'first_name': self.requester.first_name,
                'last_name': self.requester.last_name,
                'email': self.requester.email,
                'username': self.requester.username
            } if self.requester else None,
            'asset_type_id': self.asset_type_id,
            'asset_type': {
                'id': self.asset_type.id,
                'name': self.asset_type.name,
                'description': self.asset_type.description
            } if self.asset_type else None,
            'quantity': self.quantity,
            'reason': self.reason,
            'urgency': self.urgency,
            'department_id': self.department_id,
            'department': {
                'id': self.department.id,
                'name': self.department.name,
                'code': self.department.code
            } if self.department else None,
            'status': self.status,
            'reviewed_by': self.reviewed_by,
            'reviewer': {
                'id': self.reviewer.id,
                'first_name': self.reviewer.first_name,
                'last_name': self.reviewer.last_name,
                'email': self.reviewer.email
            } if self.reviewer else None,
            'review_notes': self.review_notes,
            'reviewed_at': self.reviewed_at.isoformat() if self.reviewed_at else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }