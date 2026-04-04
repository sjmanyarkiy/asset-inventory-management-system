from app import db

class Vendor(db.Model):
    __tablename__ = 'vendors'

    # Primary key
    id = db.Column(db.Integer, primary_key=True)

    # Vendor/company name
    name = db.Column(db.String(150), nullable=False)

    # Unique vendor identifier code (stored in uppercase)
    vendor_code = db.Column(db.String(50), nullable=False, unique=True)

    # Vendor status (Active, On Hold)
    status = db.Column(db.String(50), nullable=False, default='Active')

    # Contact person representing the vendor
    contact_person = db.Column(db.String(150))

    # Contact details
    email = db.Column(db.String(120))
    phone = db.Column(db.String(50))

    # Address information
    postal_address = db.Column(db.String(255))
    physical_address = db.Column(db.String(255))

    # Banking details
    bank_name = db.Column(db.String(150))
    bank_account_number = db.Column(db.String(100))
    bank_branch = db.Column(db.String(150))

    # Payment terms (e.g., Cash, 30 Days, 60 Days)
    payment_terms = db.Column(db.String(100))

    # Optional description
    description = db.Column(db.String(255))

    def __init__(self, name, vendor_code, status='Active',
                 contact_person=None, email=None, phone=None,
                 postal_address=None, physical_address=None,
                 bank_name=None, bank_account_number=None, bank_branch=None,
                 payment_terms=None, description=None):

        self.name = name
        self.vendor_code = vendor_code.upper() if vendor_code else None
        self.status = status
        self.contact_person = contact_person
        self.email = email
        self.phone = phone
        self.postal_address = postal_address
        self.physical_address = physical_address
        self.bank_name = bank_name
        self.bank_account_number = bank_account_number
        self.bank_branch = bank_branch
        self.payment_terms = payment_terms
        self.description = description

    def __repr__(self):
        return f"<Vendor {self.name} ({self.vendor_code})>"