from extensions import db


class AssetType(db.Model):
    __tablename__ = "asset_types"

    id = db.Column(db.Integer, primary_key=True)

    name = db.Column(db.String(255), nullable=False, index=True)
    type_code = db.Column(db.String(100), unique=True, index=True)

    description = db.Column(db.Text)

    category_id = db.Column(db.Integer, db.ForeignKey("asset_categories.id"), nullable=False)

    created_at = db.Column(db.DateTime, server_default=db.func.now())
    updated_at = db.Column(db.DateTime, onupdate=db.func.now())

    # RELATIONSHIPS
    category = db.relationship("AssetCategory", back_populates="types")
    assets = db.relationship("Asset", back_populates="asset_type")

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "type_code": self.type_code,
            "category_id": self.category_id,
            "category_name": self.category.name if self.category else None,
            "created_at": self.created_at
        }

    def __repr__(self):
        return f"<AssetType {self.name}>"
    