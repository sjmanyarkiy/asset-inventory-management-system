from datetime import datetime
from extensions import db
# import barcode
# from barcode.writer import ImageWriter
# import qrcode
from io import BytesIO
import base64
import os


class Asset(db.Model):
    """Asset model for inventory management system"""
    __tablename__ = 'assets'

    id = db.Column(db.Integer, primary_key=True)
    asset_name = db.Column(db.String(120), nullable=False)
    asset_code = db.Column(db.String(50), unique=True, nullable=False, index=True)

    # Identity & Classification
    asset_name = db.Column(db.String(120), nullable=False, index=True)
    asset_code = db.Column(db.String(50), unique=True, nullable=False, index=True)
    asset_type_id = db.Column(db.Integer, db.ForeignKey('asset_types.id'), nullable=False)
    category_id = db.Column(db.Integer, db.ForeignKey('asset_categories.id'), nullable=True)
    vendor_id = db.Column(db.Integer, db.ForeignKey('vendors.id'), nullable=True)
    department_id = db.Column(db.Integer, db.ForeignKey('departments.id'), nullable=True)
    description = db.Column(db.Text)

    barcode_data = db.Column(db.String(100), unique=True, nullable=True)  # e.g., "ASSET-001"
    # barcode_image = db.Column(db.LargeBinary, nullable=True)  # Binary image data
    asset_code = db.Column(db.String(50), unique=True) 
    qr_code_image = db.Column(db.LargeBinary, nullable=True)   # QR code binary data
    barcode_generated = db.Column(db.Boolean, default=False)

    # Tracking
    serial_number = db.Column(db.String(100), unique=True, nullable=True)
    location = db.Column(db.String(120))

    # Financial
    purchase_date = db.Column(db.DateTime)
    purchase_price = db.Column(db.Float)
    depreciation_rate = db.Column(db.Float, default=0.0)
    current_value = db.Column(db.Float)

    # Assignment (CORE FEATURE)
    assigned_to = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    assigned_at = db.Column(db.DateTime, nullable=True)

    # Lifecycle state
    status = db.Column(db.String(50), default='Available', nullable=False)
    condition = db.Column(db.String(50), default='Good', nullable=False)

    # Meta
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'))

    # Relationships (no backrefs - they're defined on the other side)
    assigned_user = db.relationship('User', foreign_keys=[assigned_to], backref='assigned_assets')
    creator = db.relationship('User', foreign_keys=[created_by], backref='created_assets')


    def generate_barcode(self):
        """Generate Code128 barcode for this asset"""
        try:
            # Use asset_code as barcode data
            barcode_value = self.asset_code
            
            # Generate Code128 barcode
            barcode_instance = barcode.get('code128', barcode_value, module_width=0.5)
            
            # Save to bytes buffer
            buffer = BytesIO()
            barcode_instance.write(buffer, options={'module_height': 15})
            buffer.seek(0)
            
            # Store as binary
            self.barcode_image = buffer.getvalue()
            self.barcode_data = barcode_value
            self.barcode_generated = True
            
            print(f"✓ Generated barcode for {self.asset_code}")
            return True
        except Exception as e:
            print(f"❌ Error generating barcode: {str(e)}")
            return False
    
    def generate_qr_code(self):
        """Generate QR code for this asset"""
        try:
            # QR code contains asset info as JSON
            qr_data = f"asset://{self.asset_code}/id/{self.id}/name/{self.asset_name}"
            
            # Generate QR code
            qr = qrcode.QRCode(
                version=1,
                error_correction=qrcode.constants.ERROR_CORRECT_L,
                box_size=10,
                border=2,
            )
            qr.add_data(qr_data)
            qr.make(fit=True)
            
            # Create image
            img = qr.make_image(fill_color="black", back_color="white")
            
            # Save to bytes buffer
            buffer = BytesIO()
            img.save(buffer, format='PNG')
            buffer.seek(0)
            
            # Store as binary
            self.qr_code_image = buffer.getvalue()
            
            print(f"✓ Generated QR code for {self.asset_code}")
            return True
        except Exception as e:
            print(f"❌ Error generating QR code: {str(e)}")
            return False
    
    def get_barcode_base64(self):
        """Return barcode as base64 for frontend display"""
        if self.barcode_image:
            return base64.b64encode(self.barcode_image).decode('utf-8')
        return None
    
    def get_qr_code_base64(self):
        """Return QR code as base64 for frontend display"""
        if self.qr_code_image:
            return base64.b64encode(self.qr_code_image).decode('utf-8')
        return None

    def to_dict(self):
        """Safe frontend-friendly serialization"""
        return {
            "id": self.id,
            "asset_name": self.asset_name,
            "asset_code": self.asset_code,
            "asset_type_id": self.asset_type_id,
            "category_id": self.category_id,
            "vendor_id": self.vendor_id,
            "department_id": self.department_id,
            "description": self.description,
            "serial_number": self.serial_number,
            "location": self.location,
            "purchase_date": self.purchase_date.isoformat() if self.purchase_date else None,
            "purchase_price": self.purchase_price,
            "depreciation_rate": self.depreciation_rate,
            "current_value": self.current_value,
            "assigned_to": self.assigned_to,
            "assigned_at": self.assigned_at.isoformat() if self.assigned_at else None,
            "assigned_user": {
                "id": self.assigned_user.id,
                "first_name": self.assigned_user.first_name,
                "last_name": self.assigned_user.last_name,
                "email": self.assigned_user.email,
                "username": self.assigned_user.username,
            } if self.assigned_user else None,
            "status": self.status,
            "condition": self.condition,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "created_by": self.created_by,
            'barcode_data': self.barcode_data,
            'barcode_image': f"data:image/png;base64,{self.get_barcode_base64()}" if self.barcode_image else None,
            'qr_code_image': f"data:image/png;base64,{self.get_qr_code_base64()}" if self.qr_code_image else None,
        }

    def is_assigned(self):
        return self.assigned_to is not None

    def assign_to(self, user_id):
        self.assigned_to = user_id
        self.status = "Assigned"
        self.assigned_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()

    def unassign(self):
        self.assigned_to = None
        self.status = "Available"
        self.assigned_at = None
        self.updated_at = datetime.utcnow()
