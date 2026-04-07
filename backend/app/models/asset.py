from app import db
from sqlalchemy.orm import validates

class Asset(db.Model):
    __tablename__ = 'assets'

    id = db.Column(db.Integer, primary_key=True)

    name = db.Column(db.String(255), nullable=False, index=True)

    asset_code = db.Column(db.String(100), unique=True, index=True)
    barcode = db.Column(db.String(100), unique=True, nullable=False, index=True)

    status = db.Column(
        db.Enum('available', 'assigned', 'under_repair', 'retired', name='asset_status'),
        default='available',
        nullable=False
    )

    description = db.Column(db.Text)
    image_url = db.Column(db.String(255))

    # Foreign Keys
    category_id = db.Column(db.Integer, db.ForeignKey('asset_categories.id'), nullable=False, index=True)
    asset_type_id = db.Column(db.Integer, db.ForeignKey('asset_types.id'), nullable=False, index=True)
    vendor_id = db.Column(db.Integer, db.ForeignKey('vendors.id'), index=True)
    department_id = db.Column(db.Integer, db.ForeignKey('departments.id'), index=True)

    # Audit Fields
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    updated_at = db.Column(db.DateTime, onupdate=db.func.now())

    # Relationships
    category = db.relationship('AssetCategory', back_populates='assets', lazy='select')
    asset_type = db.relationship('AssetType', back_populates='assets', lazy='select')
    vendor = db.relationship('Vendor', back_populates='assets', lazy='select')
    department = db.relationship('Department', back_populates='assets', lazy='select')

    # Validators
    @validates('asset_code')
    def validate_asset_code(self, key, value):
        return value.strip().upper() if value else value

    @validates('barcode')
    def validate_barcode(self, key, value):
        if not value:
            raise ValueError("Barcode is required")
        return value.strip()

    @validates('name')
    def validate_name(self, key, value):
        if not value:
            raise ValueError("Asset name is required")
        return value.strip()

    # Utility
    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "asset_code": self.asset_code,
            "barcode": self.barcode,
            "status": self.status,
            "description": self.description,
            "image_url": self.image_url,
            "category_id": self.category_id,
            "asset_type_id": self.asset_type_id,
            "vendor_id": self.vendor_id,
            "department_id": self.department_id,
            "created_at": self.created_at
        }

    def __repr__(self):
        return f"<Asset {self.name}>"