from app import db

class Department(db.Model):
    __tablename__ = 'departments'

    # Primary key
    id = db.Column(db.Integer, primary_key=True)

    # Department name (e.g., IT, HR, Finance)
    name = db.Column(db.String(150), nullable=False, unique=True)

    # Unique department code (stored in uppercase)
    department_code = db.Column(db.String(50), nullable=False, unique=True)

    # Optional description
    description = db.Column(db.String(255))

    # Optional location of the department
    location = db.Column(db.String(150))

    def __init__(self, name, department_code, description=None, location=None):
        self.name = name
        self.department_code = department_code.upper() if department_code else None
        self.description = description
        self.location = location

    def __repr__(self):
        return f"<Department {self.name} ({self.department_code})>"