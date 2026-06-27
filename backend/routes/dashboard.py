from flask import Blueprint, jsonify

from models.database import SessionLocal

from models.run import Run
from models.artifact import Artifact
from models.model_registry import ModelRegistry

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