from dotenv import load_dotenv
load_dotenv()

from flask import Flask, jsonify
from flask_cors import CORS
import os

from app import db
from flask_migrate import Migrate
from app.routes import register_routes


def create_app():
    app = Flask(__name__)

    # =========================
    # 🔥 FIXED CORS CONFIG
    # =========================
    CORS(
        app,
        resources={r"/*": {
            "origins": "http://localhost:5173",
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"]
        }}
    )

    # =========================
    # 🔥 PREVENT TRAILING SLASH REDIRECT ISSUES
    # =========================
    app.url_map.strict_slashes = False

    # =========================
    # DATABASE CONFIG
    # =========================
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    # =========================
    # INIT EXTENSIONS
    # =========================
    db.init_app(app)
    Migrate(app, db)

    # =========================
    # REGISTER ROUTES
    # =========================
    register_routes(app)

    # =========================
    # HEALTH CHECK ROUTE
    # =========================
    @app.route("/")
    def home():
        return jsonify({
            "message": "Backend running with PostgreSQL"
        })

    return app


app = create_app()

if __name__ == "__main__":
    app.run(
        debug=os.getenv("FLASK_DEBUG", "True") == "True",
        host="0.0.0.0",
        port=5000
    )