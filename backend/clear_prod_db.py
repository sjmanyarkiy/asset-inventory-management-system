import os, sys
sys.path.insert(0, os.path.dirname(__file__))

from dotenv import load_dotenv
load_dotenv()

from extensions import db
from factory import create_app
from sqlalchemy import text

app = create_app()

TABLES = [
    "asset_requests",
    "repair_requests",
    "assets",
    "audit_logs",
    "users",
    "departments",
    "vendors",
    "asset_types",
    "asset_categories"
]

with app.app_context():
    try:
        print("🗑️ Clearing database...")

        db.session.execute(text("SET session_replication_role = replica;"))

        for table in TABLES:
            db.session.execute(text(f"TRUNCATE TABLE {table} RESTART IDENTITY CASCADE;"))
            print(f"  ✓ {table}")

        db.session.execute(text("SET session_replication_role = DEFAULT;"))

        db.session.commit()
        print("\n✅ Database cleared successfully\n")

    except Exception as e:
        db.session.rollback()
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()