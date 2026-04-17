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

# Import blueprints
from assetlist.routes import asset_bp
from blueprints.auth import auth_bp

load_dotenv()


def create_app(config_object=None):
    app = Flask(__name__)

    # -------------------
    # Configuration
    # -------------------
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv(
        'DATABASE_URL',
        'postgresql://0xc7a-11@localhost:5432/asset_inventory'
    )
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'jwt-secret-key-change-in-production')

    if config_object:
        app.config.update(config_object)

    # -------------------
    # Extensions
    # -------------------
    db.init_app(app)
    CORS(app, resources={r"/api/*": {"origins": "*"}})
    JWTManager(app)

    # -------------------
    # Blueprints (IMPORTANT FIX)
    # -------------------
    app.register_blueprint(auth_bp, url_prefix="/api")
    app.register_blueprint(asset_bp, url_prefix="/api")

    # -------------------
    # Error handlers
    # -------------------
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({'error': 'Resource not found'}), 404

    @app.errorhandler(500)
    def internal_error(error):
        db.session.rollback()
        return jsonify({'error': 'Internal server error'}), 500

    # -------------------
    # Routes
    # -------------------
    @app.route('/api/health', methods=['GET'])
    def health_check():
        return jsonify({'status': 'ok', 'message': 'Asset Inventory API is running'}), 200

    @app.route('/api', methods=['GET'])
    def home():
        return jsonify({'message': 'Asset Inventory Backend is running!'}), 200

    # -------------------
    # DB init
    # -------------------
    with app.app_context():
        db.create_all()
        create_default_roles()
        print("Database initialized successfully!")

    return app


# -------------------
# Default roles
# -------------------
def create_default_roles():
    from models.role import Role

    if Role.query.first():
        return

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
        db.session.add(Role(**role_data))

    db.session.commit()
    print("Default roles created successfully!")


# -------------------
# Run server
# -------------------
if __name__ == '__main__':
    app = create_app()

    debug = os.getenv('FLASK_ENV') == 'development'
    app.run(
        host='0.0.0.0',
        port=int(os.getenv('PORT', 5000)),
        debug=debug
    )