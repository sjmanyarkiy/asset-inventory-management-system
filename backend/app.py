from flask import Flask, jsonify
from flask_cors import CORS
from blueprints.auth import auth_bp
import os


app = Flask(__name__)
CORS(app)

app.register_blueprint(auth_bp)

@app.route("/")
def home():
    return jsonify({"message": "Backend is running!"})

if __name__ == "__main__":
    app.run(debug=False)