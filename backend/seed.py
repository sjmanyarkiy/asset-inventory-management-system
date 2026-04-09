"""
Seed script to populate the database with test users
Run with: python seed.py
"""
from app import create_app
from backend.models.user import db, User
import os

def seed_database():
    """Seed the database with test users"""
    
    app = create_app(os.getenv('FLASK_ENV', 'development'))
    
    with app.app_context():
        # Check if users already exist
        existing_users = User.query.count()
        if existing_users > 0:
            print(f"Database already contains {existing_users} users. Skipping seed...")
            return
        
        try:
            # Admin user
            admin = User(
                username='admin',
                email='admin@example.com',
                first_name='Admin',
                last_name='User',
                is_active=True,
                is_admin=True
            )
            admin.set_password('AdminPassword123!')
            
            # Regular user 1
            user1 = User(
                username='sandra',
                email='sandra@example.com',
                first_name='Sandra',
                last_name='Mwangi',
                is_active=True,
                is_admin=False
            )
            user1.set_password('SandraPass123!')
            
            # Regular user 2
            user2 = User(
                username='johndoe',
                email='john@example.com',
                first_name='John',
                last_name='Doe',
                is_active=True,
                is_admin=False
            )
            user2.set_password('JohnPass123!')
            
            # Regular user 3
            user3 = User(
                username='janedoe',
                email='jane@example.com',
                first_name='Jane',
                last_name='Doe',
                is_active=True,
                is_admin=False
            )
            user3.set_password('JanePass123!')
            
            # Inactive user
            inactive_user = User(
                username='inactive',
                email='inactive@example.com',
                first_name='Inactive',
                last_name='User',
                is_active=False,
                is_admin=False
            )
            inactive_user.set_password('InactivePass123!')
            
            # Add all users to session
            db.session.add(admin)
            db.session.add(user1)
            db.session.add(user2)
            db.session.add(user3)
            db.session.add(inactive_user)
            
            # Commit to database
            db.session.commit()
            
            print("Database seeded successfully!")
            print("\nTest Users Created:")
            print("=" * 50)
            print("Admin Account:")
            print("  Username: admin")
            print("  Email: admin@example.com")
            print("  Password: AdminPassword123!")
            print("\nRegular Users:")
            print("  1. sandra / sandra@example.com / SandraPass123!")
            print("  2. johndoe / john@example.com / JohnPass123!")
            print("  3. janedoe / jane@example.com / JanePass123!")
            print("\nInactive User (for testing):")
            print("  Username: inactive")
            print("  Email: inactive@example.com")
            print("  Password: InactivePass123!")
            print("=" * 50)
            
        except Exception as e:
            db.session.rollback()
            print(f"Error seeding database: {str(e)}")
            raise

if __name__ == '__main__':
    seed_database()