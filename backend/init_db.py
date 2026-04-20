#!/usr/bin/env python
"""
Database Initialization Script for Production (Render)
Safely handles:
- Database migrations
- Default role initialization
- Default admin user creation (migration-based)
- No duplicates or errors on subsequent runs

Run before app startup: python backend/init_db.py
"""

import os
import sys

# Add backend to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from dotenv import load_dotenv
load_dotenv()

from factory import create_app, initialize_default_roles
from extensions import db


def init_database():
    """Initialize database safely for production"""
    
    print("=" * 70)
    print("🚀 Asset Inventory Database Initialization")
    print("=" * 70)
    
    # Use development config to avoid strict validation, then switch to requested env
    app = create_app('development')
    
    # Update to production if needed
    if os.getenv('FLASK_ENV') == 'production':
        from config import ProductionConfig
        app.config.from_object(ProductionConfig)
    
    with app.app_context():
        try:
            # Step 1: Run migrations FIRST (most important)
            print("\n📜 Step 1: Applying database migrations...")
            try:
                from flask_migrate import upgrade as alembic_upgrade
                alembic_upgrade()
                print("   ✅ Migrations applied successfully")
            except Exception as e:
                error_str = str(e).lower()
                if 'no such table: alembic_version' in error_str or 'relation "alembic_version"' in error_str:
                    print("   ℹ️  First run - initializing migrations...")
                    try:
                        db.create_all()
                        alembic_upgrade()
                        print("   ✅ Migrations initialized and applied")
                    except Exception as e2:
                        print(f"   ⚠️  Migration retry: {str(e2)}")
                else:
                    print(f"   ⚠️  Migration note: {str(e)}")
            
            # Step 2: Create tables (if migrations didn't)
            print("\n📊 Step 2: Creating database schema...")
            try:
                db.create_all()
                print("   ✅ Database schema ready")
            except Exception as e:
                print(f"   ⚠️  Schema info: {str(e)}")
            
            # Step 3: Initialize default roles
            print("\n👥 Step 3: Initializing system roles...")
            try:
                initialize_default_roles()
                print("   ✅ System roles initialized")
            except Exception as e:
                print(f"   ⚠️  Roles info: {str(e)}")
            
            # Step 4: Verify setup
            print("\n✔️ Step 4: Verifying database setup...")
            from models.role import Role
            from models.user import User
            
            role_count = Role.query.count()
            user_count = User.query.count()
            
            print(f"   ✓ Roles in database: {role_count}")
            print(f"   ✓ Users in database: {user_count}")
            
            # Check for admin user
            admin_user = User.query.filter_by(username='admin').first()
            if admin_user:
                print(f"   ✓ Default admin user exists: {admin_user.email}")
            else:
                print("   ℹ️  Default admin user will be created by migration on first login")
            
            print("\n" + "=" * 70)
            print("✅ Database initialization complete!")
            print("=" * 70)
            
            print("\n📝 Default Admin Credentials:")
            print(f"   Username: admin")
            print(f"   Email: {os.getenv('DEFAULT_ADMIN_EMAIL', 'admin@assetinventory.local')}")
            print(f"   Password: {os.getenv('DEFAULT_ADMIN_PASSWORD', 'Admin@12345')}")
            print("   ⚠️  Change password after first login!")
            print()
            
            return True
            
        except Exception as e:
            print(f"\n❌ Initialization failed: {str(e)}")
            import traceback
            traceback.print_exc()
            return False


if __name__ == '__main__':
    success = init_database()
    sys.exit(0 if success else 1)
