from flask import Flask, jsonify
from flask_cors import CORS
from app import db   # ✅ import from package, not define here

def create_app():
    app = Flask(__name__)
    CORS(app)

    # PostgreSQL connection
    app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:Admin%40123@localhost:5432/asset_db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    db.init_app(app)

    # Import models
    from app.models.asset_category import AssetCategory
    from app.models.asset_type import AssetType
    from app.models.asset import Asset
    from app.models.vendors import Vendor
    from app.models.departments import Department

    with app.app_context():
        db.create_all()

    @app.route("/")
    def home():
        return jsonify({"message": "Backend running with PostgreSQL"})

    return app


app = create_app()

if __name__ == "__main__":
    app.run(debug=True)