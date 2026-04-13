"""
Main Flask application entry point
Asset Inventory Management System
"""

from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
import os
from extensions import db

# Load environment variables
load_dotenv()

# Fix Render's postgres:// to postgresql://
database_url = os.getenv('DATABASE_URL', 'postgresql://user:password@localhost:5432/asset_inventory')
if database_url.startswith('postgres://'):
    database_url = database_url.replace('postgres://', 'postgresql://', 1)


# Initialize Flask app
app = Flask(__name__)

# Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = database_url


app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'jwt-secret-key-change-in-production')

db.init_app(app)

# Initialize extensions
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Import models and blueprints AFTER db initialization
from models.user import User
from models.role import Role
from models.asset import Asset
from models.audit_log import AuditLog
from blueprints.auth import auth_bp
# from blueprints.admin import admin_bp
from assetlist.routes import asset_bp
from flask_jwt_extended import JWTManager

jwt = JWTManager(app)

# Register blueprints
app.register_blueprint(auth_bp)
# app.register_blueprint(admin_bp)
app.register_blueprint(asset_bp, url_prefix='/api')

# Initialize database
def init_db():
    """Initialize database with tables"""
    with app.app_context():
        db.create_all()
        create_default_roles()
        print("Database initialized successfully!")

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return {'error': 'Resource not found'}, 404

@app.errorhandler(500)
def internal_error(error):
    db.session.rollback()
    return {'error': 'Internal server error'}, 500

# Health check endpoint
@app.route('/health', methods=['GET'])
def health_check():
    return {'status': 'ok', 'message': 'Asset Inventory API is running'}, 200

def create_default_roles():
    """Create default system roles"""
    if Role.query.first():
        return  # Roles already exist
    
    roles_data = [
        {
            'name': 'Super Admin',
            'description': 'Full system access',
            'hierarchy_level': 0,
            'is_system': True,
            'permissions': {
                'manage_users': True,
                'manage_roles': True,
                'manage_permissions': True,
                'view_audit_logs': True,
                'manage_assets': True,
                'manage_requests': True
            }
        },
        {
            'name': 'Admin',
            'description': 'Can manage users and assign roles',
            'hierarchy_level': 1,
            'is_system': True,
            'permissions': {
                'manage_users': True,
                'manage_assets': True,
                'manage_requests': True,
                'view_audit_logs': True
            }
        },
        {
            'name': 'Manager',
            'description': 'Can approve requests and manage assets',
            'hierarchy_level': 2,
            'is_system': True,
            'permissions': {
                'approve_requests': True,
                'manage_assets': True,
                'view_reports': True
            }
        },
        {
            'name': 'Employee',
            'description': 'Standard employee access',
            'hierarchy_level': 3,
            'is_system': True,
            'permissions': {
                'request_assets': True,
                'view_assets': True,
                'create_service_requests': True
            }
        }
    ]
    
    for role_data in roles_data:
        role = Role(**role_data)
        db.session.add(role)

    db.session.commit()

if __name__ == '__main__':
    # Initialize database on first run
    init_db()
    
    # Run the app
    debug = os.getenv('FLASK_ENV') == 'development'
    app.run(
        host='0.0.0.0',
        port=int(os.getenv('PORT', 5000)),
        debug=debug
    )