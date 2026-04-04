from app import db

class Asset(db.Model):
    __tablename__ = 'assets'

    # Primary key: unique identifier for each asset
    id = db.Column(db.Integer, primary_key=True)

    # Human-readable name of the asset
    name = db.Column(db.String(255), nullable=False)

    # Unique code for the asset (can be auto-generated later)
    asset_code = db.Column(db.String(100), unique=True)

    # Status of the asset (e.g., available, assigned, maintenance)
    status = db.Column(db.String(50), default='available')

    # -----------------------------
    # Foreign Keys (Database Links)
    # -----------------------------

    # Links asset to a category (e.g., Electronics, Furniture)
    category_id = db.Column(db.Integer, db.ForeignKey('asset_categories.id'), nullable=False)

    # Links asset to a specific type within a category (e.g., Laptop, Chair)
    type_id = db.Column(db.Integer, db.ForeignKey('asset_types.id'), nullable=False)

    # Links asset to a vendor (supplier of the asset)
    vendor_id = db.Column(db.Integer, db.ForeignKey('vendors.id'))

    # Links asset to a department (ownership or usage department)
    department_id = db.Column(db.Integer, db.ForeignKey('departments.id'))

    # Optional detailed description of the asset
    description = db.Column(db.Text)

    # -----------------------------
    # Relationships (ORM Access)
    # -----------------------------

    # Allows access to category details via: asset.category
    category = db.relationship('AssetCategory', backref='assets', lazy=True)

    # Allows access to type details via: asset.type
    type = db.relationship('AssetType', backref='assets', lazy=True)

    # Allows access to vendor details via: asset.vendor
    vendor = db.relationship('Vendor', backref='assets', lazy=True)

    # Allows access to department details via: asset.department
    department = db.relationship('Department', backref='assets', lazy=True)

    # String representation (useful for debugging and logs)
    def __repr__(self):
        return f"<Asset {self.name}>"