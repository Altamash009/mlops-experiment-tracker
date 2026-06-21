from flask import Blueprint, request, jsonify

from models.database import SessionLocal
from services.run_service import (
    create_run,
    end_run
)

runs_bp = Blueprint(
    "runs",
    __name__
)

# API endpoint to start a new run
@runs_bp.route(
    "/start",
    methods=["POST"]
)
def start_run():

    data = request.get_json()

    experiment_name = data.get(
        "experiment_name"
    )

    db = SessionLocal()

    try:

        run = create_run(
            db,
            experiment_name
        )

        return jsonify({
            "run_id": run.id,
            "status": run.status
        })

    finally:
        db.close()

# API endpoint to end a run
@runs_bp.route(
    "/end/<int:run_id>",
    methods=["POST"]
)
def finish_run(run_id):

    db = SessionLocal()

    try:

        run = end_run(
            db,
            run_id
        )

        if not run:
            return jsonify({
                "error": "Run not found"
            }), 404

        return jsonify({
            "run_id": run.id,
            "status": run.status
        })

    finally:
        db.close()