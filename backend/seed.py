"""
Comprehensive seed script for Asset Inventory Management System
Populates database with:
- Roles (Super Admin, Admin, Manager, Employee)
- Users with assigned roles
- Asset Categories
- Asset Types
- Vendors
- Departments
- Sample Assets
- Service Reports

Run with: python seed.py
"""

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))


from datetime import datetime, timedelta
from dotenv import load_dotenv

load_dotenv()

# from app import create_app
# from app import create_app


from extensions import db
from models.user import User
from models.role import Role
from models.asset import Asset

import importlib.util
spec = importlib.util.spec_from_file_location("app_module", os.path.join(os.path.dirname(__file__), "factory.py"))
app_module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(app_module)
create_app = app_module.create_app

# Import additional models if they exist in models/ directory
try:
    from models.asset_category import AssetCategory
except ImportError:
    AssetCategory = None

try:
    from models.asset_type import AssetType
except ImportError:
    AssetType = None

try:
    from models.vendor import Vendor
except ImportError:
    Vendor = None

try:
    from models.department import Department
except ImportError:
    Department = None

try:
    from models.report import Report
except ImportError:
    Report = None


def seed_database():
    """Main seed function"""
    
    app = create_app(os.getenv('FLASK_ENV', 'development'))
    
    with app.app_context():
        # Check if already seeded
        if User.query.filter_by(username='admin').first():
            print("✓ Database already seeded. Skipping...\n")
            return
        
        try:
            print("🌱 Starting database seed...\n")
            
            # 1. Get or create Roles
            print("📋 Checking roles...")
            existing_roles = Role.query.all()
            if existing_roles:
                print(f"   ✓ Found {len(existing_roles)} existing roles")
                roles = existing_roles
            else:
                print("   Creating new roles...")
                roles = create_roles()
            
            # 2. Create Users with roles
            print("👥 Creating users...")
            users = create_users(roles)
            
            # 3. Create additional data (if models exist)
            categories = []
            asset_types = []
            vendors = []
            departments = []
            
            if AssetCategory:
                print("🏷️  Creating asset categories...")
                categories = create_asset_categories()
            
            if AssetType:
                print("🔧 Creating asset types...")
                asset_types = create_asset_types()
            
            if Vendor:
                print("🏢 Creating vendors...")
                vendors = create_vendors()
            
            if Department:
                print("🏛️  Creating departments...")
                departments = create_departments()
            
            # 4. Create sample assets
            if categories and asset_types:
                print("📦 Creating sample assets...")
                create_sample_assets(users, categories, asset_types, vendors, departments)

            # 5. Create service reports
            if Report:
                print("📊 Creating service reports...")
                create_reports(users)
            
            print("\n✅ Database seeded successfully!\n")
            print_seed_summary(users, roles)
            
        except Exception as e:
            db.session.rollback()
            print(f"❌ Error seeding database: {str(e)}")
            import traceback
            traceback.print_exc()
            raise


def create_roles():
    """Create default system roles"""
    
    roles_data = [
        {
            'name': 'Super Admin',
            'description': 'Full system access and control',
            'hierarchy_level': 0,
            'is_system': True,
            'permissions': {
                'manage_users': True,
                'manage_roles': True,
                'manage_permissions': True,
                'view_audit_logs': True,
                'manage_assets': True,
                'manage_requests': True,
                'manage_reports': True,
                'system_settings': True
            }
        },
        {
            'name': 'Admin',
            'description': 'Administrative access - manage users and assets',
            'hierarchy_level': 1,
            'is_system': True,
            'permissions': {
                'manage_users': True,
                'manage_assets': True,
                'manage_requests': True,
                'view_audit_logs': True,
                'manage_reports': True
            }
        },
        {
            'name': 'Manager',
            'description': 'Manager access - approve requests and manage department assets',
            'hierarchy_level': 2,
            'is_system': True,
            'permissions': {
                'approve_requests': True,
                'manage_assets': True,
                'view_reports': True,
                'view_audit_logs': False
            }
        },
        {
            'name': 'Employee',
            'description': 'Standard employee access - request and view assets',
            'hierarchy_level': 3,
            'is_system': True,
            'permissions': {
                'request_assets': True,
                'view_assets': True,
                'create_service_requests': True,
                'view_reports': False
            }
        }
    ]
    
    roles = []
    for role_data in roles_data:
        role = Role(**role_data)
        db.session.add(role)
        roles.append(role)
    
    db.session.commit()
    print(f"   ✓ Created {len(roles)} roles")
    return roles


