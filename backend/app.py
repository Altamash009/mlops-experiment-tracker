from flask import Flask
from flask_cors import CORS
from routes.runs import runs_bp
from routes.parameters import (
    parameters_bp
)
from routes.metrics import metrics_bp
from routes.artifacts import artifacts_bp
from routes.model_registry import registry_bp
from routes.dashboard import dashboard_bp
import models

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
    
app.register_blueprint(
    dashboard_bp,
    url_prefix="/dashboard"
)

@app.route("/")
def home():
    return {
        "message": "MLOps Tracker Running"
    }


if __name__ == "__main__":
    app.run(debug=True)