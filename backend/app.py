from flask import Flask
from flask_cors import CORS

from routes.auth import auth_bp
from utils.auth import jwt_required

app = Flask(__name__)

CORS(
    app,
    resources={
        r"/*": {
            "origins": [
                "http://localhost:3000"
            ]
        }
    }
)

app.register_blueprint(
    auth_bp,
    url_prefix="/auth"
)

@app.route("/me")
@jwt_required
def me(current_user):

    return {
        "id": current_user.user_id,
        "name": current_user.name,
        "email": current_user.email
    }

@app.route("/")
def home():
    return {
        "message": "MLOps Tracker Backend Running"
    }

if __name__ == "__main__":
    app.run(debug=True)