def create_users(roles):
    """Create test users with different roles"""
    
    if not roles:
        raise ValueError("❌ Roles must be created before users")
    
    # Map role names to role objects
    role_map = {role.name: role for role in roles}
    
    users_data = [
        {
            'username': 'admin',
            'email': 'admin@assetinventory.com',
            'first_name': 'System',
            'last_name': 'Administrator',
            'password': 'Admin@123!',
            'is_active': True,
            'role': role_map.get('Super Admin')
        },
        {
            'username': 'teresa',
            'email': 'teresa@assetinventory.com',
            'first_name': 'Mama',
            'last_name': 'Teresa',
            'password': 'Teresa@123!',
            'is_active': True,
            'role': role_map.get('Admin')
        },
        {
            'username': 'managermkubwa',
            'email': 'manager1@assetinventory.com',
            'first_name': 'John',
            'last_name': 'Kiama',
            'password': 'Manager@123!',
            'is_active': True,
            'role': role_map.get('Manager')
        },
        {
            'username': 'managermdogo',
            'email': 'mmdogo@assetinventory.com',
            'first_name': 'Miriam',
            'last_name': 'Mdogo',
            'password': 'Manager@123!',
            'is_active': True,
            'role': role_map.get('Manager')
        },
        {
            'username': 'alice-kamongo',
            'email': 'akamongo1@assetinventory.com',
            'first_name': 'Alice',
            'last_name': 'Kamongo',
            'password': 'alice@123!',
            'is_active': True,
            'role': role_map.get('Employee')
        },
        {
            'username': 'kevin-wamalwa',
            'email': 'kwamalwa@assetinventory.com',
            'first_name': 'Kevin',
            'last_name': 'Wamalwa',
            'password': 'kevin@123!',
            'is_active': True,
            'role': role_map.get('Employee')
        },
        {
            'username': 'carol-cheboi',
            'email': 'ccheboi@assetinventory.com',
            'first_name': 'Carol',
            'last_name': 'Cheboi',
            'password': 'carol@123!',
            'is_active': True,
            'role': role_map.get('Employee')
        },
        {
            'username': 'david-maingi',
            'email': 'dmaingi@assetinventory.com',
            'first_name': 'David',
            'last_name': 'Maingi',
            'password': 'david@123!',
            'is_active': True,
            'role': role_map.get('Employee')
        },
        {
            'username': 'mwenda-zake',
            'email': 'mwendazake@assetinventory.com',
            'first_name': 'Mwenda',
            'last_name': 'Zake',
            'password': 'mwenda@123!',
            'is_active': False,
            'role': role_map.get('Employee')
        }
    ]
    
    users = []
    for user_data in users_data:
        password = user_data.pop('password')
        user = User(**user_data)
        user.set_password(password)
        db.session.add(user)
        users.append(user)
    
    db.session.commit()
    print(f"   ✓ Created {len(users)} users")
    return users


def create_asset_categories():
    """Create asset categories"""
    
    categories_data = [
        {'name': 'IT Equipment', 'description': 'Computers, servers, and networking equipment'},
        {'name': 'Office Furniture', 'description': 'Desks, chairs, cabinets, and other furniture'},
        {'name': 'Vehicles', 'description': 'Company vehicles and transportation'},
        {'name': 'Machinery', 'description': 'Industrial machinery and equipment'},
        {'name': 'Tools', 'description': 'Hand tools and power tools'},
        {'name': 'Software Licenses', 'description': 'Software and digital licenses'},
    ]
    
    categories = []
    for cat_data in categories_data:
        category = AssetCategory(**cat_data)
        db.session.add(category)
        categories.append(category)
    
    db.session.commit()
    print(f"   ✓ Created {len(categories)} asset categories")
    return categories


