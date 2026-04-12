from app import db


class Department(db.Model):
    __tablename__ = 'departments'

    id = db.Column(db.Integer, primary_key=True)

    name = db.Column(db.String(150), nullable=False, unique=True)
    department_code = db.Column(db.String(50), unique=True, nullable=False, index=True)

    description = db.Column(db.String(255))
    location = db.Column(db.String(150))

    created_at = db.Column(db.DateTime, server_default=db.func.now())
    updated_at = db.Column(db.DateTime, onupdate=db.func.now())

    assets = db.relationship("Asset", back_populates="department")

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "department_code": self.department_code,
            "description": self.description,
            "location": self.location
        }

    def __repr__(self):
        return f"<Department {self.name}>"