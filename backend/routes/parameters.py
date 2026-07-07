from flask import Blueprint, request

from models.database import SessionLocal

from utils.auth import jwt_required

from services.parameter_service import (
    log_parameter,
    get_run_parameters
)

parameters_bp = Blueprint(
    "parameters",
    __name__
)


@parameters_bp.route(
    "/log",
    methods=["POST"]
)
@jwt_required
def log_parameter_route(current_user):

    db = SessionLocal()

    try:

        data = request.get_json()

        response, status = log_parameter(
            db,
            current_user,
            data
        )

        return response, status

    finally:

        db.close()


@parameters_bp.route(
    "/run/<int:run_id>",
    methods=["GET"]
)
@jwt_required
def get_run_parameters_route(current_user, run_id):

    db = SessionLocal()

    try:

        response, status = get_run_parameters(
            db,
            current_user,
            run_id
        )

        return response, status

    finally:

        db.close()