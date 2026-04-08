from extensions import db

class AuditLog(db.Model):
    __tablename__ = 'auditlogs'

    id = db.Column(db.Integer, primary_key=True)