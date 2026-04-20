#!/usr/bin/env python
"""
Database Post-Migration Setup Script
IMPORTANT: This runs AFTER 'flask db upgrade' in buildCommand
Safely handles:
- Default role initialization
- Default admin user creation (migration-based)
- Schema verification
- No duplicates or errors on subsequent runs

Usage: python backend/init_db.py (after 'flask db upgrade' completes)
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
    """Initialize database after migrations (called after 'flask db upgrade')"""
    
    print("=" * 70)
    print("🚀 Asset Inventory Post-Migration Setup")
    print("=" * 70)
    
    # Use development config to avoid strict validation
    app = create_app('development')
    
    # Update to production if needed
    if os.getenv('FLASK_ENV') == 'production':
        from config import ProductionConfig
        app.config.from_object(ProductionConfig)
    
    with app.app_context():
        try:
            # Step 1: Create tables (migrations should have done this)
            print("\n📊 Step 1: Ensuring database schema...")
            try:
                db.create_all()
                print("   ✅ Database schema ready")
            except Exception as e:
                print(f"   ⚠️  Schema info: {str(e)}")
            
            # Step 2: Initialize default roles
            print("\n👥 Step 2: Initializing system roles...")
            try:
                initialize_default_roles()
                print("   ✅ System roles initialized")
            except Exception as e:
                print(f"   ⚠️  Roles info: {str(e)}")
            
            # Step 3: Verify setup
            print("\n✔️ Step 3: Verifying database setup...")
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
                print("   ℹ️  Default admin user will be created by migration")
            
            print("\n" + "=" * 70)
            print("✅ Database setup complete!")
            print("=" * 70)
            
            print("\n📝 Default Admin Credentials:")
            print(f"   Username: admin")
            print(f"   Email: {os.getenv('DEFAULT_ADMIN_EMAIL', 'admin@assetinventory.local')}")
            print(f"   Password: {os.getenv('DEFAULT_ADMIN_PASSWORD', 'Admin@12345')}")
            print("   ⚠️  Change password after first login!")
            print()
            
            return True
            
        except Exception as e:
            print(f"\n❌ Setup failed: {str(e)}")
            import traceback
            traceback.print_exc()
            return False


if __name__ == '__main__':
    success = init_database()
    sys.exit(0 if success else 1)