def create_asset_types():
    """Create asset types"""
    
    types_data = [
        {'name': 'Laptop', 'description': 'Portable computers'},
        {'name': 'Desktop Computer', 'description': 'Desktop workstations'},
        {'name': 'Server', 'description': 'Server computers'},
        {'name': 'Printer', 'description': 'Office printers'},
        {'name': 'Monitor', 'description': 'Computer monitors'},
        {'name': 'Keyboard & Mouse', 'description': 'Input devices'},
        {'name': 'Office Chair', 'description': 'Ergonomic office chairs'},
        {'name': 'Desk', 'description': 'Work desks'},
        {'name': 'Cabinet', 'description': 'Storage cabinets'},
        {'name': 'Car', 'description': 'Company vehicles'},
        {'name': 'Van', 'description': 'Company vans'},
    ]
    
    types = []
    for type_data in types_data:
        asset_type = AssetType(**type_data)
        db.session.add(asset_type)
        types.append(asset_type)
    
    db.session.commit()
    print(f"   ✓ Created {len(types)} asset types")
    return types


def create_vendors():
    """Create vendors"""
    
    vendors_data = [
        {
            'name': 'Tech Solutions Ltd',
            'vendor_code': 'TSL001',
            'email': 'info@techsolutions.co.ke',
            'phone': '+254-20-123-4567',
            'contact_person': 'Peter Kipchoge',
            'status': 'active',
            'payment_terms': '30 days'
        },
        {
            'name': 'Office Supplies Kenya',
            'vendor_code': 'OSK002',
            'email': 'sales@officesupplies.co.ke',
            'phone': '+254-20-987-6543',
            'contact_person': 'Grace Mutua',
            'status': 'active',
            'payment_terms': '14 days'
        },
        {
            'name': 'Automotive East Africa',
            'vendor_code': 'AEA003',
            'email': 'info@automotiveea.co.ke',
            'phone': '+254-722-123-456',
            'contact_person': 'James Omondi',
            'status': 'active',
            'payment_terms': '45 days'
        },
        {
            'name': 'Global IT Services',
            'vendor_code': 'GIS004',
            'email': 'support@globalit.com',
            'phone': '+1-800-123-4567',
            'contact_person': 'Michael Rodriguez',
            'status': 'active',
            'payment_terms': '30 days'
        },
        {
            'name': 'Premium Furniture Co',
            'vendor_code': 'PFC005',
            'email': 'sales@premiumfurniture.co.ke',
            'phone': '+254-20-555-6789',
            'contact_person': 'Elizabeth Wanjiru',
            'status': 'active',
            'payment_terms': '21 days'
        }
    ]
    
    vendors = []
    for vendor_data in vendors_data:
        vendor = Vendor(**vendor_data)
        db.session.add(vendor)
        vendors.append(vendor)
    
    db.session.commit()
    print(f"   ✓ Created {len(vendors)} vendors")
    return vendors


def create_departments():
    """Create departments"""
    
    departments_data = [
        {'name': 'Information Technology', 'code': 'IT'},
        {'name': 'Human Resources', 'code': 'HR'},
        {'name': 'Finance', 'code': 'FIN'},
        {'name': 'Operations', 'code': 'OPS'},
        {'name': 'Sales', 'code': 'SAL'},
        {'name': 'Marketing', 'code': 'MKT'},
    ]
    
    departments = []
    for dept_data in departments_data:
        department = Department(**dept_data)
        db.session.add(department)
        departments.append(department)
    
    db.session.commit()
    print(f"   ✓ Created {len(departments)} departments")
    return departments


