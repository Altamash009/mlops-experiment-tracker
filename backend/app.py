from flask import Flask
from flask_cors import CORS

from routes.auth import auth_bp
from routes.projects import projects_bp
from routes.runs import runs_bp
from routes.parameters import parameters_bp
from routes.metrics import metrics_bp
from routes.artifacts import artifacts_bp
from routes.model_registry import registry_bp

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

app.register_blueprint(
    projects_bp,
    url_prefix="/projects"
)

app.register_blueprint(
    runs_bp,
    url_prefix="/runs"
)

app.register_blueprint(
    parameters_bp,
    url_prefix="/parameters"
)

app.register_blueprint(
    metrics_bp,
    url_prefix="/metrics"
)

app.register_blueprint(
    artifacts_bp,
    url_prefix="/artifacts"
)

app.register_blueprint(
    registry_bp,
    url_prefix="/registry"
)

@app.route("/")
def home():
    return {
        "message": "MLOps Tracker Backend Running"
    }

if __name__ == "__main__":
    app.run(debug=True)