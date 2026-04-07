import main as app_module
from app import db

from app.models.vendors import Vendor
from app.models.departments import Department
from app.models.asset_category import AssetCategory
from app.models.asset_type import AssetType
from app.models.asset import Asset

from datetime import datetime

# Create Flask app
flask_app = app_module.create_app()


def seed_all():
    with flask_app.app_context():

        # -------------------------
        # Clear existing data (safe FK order)
        # -------------------------
        try:
            Asset.query.delete()
            AssetType.query.delete()
            AssetCategory.query.delete()
            Department.query.delete()
            Vendor.query.delete()
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            print("Error clearing data:", e)

        # -------------------------
        # Vendors
        # -------------------------
        v1 = Vendor(
            name="Dell",
            vendor_code="VEND001",
            contact_person="John Doe",
            email="dell@example.com",
            phone="1234567890",
            postal_address="PO Box 1",
            physical_address="Dell HQ",
            payment_terms="Net 30",
            description="Computer hardware vendor",
            bank_name="Bank A",
            bank_account_number="12345678",
            bank_branch="Main Branch"
        )

        v2 = Vendor(
            name="HP",
            vendor_code="VEND002",
            contact_person="Jane Smith",
            email="hp@example.com",
            phone="0987654321",
            postal_address="PO Box 2",
            physical_address="HP HQ",
            payment_terms="Net 45",
            description="Printer and laptop vendor",
            bank_name="Bank B",
            bank_account_number="87654321",
            bank_branch="Central Branch"
        )

        db.session.add_all([v1, v2])
        db.session.flush()

        # -------------------------
        # Departments
        # -------------------------
        d1 = Department(
            name="IT",
            department_code="DEP001",
            description="Information Technology Department"
        )

        d2 = Department(
            name="Finance",
            department_code="DEP002",
            description="Finance Department"
        )

        db.session.add_all([d1, d2])
        db.session.flush()

        # -------------------------
        # Categories
        # -------------------------
        c1 = AssetCategory(
            name="Electronics",
            category_code="CAT001",
            description="Electronic devices",
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )

        c2 = AssetCategory(
            name="Furniture",
            category_code="CAT002",
            description="Office furniture",
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )

        db.session.add_all([c1, c2])
        db.session.flush()

        # -------------------------
        # Asset Types
        # -------------------------
        t1 = AssetType(
            name="Laptop",
            type_code="TYPE001",
            description="Portable computers",
            category_id=c1.id,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )

        t2 = AssetType(
            name="Chair",
            type_code="TYPE002",
            description="Office seating",
            category_id=c2.id,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )

        db.session.add_all([t1, t2])
        db.session.flush()

        # -------------------------
        # Assets
        # -------------------------
        a1 = Asset(
            name="Dell XPS 13",
            asset_code="AST001",
            barcode="BAR001",
            status="available",
            description="Ultrabook laptop",
            category_id=c1.id,
            asset_type_id=t1.id,
            vendor_id=v1.id,
            department_id=d1.id,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )

        a2 = Asset(
            name="HP EliteBook",
            asset_code="AST002",
            barcode="BAR002",
            status="available",
            description="Business laptop",
            category_id=c1.id,
            asset_type_id=t1.id,
            vendor_id=v2.id,
            department_id=d1.id,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )

        a3 = Asset(
            name="Office Chair",
            asset_code="AST003",
            barcode="BAR003",
            status="available",
            description="Ergonomic chair",
            category_id=c2.id,
            asset_type_id=t2.id,
            vendor_id=v1.id,
            department_id=d2.id,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )

        db.session.add_all([a1, a2, a3])

        # -------------------------
        # Commit
        # -------------------------
        try:
            db.session.commit()
            print("✅ Database seeded successfully!")
        except Exception as e:
            db.session.rollback()
            print("❌ Seeding failed:", e)


if __name__ == "__main__":
    seed_all()
    