def create_sample_assets(users, categories, asset_types, vendors, departments):
    """Create sample assets"""
    
    # Get specific categories and types
    it_category = next((c for c in categories if 'IT' in c.name), categories[0])
    furniture_category = next((c for c in categories if 'Furniture' in c.name), categories[1])
    
    laptop_type = next((t for t in asset_types if 'Laptop' in t.name), asset_types[0])
    desktop_type = next((t for t in asset_types if 'Desktop' in t.name), asset_types[1])
    monitor_type = next((t for t in asset_types if 'Monitor' in t.name), asset_types[4])
    chair_type = next((t for t in asset_types if 'Chair' in t.name), asset_types[6])
    
    vendor1 = vendors[0] if vendors else None
    vendor2 = vendors[1] if len(vendors) > 1 else vendor1
    
    it_dept = next((d for d in departments if 'IT' in d.name), departments[0] if departments else None)
    hr_dept = next((d for d in departments if 'HR' in d.name), departments[1] if len(departments) > 1 else None)
    
    admin_user = users[0]  # admin user
    employees = [u for u in users if u.role and u.role.name == 'Employee']
    
    assets_data = [
        {
            'asset_name': 'MacBook Pro 16" 2023',
            'asset_code': 'LAPTOP-001',
            'asset_type': laptop_type,
            'category': it_category,
            'description': 'High-performance laptop for development',
            'serial_number': 'SN-MACBOOK-001',
            'purchase_date': datetime.now() - timedelta(days=180),
            'purchase_price': 2500.00,
            'current_value': 2000.00,
            'location': 'Office - IT Department',
            'assigned_to': employees[0].id if employees else None,
            'status': 'Assigned',
            'condition': 'Good',
            'vendor': vendor1,
            'department': it_dept,
            'created_by': admin_user.id
        },
        {
            'asset_name': 'Dell XPS 15 Laptop',
            'asset_code': 'LAPTOP-002',
            'asset_type': laptop_type,
            'category': it_category,
            'description': 'Premium laptop for design work',
            'serial_number': 'SN-DELL-XPS-001',
            'purchase_date': datetime.now() - timedelta(days=200),
            'purchase_price': 2000.00,
            'current_value': 1600.00,
            'location': 'Office - Design Team',
            'assigned_to': employees[1].id if len(employees) > 1 else None,
            'status': 'Assigned',
            'condition': 'Good',
            'vendor': vendor1,
            'department': it_dept,
            'created_by': admin_user.id
        },
        {
            'asset_name': 'iMac 27" 2023',
            'asset_code': 'DESKTOP-001',
            'asset_type': desktop_type,
            'category': it_category,
            'description': 'All-in-one desktop for office use',
            'serial_number': 'SN-IMAC-001',
            'purchase_date': datetime.now() - timedelta(days=150),
            'purchase_price': 1800.00,
            'current_value': 1500.00,
            'location': 'Office - General Area',
            'assigned_to': None,
            'status': 'Available',
            'condition': 'Good',
            'vendor': vendor1,
            'department': it_dept,
            'created_by': admin_user.id
        },
        {
            'asset_name': 'LG 27" 4K Monitor',
            'asset_code': 'MONITOR-001',
            'asset_type': monitor_type,
            'category': it_category,
            'description': '4K Ultra HD Monitor',
            'serial_number': 'SN-LG-MONITOR-001',
            'purchase_date': datetime.now() - timedelta(days=120),
            'purchase_price': 450.00,
            'current_value': 380.00,
            'location': 'Office - IT Department',
            'assigned_to': employees[0].id if employees else None,
            'status': 'Assigned',
            'condition': 'Good',
            'vendor': vendor1,
            'department': it_dept,
            'created_by': admin_user.id
        },
        {
            'asset_name': 'Ergonomic Office Chair - Black',
            'asset_code': 'CHAIR-001',
            'asset_type': chair_type,
            'category': furniture_category,
            'description': 'Comfortable ergonomic chair with lumbar support',
            'serial_number': 'SN-CHAIR-BLACK-001',
            'purchase_date': datetime.now() - timedelta(days=300),
            'purchase_price': 350.00,
            'current_value': 280.00,
            'location': 'Office - Executive Area',
            'assigned_to': employees[0].id if employees else None,
            'status': 'Assigned',
            'condition': 'Fair',
            'vendor': vendor2,
            'department': hr_dept,
            'created_by': admin_user.id
        },
        {
            'asset_name': 'Ergonomic Office Chair - Gray',
            'asset_code': 'CHAIR-002',
            'asset_type': chair_type,
            'category': furniture_category,
            'description': 'Comfortable ergonomic chair with lumbar support',
            'serial_number': 'SN-CHAIR-GRAY-001',
            'purchase_date': datetime.now() - timedelta(days=280),
            'purchase_price': 350.00,
            'current_value': 300.00,
            'location': 'Office - General Area',
            'assigned_to': None,
            'status': 'Available',
            'condition': 'Good',
            'vendor': vendor2,
            'department': hr_dept,
            'created_by': admin_user.id
        },
        {
            'asset_name': 'Standing Desk - Oak',
            'asset_code': 'DESK-001',
            'asset_type': next((t for t in asset_types if 'Desk' in t.name), asset_types[7]),
            'category': furniture_category,
            'description': 'Electric height-adjustable standing desk',
            'serial_number': 'SN-DESK-OAK-001',
            'purchase_date': datetime.now() - timedelta(days=250),
            'purchase_price': 600.00,
            'current_value': 500.00,
            'location': 'Office - Executive Area',
            'assigned_to': employees[1].id if len(employees) > 1 else None,
            'status': 'Assigned',
            'condition': 'Good',
            'vendor': vendor2,
            'department': hr_dept,
            'created_by': admin_user.id
        },
        {
            'asset_name': 'HP LaserJet Pro Printer',
            'asset_code': 'PRINTER-001',
            'asset_type': next((t for t in asset_types if 'Printer' in t.name), asset_types[3]),
            'category': it_category,
            'description': 'Network printer for office use',
            'serial_number': 'SN-HP-PRINTER-001',
            'purchase_date': datetime.now() - timedelta(days=365),
            'purchase_price': 800.00,
            'current_value': 600.00,
            'location': 'Office - Common Area',
            'assigned_to': None,
            'status': 'Available',
            'condition': 'Good',
            'vendor': vendor1,
            'department': it_dept,
            'created_by': admin_user.id
        },
    ]
    
    for asset_data in assets_data:
        asset = Asset(**asset_data)
        db.session.add(asset)
    
    db.session.commit()
    print(f"   ✓ Created {len(assets_data)} sample assets")


