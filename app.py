from flask import Flask
from routes.runs import runs_bp

app = Flask(__name__)

app.register_blueprint(
    runs_bp,
    url_prefix="/runs"
)


@app.route("/")
def home():
    return {
        "message": "MLOps Tracker Running"
    }


if __name__ == "__main__":
    app.run(debug=True)