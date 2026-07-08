from flask import Blueprint, request

from models.database import SessionLocal

from utils.auth import jwt_required

from services.metric_service import (
    log_metric,
    get_run_metrics
)

metrics_bp = Blueprint(
    "metrics",
    __name__
)


@metrics_bp.route(
    "/log",
    methods=["POST"]
)
@jwt_required
def log_metric_route(current_user):

    db = SessionLocal()

    try:

        data = request.get_json()

        response, status = log_metric(
            db,
            current_user,
            data
        )

        return response, status

    finally:

        db.close()


@metrics_bp.route(
    "/run/<int:run_id>",
    methods=["GET"]
)
@jwt_required
def get_run_metrics_route(current_user, run_id):

    db = SessionLocal()

    try:

        response, status = get_run_metrics(
            db,
            current_user,
            run_id
        )

        return response, status

    finally:

        db.close()