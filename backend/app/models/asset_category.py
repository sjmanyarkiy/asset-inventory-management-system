from app import db

class AssetCategory(db.Model):
    __tablename__ = 'asset_categories'

    # Primary key: unique identifier for each category
    id = db.Column(db.Integer, primary_key=True)

    # Name of the category (e.g., Electronics, Furniture)
    name = db.Column(db.String(100), nullable=False, unique=True)

    # Unique code for the category (stored in uppercase, e.g., ELEC, FURN)
    category_code = db.Column(db.String(50), nullable=False, unique=True)

    # Optional description explaining what this category includes
    description = db.Column(db.String(255))

    # -----------------------------
    # Relationships (ORM Access)
    # -----------------------------

    # One-to-many relationship:
    # A category can have multiple assets
    # Access via: category.assets
    assets = db.relationship('Asset', backref='category', lazy=True)

    # One-to-many relationship:
    # A category can have multiple asset types
    # Access via: category.types
    types = db.relationship('AssetType', backref='category', lazy=True)

    # -----------------------------
    # Constructor (Initialization)
    # -----------------------------
    def __init__(self, name, category_code, description=None):
        self.name = name

        # Ensure category_code is always stored in uppercase
        self.category_code = category_code.upper() if category_code else None

        self.description = description

    # String representation for debugging and logs
    def __repr__(self):
        return f"<AssetCategory {self.name} ({self.category_code})>"
    