from app import db
from sqlalchemy.orm import validates

class AssetType(db.Model):
    __tablename__ = 'asset_types'

    id = db.Column(db.Integer, primary_key=True)

    name = db.Column(db.String(100), nullable=False, index=True)
    type_code = db.Column(db.String(50), nullable=False, unique=True, index=True)

    description = db.Column(db.String(255))

    category_id = db.Column(
        db.Integer,
        db.ForeignKey('asset_categories.id'),
        nullable=False,
        index=True
    )

    created_at = db.Column(db.DateTime, server_default=db.func.now())
    updated_at = db.Column(db.DateTime, onupdate=db.func.now())

    __table_args__ = (
        db.UniqueConstraint('name', 'category_id', name='unique_type_per_category'),
    )

    # Relationships
    assets = db.relationship(
        'Asset',
        back_populates='asset_type',
        cascade="all, delete-orphan",
        lazy='select'
    )

    category = db.relationship(
        'AssetCategory',
        back_populates='types'
    )

    # Validators
    @validates('type_code')
    def validate_type_code(self, key, value):
        if not value:
            raise ValueError("Type code is required")
        return value.strip().upper()

    # Utility
    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "type_code": self.type_code,
            "category_id": self.category_id,
            "description": self.description,
            "created_at": self.created_at
        }

    def __repr__(self):
        return f"<AssetType {self.name} ({self.type_code})>"
    