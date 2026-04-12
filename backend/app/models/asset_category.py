from app import db
from sqlalchemy.orm import validates


class AssetCategory(db.Model):
    __tablename__ = 'asset_categories'

    id = db.Column(db.Integer, primary_key=True)

    name = db.Column(db.String(100), nullable=False, unique=True, index=True)
    category_code = db.Column(db.String(50), nullable=False, unique=True, index=True)

    description = db.Column(db.String(255))

    created_at = db.Column(db.DateTime, server_default=db.func.now())
    updated_at = db.Column(db.DateTime, onupdate=db.func.now())

    assets = db.relationship("Asset", back_populates="category")
    types = db.relationship("AssetType", back_populates="category", cascade="all, delete-orphan")

    @validates('category_code')
    def validate_code(self, key, value):
        if not value:
            raise ValueError("Category code is required")
        return value.strip().upper()

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "category_code": self.category_code,
            "description": self.description,
            "created_at": self.created_at
        }

    def __repr__(self):
        return f"<AssetCategory {self.name}>"