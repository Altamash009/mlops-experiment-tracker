from flask import Blueprint, jsonify

from models.database import SessionLocal

from models.run import Run
from models.artifact import Artifact
from models.model_registry import ModelRegistry
from sqlalchemy import func

from models.metric import Metric

dashboard_bp = Blueprint(
    "dashboard",
    __name__,
)

# Route to get the summary of the dashboard
@dashboard_bp.route(
    "/summary",
    methods=["GET"]
)
def dashboard_summary():

    db = SessionLocal()

    total_runs = db.query(Run).count()

    running_runs = (
        db.query(Run)
        .filter(
            Run.status == "RUNNING"
        )
        .count()
    )

    registered_models = (
        db.query(ModelRegistry)
        .count()
    )

    production_models = (
        db.query(ModelRegistry)
        .filter(
            ModelRegistry.stage == "Production"
        )
        .count()
    )

    artifacts = (
        db.query(Artifact)
        .count()
    )

    latest_run = (
        db.query(Run)
        .order_by(
            Run.id.desc()
        )
        .first()
    )

    latest_model = (
        db.query(ModelRegistry)
        .order_by(
            ModelRegistry.id.desc()
        )
        .first()
    )

    db.close()

    return jsonify({

        "total_runs": total_runs,

        "running_runs": running_runs,

        "registered_models": registered_models,

        "production_models": production_models,

        "artifacts": artifacts,

        "latest_run": (
            latest_run.experiment_name
            if latest_run
            else None
        ),

        "latest_model": (
            latest_model.model_name
            if latest_model
            else None
        )

    })


# Route to get the recent runs
@dashboard_bp.route(
    "/recent-runs",
    methods=["GET"]
)
def recent_runs():

    db = SessionLocal()

    runs = (
        db.query(Run)
        .order_by(Run.id.desc())
        .limit(10)
        .all()
    )

    response = []

    for run in runs:

        response.append({

            "run_id": run.id,

            "experiment_name": run.experiment_name,

            "status": run.status,

            "start_time": run.start_time,

            "end_time": run.end_time

        })

    db.close()

    return jsonify(response)


# Route to get the analytics data
@dashboard_bp.route(
    "/analytics",
    methods=["GET"]
)
def dashboard_analytics():

    db = SessionLocal()

    accuracy_metrics = (

        db.query(Metric)

        .filter(
            Metric.metric_name == "accuracy"
        )

        .order_by(
            Metric.run_id
        )

        .all()

    )

    accuracy_trend = []

    for metric in accuracy_metrics:

        accuracy_trend.append({

            "run_id": metric.run_id,

            "value": metric.metric_value

        })

    status_counts = (

        db.query(

            Run.status,

            func.count(Run.id)

        )

        .group_by(
            Run.status
        )

        .all()

    )

    status_distribution = {}

    for status, count in status_counts:

        status_distribution[status] = count

    top_models = (

        db.query(
            ModelRegistry.model_name,
            ModelRegistry.version,
            Metric.metric_value
        )

        .join(
            Metric,
            Metric.run_id == ModelRegistry.run_id
        )

        .filter(
            Metric.metric_name == "accuracy"
        )

        .order_by(
            Metric.metric_value.desc()
        )

        .limit(5)

        .all()

    )

    leaderboard = []

    for model in top_models:

        leaderboard.append({

            "model_name": model.model_name,

            "version": model.version,

            "accuracy": model.metric_value

        })

    db.close()

    return jsonify({

        "metric_trends": {

            "accuracy": accuracy_trend

        },

        "status_distribution": status_distribution,

        "top_models": leaderboard

    })