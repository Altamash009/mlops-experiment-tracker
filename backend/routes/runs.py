from flask import Blueprint, request, jsonify

from models.database import SessionLocal
from services.run_service import (
    create_run,
    end_run,
    get_runs,
    get_run_by_id,
    compare_runs,
    build_metric_comparison,
    get_best_run
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


# API to compare two runs by their IDs and return their details side by side
@runs_bp.route(
    "/compare",
    methods=["GET"]
)
def compare_two_runs():

    run1_id = request.args.get(
        "run1"
    )

    run2_id = request.args.get(
        "run2"
    )

    if not run1_id or not run2_id:

        return jsonify({
            "error":
            "run1 and run2 are required"
        }), 400

    db = SessionLocal()

    try:

        run1, run2 = compare_runs(
            db,
            int(run1_id),
            int(run2_id)
        )

        metric_comparison = (
            build_metric_comparison(
                run1,
                run2
            )
        )

        return jsonify({

            "run_1": {
                "id": run1.id,
                "experiment_name":
                    run1.experiment_name
            },

            "run_2": {
                "id": run2.id,
                "experiment_name":
                    run2.experiment_name
            },

            "metric_comparison":
                metric_comparison
        })

    except ValueError as e:

        return jsonify({
            "error": str(e)
        }), 404

    finally:

        db.close()

# API endpoint to get the best run based on a specific metric
@runs_bp.route(
    "/best",
    methods=["GET"]
)
def best_run():

    metric_name = request.args.get(
        "metric"
    )

    if not metric_name:

        return jsonify({
            "error":
            "metric required"
        }), 400

    db = SessionLocal()

    try:

        best_metric = get_best_run(
            db,
            metric_name
        )

        run = best_metric.run

        return jsonify({

            "run_id":
                run.id,

            "experiment_name":
                run.experiment_name,

            "metric":
                metric_name,

            "value":
                best_metric.metric_value
        })

    except ValueError as e:

        return jsonify({
            "error": str(e)
        }), 404

    finally:

        db.close()