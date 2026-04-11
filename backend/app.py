"""
Main Flask application entry point
Asset Inventory Management System
"""

from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv
import os
from extensions import db

# Load environment variables
load_dotenv()


def create_app(config_object=None):
    """
    Application factory function
    Creates and configures the Flask app
    """
    # Initialize Flask app
    app = Flask(__name__)

    # Default configuration
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv(
        'DATABASE_URL',
        'postgresql://0xc7a-11@localhost:5432/asset_inventory'
    )
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'jwt-secret-key-change-in-production')

    # Allow overriding config for tests or deployments
    if config_object:
        app.config.update(config_object)

    # Initialize extensions
    db.init_app(app)
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # Initialize JWT
    jwt = JWTManager(app)

    # Import models AFTER db initialization
    from models.user import User
    from models.role import Role
    from models.asset import Asset
    from models.audit_log import AuditLog

    # Import blueprints
    from blueprints.auth import auth_bp
    # from blueprints.admin import admin_bp

    # Register blueprints
    app.register_blueprint(auth_bp)
    # app.register_blueprint(admin_bp)

    # Error handlers
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({'error': 'Resource not found'}), 404

    @app.errorhandler(500)
    def internal_error(error):
        db.session.rollback()
        return jsonify({'error': 'Internal server error'}), 500

    # Health check endpoint
    @app.route('/health', methods=['GET'])
    def health_check():
        return jsonify({'status': 'ok', 'message': 'Asset Inventory API is running'}), 200

    # Home endpoint
    @app.route('/', methods=['GET'])
    def home():
        return jsonify({'message': 'Asset Inventory Backend is running!'}), 200

    # Database initialization with app context
    with app.app_context():
        db.create_all()
        create_default_roles(app)
        print("Database initialized successfully!")

    return app


def create_default_roles(app):
    """Create default system roles"""
    from models.role import Role

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
    print("Default roles created successfully!")


if __name__ == '__main__':
    # Create app instance
    app = create_app()

    # Run the app
    debug = os.getenv('FLASK_ENV') == 'development'
    app.run(
        host='0.0.0.0',
        port=int(os.getenv('PORT', 5000)),
        debug=debug
    )