from app.routes.asset_routes import asset_bp
from app.routes.vendor_routes import vendor_bp
from app.routes.department_routes import department_bp
from app.routes.category_routes import category_bp
from app.routes.type_routes import type_bp


def register_routes(app):
    blueprints = [asset_bp, vendor_bp, department_bp, category_bp, type_bp]

    for bp in blueprints:
        # Legacy routes (e.g., /assets)
        app.register_blueprint(bp)

        # API-prefixed routes (e.g., /api/assets)
        app.register_blueprint(
            bp,
            name=f"api_{bp.name}",
            url_prefix=f"/api{bp.url_prefix or ''}"
        )
    