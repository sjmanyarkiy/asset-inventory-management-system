from datetime import datetime
from extensions import db


class AuditLog(db.Model):
    """Audit log for tracking role changes and admin actions"""
    __tablename__ = 'audit_logs'
    
    id = db.Column(db.Integer, primary_key=True)
    action = db.Column(db.String(100), nullable=False)
    actor_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    target_user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    details = db.Column(db.JSON)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    
    actor = db.relationship('User', foreign_keys=[actor_id], backref='actions_performed')
    target_user = db.relationship('User', foreign_keys=[target_user_id], backref='actions_received')
    
    def to_dict(self):
        """Convert audit log to dictionary"""
        return {
            'id': self.id,
            'action': self.action,
            'actor': self.actor.to_dict() if self.actor else None,
            'target_user': self.target_user.to_dict() if self.target_user else None,
            'details': self.details,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }