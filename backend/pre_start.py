#!/usr/bin/env python
"""
Pre-start hook for Gunicorn on Render
Ensures database is initialized before app starts
Usage: gunicorn --config gunicorn_config.py wsgi:app
"""

import os
import sys

# Add backend to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from dotenv import load_dotenv
load_dotenv()


def pre_exec_app(app):
    """Called by Gunicorn before app starts"""
    print("🔧 Pre-exec hook: Initializing database...")
    
    try:
        from factory import create_app, initialize_default_roles
        from extensions import db
        from flask_migrate import upgrade as alembic_upgrade
        
        # Create app context - use development to avoid strict validation
        # The startCommand sets FLASK_ENV=production via gunicorn config
        app_instance = create_app('development')
        
        with app_instance.app_context():
            # Run migrations
            print("  📜 Running database migrations...")
            try:
                alembic_upgrade()
                print("  ✅ Migrations applied")
            except Exception as e:
                error_str = str(e).lower()
                if 'no such table: alembic_version' in error_str or 'relation "alembic_version"' in error_str:
                    print("  ℹ️  First run - initializing migrations...")
                    try:
                        db.create_all()
                        alembic_upgrade()
                        print("  ✅ Migrations initialized")
                    except Exception as e2:
                        print(f"  ⚠️  {str(e2)}")
                else:
                    print(f"  ⚠️  {str(e)}")
            
            # Create tables
            print("  📊 Creating database schema...")
            try:
                db.create_all()
                print("  ✅ Schema created")
            except Exception as e:
                print(f"  ⚠️  {str(e)}")
            
            # Initialize roles
            print("  👥 Initializing roles...")
            try:
                initialize_default_roles()
                print("  ✅ Roles initialized")
            except Exception as e:
                print(f"  ⚠️  {str(e)}")
        
        print("✅ Pre-exec initialization complete!\n")
    
    except Exception as e:
        print(f"❌ Pre-exec failed: {str(e)}")
        import traceback
        traceback.print_exc()
        # Don't exit - let app start anyway and fail gracefully


if __name__ == '__main__':
    # When called directly (for testing)
    print("Testing pre-exec hook...")
    pre_exec_app(None)
