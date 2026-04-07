from app import db

class Department(db.Model):
    __tablename__ = 'departments'

    id = db.Column(db.Integer, primary_key=True)

    name = db.Column(db.String(150), nullable=False, unique=True)
    department_code = db.Column(db.String(50), nullable=False, unique=True, index=True)

    description = db.Column(db.String(255))
    location = db.Column(db.String(150))

    created_at = db.Column(db.DateTime, server_default=db.func.now())
    updated_at = db.Column(db.DateTime, onupdate=db.func.now())

    # Relationships
    assets = db.relationship(
        'Asset',
        back_populates='department',
        lazy='select'
    )

    def __init__(self, name, department_code, description=None, location=None):
        self.name = name
        self.department_code = department_code.strip().upper()
        self.description = description
        self.location = location

    def __repr__(self):
        return f"<Department {self.name} ({self.department_code})>"

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "department_code": self.department_code,
            "description": self.description,
            "location": self.location
        }
    