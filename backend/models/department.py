from datetime import datetime
from extensions import db


class Department(db.Model):
    """Department model - represents organizational departments"""
    __tablename__ = 'departments'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), unique=True, nullable=False, index=True)
    code = db.Column(db.String(10), unique=True, nullable=False)
    description = db.Column(db.Text)
    manager_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    # manager = db.relationship('User', foreign_keys=[manager_id], backref='managed_departments')
    # users = db.relationship('User', secondary='user_department', backref='departments')
    manager = db.relationship('User', foreign_keys=[manager_id], backref='managed_departments')
    users = db.relationship('User', secondary='user_department', backref='user_departments')

    def to_dict(self):
        """Convert to dictionary for JSON response"""
        return {
            'id': self.id,
            'name': self.name,
            'code': self.code,
            'description': self.description,
            'manager_id': self.manager_id,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }


# Association table for User-Department many-to-many relationship
user_department = db.Table(
    'user_department',
    db.Column('user_id', db.Integer, db.ForeignKey('users.id'), primary_key=True),
    db.Column('department_id', db.Integer, db.ForeignKey('departments.id'), primary_key=True)
)