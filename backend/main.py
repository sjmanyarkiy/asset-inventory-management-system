from dotenv import load_dotenv
load_dotenv()

from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
from flask_migrate import Migrate
import os

from app import db
from app.routes import register_routes


def create_app():
    app = Flask(__name__)

    # =========================
    # CORS CONFIG
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
        port=5000
    )