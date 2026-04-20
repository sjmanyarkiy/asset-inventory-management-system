import os, sys
sys.path.insert(0, os.path.dirname(__file__))
from dotenv import load_dotenv
load_dotenv()
from extensions import db
from factory import create_app
from sqlalchemy import text

app = create_app()
with app.app_context():
    try:
        print("🗑️  Clearing tables...")
        # NULL out FK before deleting
        db.session.execute(text('UPDATE departments SET manager_id = NULL;'))
        print("  ✓ Cleared manager_id FKs")
        
        for table in ['asset_requests', 'repair_requests', 'assets', 'audit_logs', 'users', 'departments', 'vendors', 'asset_types', 'asset_categories']:
            db.session.execute(text(f'DELETE FROM {table};'))
            print(f"  ✓ {table}")
        db.session.commit()
        print("\n✅ Cleared!\n")
    except Exception as e:
        db.session.rollback()
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()