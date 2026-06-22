from flask import Blueprint
from flask import request
from flask import jsonify

from models.database import SessionLocal

from services.metric_service import (
    log_metric
)

metrics_bp = Blueprint(
    "metrics",
    __name__
)


@metrics_bp.route(
    "/log",
    methods=["POST"]
)
def create_metric():

    data = request.get_json()

    db = SessionLocal()

    try:

        metric = log_metric(
            db,
            data["run_id"],
            data["metric_name"],
            data["metric_value"]
        )

        return jsonify({
            "message": "Metric logged",
            "id": metric.id
        })
    except ValueError as e:

        return jsonify({
            "error": str(e)
        }), 400

    finally:
        db.close()