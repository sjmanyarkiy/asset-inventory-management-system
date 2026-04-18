from datetime import datetime
from extensions import db


class RepairRequest(db.Model):
    """Repair request model - for requesting repairs on assigned assets"""
    __tablename__ = 'repair_requests'

    id = db.Column(db.Integer, primary_key=True)
    
    # Requester info
    requested_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    requested_user = db.relationship('User', foreign_keys=[requested_by], backref='repair_requests')
    
    # Asset being repaired
    asset_id = db.Column(db.Integer, db.ForeignKey('assets.id'), nullable=False)
    asset = db.relationship('Asset', backref='repair_requests')
    
    # Repair details
    issue_description = db.Column(db.Text, nullable=False)
    urgency = db.Column(db.String(20), default='Medium')  # Low, Medium, High
    department_id = db.Column(db.Integer, db.ForeignKey('departments.id'), nullable=False)
    department = db.relationship('Department', backref='repair_requests')
    
    # Approval workflow
    status = db.Column(db.String(20), default='Pending')  # Pending, Approved, In Progress, Completed, Rejected
    reviewed_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    reviewer = db.relationship('User', foreign_keys=[reviewed_by], backref='reviewed_repair_requests')
    review_notes = db.Column(db.Text, nullable=True)
    reviewed_at = db.Column(db.DateTime, nullable=True)
    
    # Repair completion
    completed_at = db.Column(db.DateTime, nullable=True)
    completion_notes = db.Column(db.Text, nullable=True)
    
    # Meta
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        """Convert to dictionary for JSON response"""
        return {
            'id': self.id,
            'requested_by': self.requested_by,
            'requested_user': {
                'id': self.requested_user.id,
                'first_name': self.requested_user.first_name,
                'last_name': self.requested_user.last_name,
                'email': self.requested_user.email,
                'username': self.requested_user.username
            } if self.requested_user else None,
            'asset_id': self.asset_id,
            'asset': {
                'id': self.asset.id,
                'asset_name': self.asset.asset_name,
                'asset_code': self.asset.asset_code,
            } if self.asset else None,
            'issue_description': self.issue_description,
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
            'completed_at': self.completed_at.isoformat() if self.completed_at else None,
            'completion_notes': self.completion_notes,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }