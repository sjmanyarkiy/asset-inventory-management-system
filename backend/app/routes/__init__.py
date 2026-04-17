from app.routes.asset_routes import asset_bp
from app.routes.vendor_routes import vendor_bp
from app.routes.department_routes import department_bp
from app.routes.category_routes import category_bp
from app.routes.type_routes import type_bp


def register_routes(app):
    app.register_blueprint(asset_bp)
    app.register_blueprint(vendor_bp)
    app.register_blueprint(department_bp)
    app.register_blueprint(category_bp)
    app.register_blueprint(type_bp)
    