def create_reports(users):
    """Create sample service reports"""

    if not Report:
        print("   ⚠ Report model not found, skipping reports creation")
        return []

    # pick some users
    admin_user = next((u for u in users if u.username == "admin"), users[0])
    employees = [u for u in users if u.role and u.role.name == "Employee"]

    reports_data = [
        {
            "title": "Network Issue in Office",
            "description": "Internet is down on the 3rd floor",
            "status": "assigned",
            "assigned_to": employees[0].id if employees else None,
            "created_at": datetime.utcnow()
        },
        {
            "title": "Laptop Not Charging",
            "description": "Employee laptop battery issue",
            "status": "assigned",
            "assigned_to": employees[1].id if len(employees) > 1 else None,
            "created_at": datetime.utcnow()
        },
        {
            "title": "Printer Maintenance Required",
            "description": "Printer showing paper jam errors",
            "status": "repaired",
            "assigned_to": employees[0].id if employees else None,
            "created_at": datetime.utcnow()
        },
        {
            "title": "Software Installation Request",
            "description": "Need VS Code installed on workstation",
            "status": "assigned",
            "assigned_to": None,
            "created_at": datetime.utcnow()
        }
    ]

    reports = []
    for r_data in reports_data:
        report = Report(**r_data)
        db.session.add(report)
        reports.append(report)

    db.session.commit()
    print(f"   ✓ Created {len(reports)} service reports")
    return reports


def print_seed_summary(users, roles):
    """Print summary of seeded data"""
    
    print("=" * 70)
    print("🎉 SEED DATA SUMMARY")
    print("=" * 70)
    
    print("\n📋 ROLES:")
    for role in roles:
        user_count = len(role.users) if hasattr(role, 'users') and role.users else 0
        print(f"   • {role.name} (Level {role.hierarchy_level}) - {user_count} users")
    
    print("\n👥 TEST USERS:")
    print("   Status Username              Email                          Role")
    print("   " + "-" * 67)
    for user in users:
        role_name = user.role.name if user.role else "None"
        status = "✓" if user.is_active else "✗"
        print(f"   {status}      {user.username:<20} {user.email:<30} {role_name}")
    
    print("\n🔐 LOGIN CREDENTIALS:")
    print("   Admin (Super Admin):")
    print("      • Username: admin")
    print("      • Password: Admin@123!")
    print("")
    print("   Admin (Regular Admin):")
    print("      • Username: teresa")
    print("      • Password: Teresa@123!")
    print("")
    print("   Managers:")
    print("      • Username: managermkubwa or managermdogo")
    print("      • Password: Manager@123!")
    print("")
    print("   Employees (use individual passwords as set in code)")
    print("      • alice-kamongo: alice@123!")
    print("      • kevin-wamalwa: kevin@123!")
    print("      • carol-cheboi: carol@123!")
    print("      • david-maingi: david@123!")
    print("      • mwenda-zake: mwenda@123!")
    
    print("\n" + "=" * 70)
    print("✨ Database seeding complete! Ready for testing.")
    print("=" * 70 + "\n")


if __name__ == '__main__':
    seed_database()