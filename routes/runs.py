from flask import Blueprint, request, jsonify

from models.database import SessionLocal
from services.run_service import (
    create_run,
    end_run,
    get_runs,
    get_run_by_id
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

# API endpoint to list runs with optional pagination and status filtering
@runs_bp.route(
    "",
    methods=["GET"]
)
def list_runs():

    page = int(
        request.args.get("page", 1)
    )

    limit = int(
        request.args.get("limit", 10)
    )

    status = request.args.get(
        "status"
    )

    db = SessionLocal()

    try:

        runs, total = get_runs(
            db,
            page,
            limit,
            status
        )

        return jsonify({
            "total": total,
            "page": page,
            "runs": [
                {
                    "id": run.id,
                    "experiment_name": run.experiment_name,
                    "status": run.status,
                    "created_at": run.created_at
                }
                for run in runs
            ]
        })

    finally:
        db.close()

# API endpoint to get details of a specific run by its ID
@runs_bp.route(
    "/<int:run_id>",
    methods=["GET"]
)
def get_run(run_id):

    db = SessionLocal()

    try:

        run = get_run_by_id(
            db,
            run_id
        )

        if not run:
            return jsonify({
                "error": "Run not found"
            }), 404

        return jsonify({

            "id": run.id,

            "experiment_name":
                run.experiment_name,

            "status":
                run.status,

            "parameters": [
                {
                    "name": p.param_name,
                    "value": p.param_value
                }
                for p in run.parameters
            ],

            "metrics": [
                {
                    "name": m.metric_name,
                    "value": m.metric_value
                }
                for m in run.metrics
            ]
        })

    finally:
        db.close()