"""
Comprehensive seed script for Asset Inventory Management System
Populates database with:
- Roles (Super Admin, Admin, Manager, Employee)
- Users with assigned roles AND departments
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

from extensions import db
from models.user import User
from models.role import Role
from models.asset import Asset

import importlib.util
spec = importlib.util.spec_from_file_location("app_module", os.path.join(os.path.dirname(__file__), "factory.py"))
app_module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(app_module)
create_app = app_module.create_app

# Import additional models
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
        # if User.query.filter_by(username='admin').first():
        #     print("✓ Database already seeded. Skipping...\n")
        #     return
        
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
            
            # 2. Create departments FIRST (before users)
            categories = []
            asset_types = []
            vendors = []
            departments = []
            
            if Department:
                print("🏛️  Creating departments...")
                departments = create_departments()
            
            # 3. Create Users with roles AND department assignments
            print("👥 Creating users and assigning to departments...")
            users = create_users(roles, departments)
            
            # 4. Create additional data (if models exist)
            if AssetCategory:
                print("🏷️  Creating asset categories...")
                categories = create_asset_categories()
            
            if AssetType:
                print("🔧 Creating asset types...")
                asset_types = create_asset_types()
            
            if Vendor:
                print("🏢 Creating vendors...")
                vendors = create_vendors()
            
            # 5. Assign managers to departments (set manager_id on departments)
            if departments:
                print("👔 Assigning managers to departments...")
                assign_managers_to_departments(users, departments)
            
            # 6. Create sample assets
            if categories and asset_types:
                print("📦 Creating sample assets...")
                create_sample_assets(users, categories, asset_types, vendors, departments)

            # 7. Create service reports
            if Report:
                print("📊 Creating service reports...")
                create_reports(users)
            
            print("\n✅ Database seeded successfully!\n")
            print_seed_summary(users, roles, departments)
            
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


def create_departments():
    """Create departments FIRST (before users)"""
    
    departments_data = [
        {'name': 'Information Technology', 'department_code': 'IT'},
        {'name': 'Human Resources', 'department_code': 'HR'},
        {'name': 'Finance', 'department_code': 'FIN'},
        {'name': 'Operations', 'department_code': 'OPS'},
        {'name': 'Sales', 'department_code': 'SAL'},
        {'name': 'Marketing', 'department_code': 'MKT'},
    ]
    
    departments = []
    for dept_data in departments_data:
        department = Department(**dept_data)
        db.session.add(department)
        departments.append(department)
    
    db.session.commit()
    print(f"   ✓ Created {len(departments)} departments")
    return departments


def create_users(roles, departments=None):
    """Create test users with different roles AND assign to departments"""
    
    if not roles:
        raise ValueError("❌ Roles must be created before users")
    
    # Map role names to role objects
    role_map = {role.name: role for role in roles}
    
    # Map departments by code for easier lookup
    dept_map = {}
    if departments:
        dept_map = {d.department_code: d for d in departments}
    
    users_data = [
        {
            'username': 'admin',
            'email': 'admin@assetinventory.com',
            'first_name': 'System',
            'last_name': 'Administrator',
            'password': 'Admin@123!',
            'is_active': True,
            'is_email_verified': True,
            'role': role_map.get('Super Admin'),
            'department_id': None  # Super Admin has no department
        },
        {
            'username': 'teresa',
            'email': 'teresa@assetinventory.com',
            'first_name': 'Mama',
            'last_name': 'Teresa',
            'password': 'Teresa@123!',
            'is_active': True,
            'is_email_verified': True,
            'role': role_map.get('Admin'),
            'department_id': None  # Admin has no department
        },
        {
            'username': 'managermkubwa',
            'email': 'manager1@assetinventory.com',
            'first_name': 'John',
            'last_name': 'Kiama',
            'password': 'Manager@123!',
            'is_active': True,
            'is_email_verified': True,
            'role': role_map.get('Manager'),
            'department_id': dept_map.get('IT').id if 'IT' in dept_map else None
        },
        {
            'username': 'managermdogo',
            'email': 'mmdogo@assetinventory.com',
            'first_name': 'Miriam',
            'last_name': 'Mdogo',
            'password': 'Manager@123!',
            'is_active': True,
            'is_email_verified': True,
            'role': role_map.get('Manager'),
            'department_id': dept_map.get('HR').id if 'HR' in dept_map else None
        },
        {
            'username': 'alice-kamongo',
            'email': 'akamongo1@assetinventory.com',
            'first_name': 'Alice',
            'last_name': 'Kamongo',
            'password': 'alice@123!',
            'is_active': True,
            'is_email_verified': True,
            'role': role_map.get('Employee'),
            'department_id': dept_map.get('IT').id if 'IT' in dept_map else None
        },
        {
            'username': 'kevin-wamalwa',
            'email': 'kwamalwa@assetinventory.com',
            'first_name': 'Kevin',
            'last_name': 'Wamalwa',
            'password': 'kevin@123!',
            'is_active': True,
            'is_email_verified': True,
            'role': role_map.get('Employee'),
            'department_id': dept_map.get('IT').id if 'IT' in dept_map else None
        },
        {
            'username': 'carol-cheboi',
            'email': 'ccheboi@assetinventory.com',
            'first_name': 'Carol',
            'last_name': 'Cheboi',
            'password': 'carol@123!',
            'is_active': True,
            'is_email_verified': True,
            'role': role_map.get('Employee'),
            'department_id': dept_map.get('HR').id if 'HR' in dept_map else None
        },
        {
            'username': 'david-maingi',
            'email': 'dmaingi@assetinventory.com',
            'first_name': 'David',
            'last_name': 'Maingi',
            'password': 'david@123!',
            'is_active': True,
            'is_email_verified': True,
            'role': role_map.get('Employee'),
            'department_id': dept_map.get('FIN').id if 'FIN' in dept_map else None
        },
        {
            'username': 'mwenda-zake',
            'email': 'mwendazake@assetinventory.com',
            'first_name': 'Mwenda',
            'last_name': 'Zake',
            'password': 'mwenda@123!',
            'is_active': False,
            'is_email_verified': False,
            'role': role_map.get('Employee'),
            'department_id': dept_map.get('OPS').id if 'OPS' in dept_map else None
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
    print(f"   ✓ Created {len(users)} users with department assignments")
    return users


def assign_managers_to_departments(users, departments):
    """Assign managers to departments they manage (set manager_id on departments)"""
    try:
        # Find managers by username
        manager1 = next((u for u in users if u.username == 'managermkubwa'), None)
        manager2 = next((u for u in users if u.username == 'managermdogo'), None)
        
        # Find departments by code
        it_dept = next((d for d in departments if d.department_code == 'IT'), None)
        hr_dept = next((d for d in departments if d.department_code == 'HR'), None)
        
        # Assign managers to departments
        if manager1 and it_dept:
            it_dept.manager_id = manager1.id
            db.session.add(it_dept)
            print(f"   ✓ Assigned {manager1.username} as manager of {it_dept.name}")
        
        if manager2 and hr_dept:
            hr_dept.manager_id = manager2.id
            db.session.add(hr_dept)
            print(f"   ✓ Assigned {manager2.username} as manager of {hr_dept.name}")
        
        db.session.commit()
            
    except Exception as e:
        print(f"   ⚠ Error assigning managers: {str(e)}")
        db.session.rollback()


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
            'asset_type_id': laptop_type.id,
            'category_id': it_category.id,
            'description': 'High-performance laptop for development',
            'serial_number': 'SN-MACBOOK-001',
            'purchase_date': datetime.now() - timedelta(days=180),
            'purchase_price': 2500.00,
            'current_value': 2000.00,
            'location': 'Office - IT Department',
            'assigned_to': employees[0].id if employees else None,
            'status': 'Assigned',
            'condition': 'Good',
            'vendor_id': vendor1.id if vendor1 else None,
            'department_id': it_dept.id if it_dept else None,
            'created_by': admin_user.id
        },
        {
            'asset_name': 'Dell XPS 15 Laptop',
            'asset_code': 'LAPTOP-002',
            'asset_type_id': laptop_type.id,
            'category_id': it_category.id,
            'description': 'Premium laptop for design work',
            'serial_number': 'SN-DELL-XPS-001',
            'purchase_date': datetime.now() - timedelta(days=200),
            'purchase_price': 2000.00,
            'current_value': 1600.00,
            'location': 'Office - Design Team',
            'assigned_to': employees[1].id if len(employees) > 1 else None,
            'status': 'Assigned',
            'condition': 'Good',
            'vendor_id': vendor1.id if vendor1 else None,
            'department_id': it_dept.id if it_dept else None,
            'created_by': admin_user.id
        },
        {
            'asset_name': 'iMac 27" 2023',
            'asset_code': 'DESKTOP-001',
            'asset_type_id': desktop_type.id,
            'category_id': it_category.id,
            'description': 'All-in-one desktop for office use',
            'serial_number': 'SN-IMAC-001',
            'purchase_date': datetime.now() - timedelta(days=150),
            'purchase_price': 1800.00,
            'current_value': 1500.00,
            'location': 'Office - General Area',
            'assigned_to': None,
            'status': 'Available',
            'condition': 'Good',
            'vendor_id': vendor1.id if vendor1 else None,
            'department_id': it_dept.id if it_dept else None,
            'created_by': admin_user.id
        },
        {
            'asset_name': 'LG 27" 4K Monitor',
            'asset_code': 'MONITOR-001',
            'asset_type_id': monitor_type.id,
            'category_id': it_category.id,
            'description': '4K Ultra HD Monitor',
            'serial_number': 'SN-LG-MONITOR-001',
            'purchase_date': datetime.now() - timedelta(days=120),
            'purchase_price': 450.00,
            'current_value': 380.00,
            'location': 'Office - IT Department',
            'assigned_to': employees[0].id if employees else None,
            'status': 'Assigned',
            'condition': 'Good',
            'vendor_id': vendor1.id if vendor1 else None,
            'department_id': it_dept.id if it_dept else None,
            'created_by': admin_user.id
        },
        {
            'asset_name': 'Ergonomic Office Chair - Black',
            'asset_code': 'CHAIR-001',
            'asset_type_id': chair_type.id,
            'category_id': furniture_category.id,
            'description': 'Comfortable ergonomic chair with lumbar support',
            'serial_number': 'SN-CHAIR-BLACK-001',
            'purchase_date': datetime.now() - timedelta(days=300),
            'purchase_price': 350.00,
            'current_value': 280.00,
            'location': 'Office - Executive Area',
            'assigned_to': employees[0].id if employees else None,
            'status': 'Assigned',
            'condition': 'Fair',
            'vendor_id': vendor2.id if vendor2 else None,
            'department_id': hr_dept.id if hr_dept else None,
            'created_by': admin_user.id
        },
        {
            'asset_name': 'Ergonomic Office Chair - Gray',
            'asset_code': 'CHAIR-002',
            'asset_type_id': chair_type.id,
            'category_id': furniture_category.id,
            'description': 'Comfortable ergonomic chair with lumbar support',
            'serial_number': 'SN-CHAIR-GRAY-001',
            'purchase_date': datetime.now() - timedelta(days=280),
            'purchase_price': 350.00,
            'current_value': 300.00,
            'location': 'Office - General Area',
            'assigned_to': None,
            'status': 'Available',
            'condition': 'Good',
            'vendor_id': vendor2.id if vendor2 else None,
            'department_id': hr_dept.id if hr_dept else None,
            'created_by': admin_user.id
        },
        {
            'asset_name': 'Standing Desk - Oak',
            'asset_code': 'DESK-001',
            'asset_type_id': next((t.id for t in asset_types if 'Desk' in t.name), asset_types[7].id),
            'category_id': furniture_category.id,
            'description': 'Electric height-adjustable standing desk',
            'serial_number': 'SN-DESK-OAK-001',
            'purchase_date': datetime.now() - timedelta(days=250),
            'purchase_price': 600.00,
            'current_value': 500.00,
            'location': 'Office - Executive Area',
            'assigned_to': employees[1].id if len(employees) > 1 else None,
            'status': 'Assigned',
            'condition': 'Good',
            'vendor_id': vendor2.id if vendor2 else None,
            'department_id': hr_dept.id if hr_dept else None,
            'created_by': admin_user.id
        },
        {
            'asset_name': 'HP LaserJet Pro Printer',
            'asset_code': 'PRINTER-001',
            'asset_type_id': next((t.id for t in asset_types if 'Printer' in t.name), asset_types[3].id),
            'category_id': it_category.id,
            'description': 'Network printer for office use',
            'serial_number': 'SN-HP-PRINTER-001',
            'purchase_date': datetime.now() - timedelta(days=365),
            'purchase_price': 800.00,
            'current_value': 600.00,
            'location': 'Office - Common Area',
            'assigned_to': None,
            'status': 'Available',
            'condition': 'Good',
            'vendor_id': vendor1.id if vendor1 else None,
            'department_id': it_dept.id if it_dept else None,
            'created_by': admin_user.id
        },
    ]
    
    for asset_data in assets_data:
        asset = Asset(**asset_data)
        db.session.add(asset)
    
    db.session.commit()
    print(f"   ✓ Created {len(assets_data)} sample assets")

    print("   📊 Generating barcodes...")
    all_assets = Asset.query.all()
    for asset in all_assets:
        asset.generate_barcode()
        asset.generate_qr_code()
        db.session.add(asset)
    
    db.session.commit()
    print(f"   ✓ Generated barcodes for {len(all_assets)} assets")


def create_reports(users):
    """Create sample service reports"""

    if not Report:
        print("   ⚠ Report model not found, skipping reports creation")
        return []

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


def print_seed_summary(users, roles, departments):
    """Print summary of seeded data"""
    
    print("=" * 70)
    print("🎉 SEED DATA SUMMARY")
    print("=" * 70)
    
    print("\n📋 ROLES:")
    for role in roles:
        user_count = len(role.users) if hasattr(role, 'users') and role.users else 0
        print(f"   • {role.name} (Level {role.hierarchy_level}) - {user_count} users")
    
    print("\n🏛️  DEPARTMENTS:")
    for dept in departments:
        manager_name = f"{dept.manager.first_name} {dept.manager.last_name}" if dept.manager else "No Manager"
        print(f"   • {dept.code}: {dept.name} (Manager: {manager_name})")
    
    print("\n👥 TEST USERS & ASSIGNMENTS:")
    print("   Username              Role              Department")
    print("   " + "-" * 67)
    for user in users:
        role_name = user.role.name if user.role else "None"
        dept_name = user.department.name if user.department else "None"
        print(f"   {user.username:<20} {role_name:<15} {dept_name}")
    
    print("\n🔐 LOGIN CREDENTIALS (All verified users ready to login):")
    print("   Admin (Super Admin): admin / Admin@123!")
    print("   Admin: teresa / Teresa@123!")
    print("   Manager (IT): managermkubwa / Manager@123!")
    print("   Manager (HR): managermdogo / Manager@123!")
    print("   Employees: alice-kamongo, kevin-wamalwa, carol-cheboi, david-maingi")
    print("   ⚠ mwenda-zake is inactive/unverified (demo purposes)")
    
    print("\n" + "=" * 70)
    print("✨ Database seeding complete! Ready for testing.")
    print("=" * 70 + "\n")


if __name__ == '__main__':
    seed_database()