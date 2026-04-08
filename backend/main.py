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
    CORS(app)

    # PostgreSQL connection
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    # Initialize extensions
    db.init_app(app)
    migrate = Migrate(app, db)  # ✅ ADD THIS

    # Register routes
    register_routes(app)

    @app.route("/")
    def home():
        return jsonify({"message": "Backend running with PostgreSQL"})

    return app


app = create_app()


if __name__ == "__main__":
    app.run(debug=os.getenv("FLASK_DEBUG", "True") == "True")