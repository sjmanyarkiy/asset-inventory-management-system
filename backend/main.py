from dotenv import load_dotenv
load_dotenv()

from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
from flask_migrate import Migrate
import os

from app import db
from app.routes import register_routes


def _parse_allowed_origins():
    configured_origins = os.getenv("CORS_ORIGINS", "")
    configured_frontend_url = os.getenv("FRONTEND_URL", "")

    origins = {
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    }

    for raw in [configured_origins, configured_frontend_url]:
        if not raw:
            continue
        for item in raw.split(","):
            normalized = item.strip().rstrip("/")
            if normalized:
                origins.add(normalized)

    return sorted(origins)


def create_app():
    app = Flask(__name__)

    # =========================
    # CORS CONFIG
    # =========================
    CORS(
        app,
        resources={
            r"/*": {
                "origins": _parse_allowed_origins(),
                "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
                "allow_headers": ["Content-Type", "Authorization"],
            }
        },
    )

    # =========================
    # STRICT SLASHES OFF
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
    # IMAGE UPLOAD SERVING (ERP FIX)
    # =========================
    UPLOAD_FOLDER = os.path.join(os.getcwd(), "uploads")

    @app.route('/uploads/<path:filename>')
    def uploaded_file(filename):
        return send_from_directory(UPLOAD_FOLDER, filename)

    # =========================
    # HEALTH CHECK
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
        port=int(os.getenv("PORT", "5001"))
    )