from app import db

class AssetType(db.Model):
    __tablename__ = 'asset_types'

    # Primary key: unique identifier for each asset type
    id = db.Column(db.Integer, primary_key=True)

    # Name of the asset type (e.g., Laptop, Printer, Chair)
    name = db.Column(db.String(100), nullable=False)

    # Unique code for the asset type (stored in uppercase)
    type_code = db.Column(db.String(50), nullable=False, unique=True)

    # Optional description explaining what this type represents
    description = db.Column(db.String(255))

    # Foreign key linking this type to a category (e.g., Electronics, Furniture)
    category_id = db.Column(db.Integer, db.ForeignKey('asset_categories.id'), nullable=False)

    # -----------------------------
    # Relationships (ORM Access)
    # -----------------------------

    # Allows access to all assets of this type via: asset_type.assets
    assets = db.relationship('Asset', backref='type', lazy=True)

    # -----------------------------
    # Constructor (Initialization)
    # -----------------------------
    def __init__(self, name, type_code, category_id, description=None):
        self.name = name

        # Ensure type_code is always stored in uppercase
        self.type_code = type_code.upper() if type_code else None

        self.category_id = category_id
        self.description = description

    # String representation for debugging and logs
    def __repr__(self):
        return f"<AssetType {self.name} ({self.type_code})>"