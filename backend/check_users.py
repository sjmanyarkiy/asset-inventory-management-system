import os
import sys

sys.path.insert(0, os.path.expanduser('~/Development/code/phase-5/asset-inventory-management-system/backend'))

from dotenv import load_dotenv
load_dotenv()

from factory import create_app
from models.user import User

app = create_app()
with app.app_context():
    print("=" * 70)
    print("CHECKING USER PASSWORDS")
    print("=" * 70)
    
    users = User.query.all()
    if not users:
        print("❌ No users found in database!")
    else:
        print(f"\n✓ Found {len(users)} users:\n")
        
        for u in users:
            hash_status = f"{u.password_hash[:50]}..." if u.password_hash else "❌ NO HASH"
            print(f"  {u.username:20} | Hash: {hash_status}")
        
        # Test admin password
        print("\n" + "=" * 70)
        admin = User.query.filter_by(username='admin').first()
        if admin:
            print("TESTING ADMIN PASSWORD:")
            print(f"  Username: {admin.username}")
            print(f"  Hash exists: {bool(admin.password_hash)}")
            
            test_pass = admin.check_password('Admin@123!')
            print(f"  Password 'Admin@123!': {'✅ MATCH' if test_pass else '❌ NO MATCH'}")
        else:
            print("❌ Admin user not found!")
        
        print("=" * 70)