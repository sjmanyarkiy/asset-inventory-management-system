"""Add default admin user safely

Revision ID: 002
Revises: 001
Create Date: 2026-04-20 21:25:00.000000

"""
from alembic import op
import sqlalchemy as sa
from werkzeug.security import generate_password_hash
import os


# revision identifiers, used by Alembic.
revision = '002'
down_revision = '001'
branch_labels = None
depends_on = None


def upgrade():
    """Create default admin user if it doesn't exist"""
    connection = op.get_bind()
    
    # Check if admin user already exists
    result = connection.execute(
        sa.text("SELECT id FROM users WHERE username = 'admin' LIMIT 1")
    )
    
    if result.fetchone():
        print("✓ Default admin user already exists, skipping...")
        return
    
    # Get or create Super Admin role
    role_result = connection.execute(
        sa.text("SELECT id FROM roles WHERE name = 'Super Admin' LIMIT 1")
    )
    role_row = role_result.fetchone()
    
    if not role_row:
        print("❌ Super Admin role not found, creating...")
        # Insert Super Admin role if missing
        connection.execute(
            sa.text("""
                INSERT INTO roles (name, description, permissions, hierarchy_level, is_system, created_at, updated_at)
                VALUES (:name, :desc, :perms, :level, :system, datetime('now'), datetime('now'))
            """),
            {
                "name": "Super Admin",
                "desc": "Full system access",
                "perms": '{"manage_users": true, "manage_roles": true, "manage_permissions": true, "view_audit_logs": true, "manage_assets": true, "manage_requests": true}',
                "level": 0,
                "system": 1
            }
        )
        role_result = connection.execute(
            sa.text("SELECT id FROM roles WHERE name = 'Super Admin' LIMIT 1")
        )
        role_row = role_result.fetchone()
    
    role_id = role_row[0] if role_row else None
    
    if not role_id:
        print("❌ Failed to get/create Super Admin role")
        return
    
    # Create default admin user
    default_password = os.getenv('DEFAULT_ADMIN_PASSWORD', 'Admin@12345')
    password_hash = generate_password_hash(default_password)
    
    connection.execute(
        sa.text("""
            INSERT INTO users (username, email, password_hash, first_name, last_name, is_active, role_id, is_email_verified, created_at, updated_at)
            VALUES (:username, :email, :password_hash, :first_name, :last_name, :active, :role_id, :verified, datetime('now'), datetime('now'))
        """),
        {
            "username": "admin",
            "email": os.getenv('DEFAULT_ADMIN_EMAIL', 'admin@assetinventory.local'),
            "password_hash": password_hash,
            "first_name": "System",
            "last_name": "Administrator",
            "active": 1,
            "role_id": role_id,
            "verified": 1
        }
    )
    
    connection.commit()
    print("✅ Default admin user created successfully!")
    print(f"   Username: admin")
    print(f"   Email: {os.getenv('DEFAULT_ADMIN_EMAIL', 'admin@assetinventory.local')}")
    print(f"   Password: {default_password}")
    print("   ⚠️  IMPORTANT: Change the password after first login!")


def downgrade():
    """Remove default admin user"""
    connection = op.get_bind()
    
    # Only delete if it's the default admin user
    connection.execute(
        sa.text("DELETE FROM users WHERE username = 'admin' AND email LIKE '%assetinventory.local'")
    )
    
    connection.commit()
    print("↩️  Default admin user removed")
