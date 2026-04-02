from flask import Flask, jsonify
from flask_cors import CORS
import os

from backend.models import db
from backend.reports import bp as reports_bp
from backend.auth import bp as auth_bp
from flask_jwt_extended import JWTManager


def create_app(config_object=None):
    app = Flask(__name__)
    CORS(app)
    app.config.from_mapping({
        "SQLALCHEMY_DATABASE_URI": os.getenv("DATABASE_URL", "sqlite:///data.db"),
        "SQLALCHEMY_TRACK_MODIFICATIONS": False,
    })
    # allow overriding config for tests or deployments
    if config_object:
        app.config.update(config_object)

    db.init_app(app)
    # JWT setup
    app.config.setdefault("JWT_SECRET_KEY", os.getenv("JWT_SECRET_KEY", "dev-secret"))
    jwt = JWTManager()
    jwt.init_app(app)

    app.register_blueprint(reports_bp)
    app.register_blueprint(auth_bp)

    @app.route("/")
    def home():
        return jsonify({"message": "Backend is running!"})

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(debug=True)
