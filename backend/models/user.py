from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from extensions import db
import uuid
from datetime import datetime, timedelta


class User(db.Model):
    """User model for authentication"""
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False, index=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    first_name = db.Column(db.String(80), nullable=True)
    last_name = db.Column(db.String(80), nullable=True)
    is_active = db.Column(db.Boolean, default=True)
    role_id = db.Column(db.Integer, db.ForeignKey('roles.id'), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login = db.Column(db.DateTime, nullable=True)
    is_email_verified = db.Column(db.Boolean, default=False)
    email_verification_token = db.Column(db.String(255), unique=True, nullable=True)
    email_verification_expires = db.Column(db.DateTime, nullable=True)
    password_reset_token = db.Column(db.String(255), nullable=True)
    password_reset_expires = db.Column(db.DateTime, nullable=True)

    # Department relationships
    department_id = db.Column(db.Integer, db.ForeignKey('departments.id'), nullable=True)
    department = db.relationship('Department', foreign_keys=[department_id], backref='department_employees')
    
    # Relationships
    role = db.relationship('Role', backref='users')
    
    def set_password(self, password):
        """Hash and set password"""
        if len(password) < 8:
            raise ValueError('Password must be at least 8 characters long')
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        """Verify password against hash"""
        return check_password_hash(self.password_hash, password)
    
    def update_last_login(self):
        """Update last login timestamp"""
        self.last_login = datetime.utcnow()
    
    @property
    def is_admin(self):
        """Check if user is admin"""
        if not self.role:
            return False
        return self.role.hierarchy_level <= 1
    
    def to_dict(self):
        """Convert user to dictionary for JSON response"""
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'first_name': self.first_name or '',
            'last_name': self.last_name or '',
            'full_name': f"{self.first_name or self.username} {self.last_name or ''}".strip(),
            'is_active': self.is_active,
            'role_id': self.role_id,
            'role': self.role.to_dict() if self.role else None,
            'is_admin': self.is_admin,
            'is_email_verified': self.is_email_verified,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'last_login': self.last_login.isoformat() if self.last_login else None
        }
    
    def generate_email_token(self):
        """Generate email verification token (24hr expiry)"""
        self.email_verification_token = str(uuid.uuid4())
        self.email_verification_expires = datetime.utcnow() + timedelta(hours=24)
        db.session.commit()
        return self.email_verification_token
    

    def generate_password_reset_token(self, expires_in=1800):
        """Generate password reset token (valid for 30 minutes)"""
        import uuid
        from datetime import datetime, timedelta
        
        self.password_reset_token = str(uuid.uuid4())
        self.password_reset_expires = datetime.utcnow() + timedelta(seconds=expires_in)

    def check_password_reset_token(self, token):
        """Verify reset token is valid"""
        from datetime import datetime
        
        if not token or not self.password_reset_token:
            return False
        if self.password_reset_expires < datetime.utcnow():
            return False
        return self.password_reset_token == token
    

    def check_password_reset_token(self, token):
        return (
            self.password_reset_token == token and
            self.password_reset_expires and
            self.password_reset_expires > datetime.utcnow()
        )