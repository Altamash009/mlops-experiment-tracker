from flask import Blueprint
from flask import request
from flask import jsonify

from models.database import SessionLocal

from services.parameter_service import (
    log_parameter
)

parameters_bp = Blueprint(
    "parameters",
    __name__
)


@parameters_bp.route(
    "/log",
    methods=["POST"]
)
def create_parameter():

    data = request.get_json()

    db = SessionLocal()

    try:

        parameter = log_parameter(
            db,
            data["run_id"],
            data["param_name"],
            data["param_value"]
        )

        return jsonify({
            "message": "Parameter logged",
            "id": parameter.id
        })

    finally:
        db.close()