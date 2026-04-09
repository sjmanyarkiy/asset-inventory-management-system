from flask import Flask
from flask_cors import CORS
from assetlist.routes import asset_bp

app = Flask(__name__)
CORS(app)

# Register the asset blueprint
app.register_blueprint(asset_bp)

if __name__ == "__main__":
    app.run(debug=True, port=5000)