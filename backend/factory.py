"""
Main Flask application entry point
Asset Inventory Management System
"""

from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_migrate import Migrate

from extensions import db
from config import get_config


def create_app(config_object=None):
    """
    Application factory function
    Creates and configures the Flask app
    """
    app = Flask(__name__)

    # Configuration - Load from config.py based on environment
    if config_object:
        app.config.from_object(get_config(config_object))
    else:
        app.config.from_object(get_config())
    
    # Override with environment variables if present
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', app.config.get('SECRET_KEY', 'dev-secret-key-change-in-production'))
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', app.config.get('JWT_SECRET_KEY', 'jwt-secret-key-change-in-production'))
    app.config['RESEND_API_KEY'] = os.getenv('RESEND_API_KEY')
    app.config['FRONTEND_URL'] = os.getenv('FRONTEND_URL', 'http://localhost:3000')

    # =========================
    # PREVENT TRAILING SLASH REDIRECT ISSUES
    # =========================
    app.url_map.strict_slashes = False

    # Initialize extensions
    db.init_app(app)
    
    # CORS Configuration - Allow both local development and Render URLs
    allowed_origins = os.getenv(
        "CORS_ORIGINS",
        "http://localhost:5173,http://localhost:3000"
    ).split(",")

    CORS(
        app,
        origins=allowed_origins,
        methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
        allow_headers=["Content-Type", "Authorization"],
        supports_credentials=True
    )
    print(f"DEBUG: CORS allowed origins = {allowed_origins}") 

    @app.before_request
    def handle_options():
        if request.method == "OPTIONS":
            return jsonify(), 200

    # CORS(
    #     app,
    #     resources={r"/*": {
    #         "origins": allowed_origins,
    #         "methods": ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    #         "allow_headers": ["Content-Type", "Authorization"],
    #         "supports_credentials": True
    #     }}
    # )
    # CORS(app, 
    #      origins=["http://localhost:5173", "http://localhost:3000"],
    #      methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    #      allow_headers=["Content-Type", "Authorization"],
    #      supports_credentials=True
    # )
    # print("✓ CORS enabled for localhost:5173 and localhost:3000")

    jwt = JWTManager(app)

    # Import models
    from models.user import User
    from models.role import Role
    from models.asset import Asset
    from models.audit_log import AuditLog
    from models.asset_type import AssetType
    from models.asset_category import AssetCategory
    from models.department import Department
    from models.vendor import Vendor
    from models.asset_request import AssetRequest
    from models.repair_request import RepairRequest
    

    # Import blueprints
    from blueprints.assets import assets_bp
    from blueprints.admin import admin_bp
    from blueprints.reports import reports_bp
    from blueprints.requests import requests_bp
    from blueprints.auth import auth_bp
    from blueprints.asset_types_routes import asset_types_bp
    from blueprints.review_routes import review_bp
    from blueprints.department_routes import department_bp
    from blueprints.category_routes import category_bp
    from blueprints.asset_types_routes import asset_types_bp
    from blueprints.type_routes import type_bp
    from blueprints.vendor_routes import vendor_bp

    migrate = Migrate(app, db)

    # Register blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(assets_bp, url_prefix="/api")       
    app.register_blueprint(admin_bp, url_prefix="/api")        
    app.register_blueprint(reports_bp, url_prefix="/api")      
    app.register_blueprint(requests_bp, url_prefix="/api")    
    app.register_blueprint(asset_types_bp, url_prefix="/api") 
    app.register_blueprint(review_bp, url_prefix="/api") 

    app.register_blueprint(department_bp, url_prefix="/api") 
    app.register_blueprint(category_bp, url_prefix="/api")
    app.register_blueprint(vendor_bp, url_prefix="/api")
    app.register_blueprint(type_bp, url_prefix="/api")

    # Error handlers
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({'error': 'Resource not found'}), 404

    @app.errorhandler(500)
    def internal_error(error):
        db.session.rollback()
        return jsonify({'error': 'Internal server error'}), 500

    # Routes
    @app.route('/health', methods=['GET'])
    def health_check():
        return jsonify({'status': 'ok', 'message': 'Asset Inventory API is running'}), 200

    @app.route('/', methods=['GET'])
    def home():
        return jsonify({'message': 'Asset Inventory Backend is running!'}), 200
    
    @app.route('/debug/users', methods=['GET'])
    def debug_users():
        from models.user import User

        users = User.query.all()

        return jsonify({
            "count": len(users),
            "users": [
                {
                    "id": u.id,
                    "username": u.username,
                    "email": u.email,
                    "role_id": u.role_id
                }
                for u in users
            ]
        })

    # Initialize DB
    with app.app_context():
        db.create_all()
        create_default_roles()
        print("Database initialized successfully!")

    print("REGISTERED ROUTES:")
    print(app.url_map)  

    @app.route('/debug/seed', methods=['GET'])
    def seed_db():
        from seed import create_users  # or your seed function

        create_users()
        return {"message": "Seeding complete"}

    return app


def create_default_roles():
    """Create default system roles"""
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
        role = Role(**role_data)
        db.session.add(role)

    db.session.commit()
    print("Default roles created successfully!")


# app = create_app()

if __name__ == '__main__':
    app = create_app()

    debug = os.getenv('FLASK_ENV') == 'development'
    app.run(
        host='0.0.0.0',
        port=int(os.getenv('PORT', 5000)),
        debug=debug
    )

    print(app.url_map)