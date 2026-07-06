from flask import Blueprint, request

from models.database import SessionLocal

from utils.auth import jwt_required

from services.run_service import(
    start_run,
    end_run
)

runs_bp = Blueprint(
    "runs",
    __name__
)


@runs_bp.route(
    "/start",
    methods=["POST"]
)
@jwt_required
def start_run_route(current_user):

    db = SessionLocal()

    try:

        data = request.get_json()

        response, status = start_run(
            db,
            current_user,
            data
        )

        return response, status

    finally:

        db.close()


@runs_bp.route(
    "/end/<int:run_id>",
    methods=["POST"]
)
@jwt_required
def end_run_route(current_user, run_id):

    db = SessionLocal()

    try:

        data = request.get_json() or {}

        response, status = end_run(
            db,
            current_user,
            run_id,
            data
        )

        return response, status

    finally:

        db.close()