from app import db
from sqlalchemy.orm import validates


class Asset(db.Model):
    __tablename__ = 'assets'

    id = db.Column(db.Integer, primary_key=True)

    # =========================
    # CORE FIELDS
    # =========================
    name = db.Column(db.String(255), nullable=False, index=True)

    asset_code = db.Column(db.String(100), unique=True, index=True)
    barcode = db.Column(db.String(100), unique=True, nullable=False, index=True)

    status = db.Column(
        db.Enum('available', 'assigned', 'under_repair', 'retired', name='asset_status'),
        default='available',
        nullable=False
    )

    description = db.Column(db.Text)

    # =========================
    # IMAGE
    # =========================
    image_url = db.Column(db.String(255), nullable=True)
    image_file = db.Column(db.String(255), nullable=True)

    # =========================
    # FOREIGN KEYS (MUST STAY)
    # =========================
    category_id = db.Column(db.Integer, db.ForeignKey('asset_categories.id'), nullable=False)
    asset_type_id = db.Column(db.Integer, db.ForeignKey('asset_types.id'), nullable=False)
    vendor_id = db.Column(db.Integer, db.ForeignKey('vendors.id'), nullable=True)
    department_id = db.Column(db.Integer, db.ForeignKey('departments.id'), nullable=True)

    # =========================
    # AUDIT
    # =========================
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    updated_at = db.Column(db.DateTime, onupdate=db.func.now())

    # =========================
    # RELATIONSHIPS
    # =========================
    category = db.relationship('AssetCategory', back_populates='assets')
    asset_type = db.relationship('AssetType', back_populates='assets')
    vendor = db.relationship('Vendor', back_populates='assets')
    department = db.relationship('Department', back_populates='assets')

    # =========================
    # VALIDATION
    # =========================
    @validates('name')
    def validate_name(self, key, value):
        if not value:
            raise ValueError("Asset name is required")
        return value.strip()

    @validates('barcode')
    def validate_barcode(self, key, value):
        if not value:
            raise ValueError("Barcode is required")
        return value.strip()

    @validates('asset_code')
    def validate_asset_code(self, key, value):
        return value.strip().upper() if value else value

    # =========================
    # SERIALIZER (FRONTEND SAFE)
    # =========================
    def to_dict(self):
        return {
            # -------------------------
            # IDENTIFIERS (NEVER REMOVE)
            # -------------------------
            "id": self.id,
            "asset_code": self.asset_code,
            "barcode": self.barcode,

            # -------------------------
            # CORE DATA
            # -------------------------
            "name": self.name,
            "status": self.status,
            "description": self.description,

            # -------------------------
            # IMAGE
            # -------------------------
            "image_url": self.image_url,
            "image_file": self.image_file,

            # -------------------------
            # IDS (FOR FORMS ONLY)
            # -------------------------
            "category_id": self.category_id,
            "asset_type_id": self.asset_type_id,
            "vendor_id": self.vendor_id,
            "department_id": self.department_id,

            # -------------------------
            # DISPLAY VALUES (UI ONLY)
            # -------------------------
            "category": self.category.name if self.category else "Unassigned",
            "asset_type": self.asset_type.name if self.asset_type else "Unassigned",
            "vendor": self.vendor.name if self.vendor else "Unassigned",
            "department": self.department.name if self.department else "Unassigned",

            # -------------------------
            # TIMESTAMPS
            # -------------------------
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }

    def __repr__(self):
        return f"<Asset {self.name}>"