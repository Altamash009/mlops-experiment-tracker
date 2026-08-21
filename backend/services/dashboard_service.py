from sqlalchemy import func

from models.project import Project
from models.run import Run
from models.artifact import Artifact
from models.metric import Metric
from models.model_registry import RegisteredModel


def get_project(db, current_user, project_id):

    project = (
        db.query(Project)
        .filter(
            Project.project_id == project_id,
            Project.user_id == current_user.user_id
        )
        .first()
    )

    if project is None:
        return None

    return project


def get_dashboard_summary(db, current_user, project_id):

    project = get_project(
        db,
        current_user,
        project_id
    )

    if project is None:
        return {
            "error": "Project not found."
        }, 404

    total_runs = (
        db.query(Run)
        .filter(
            Run.project_id == project_id
        )
        .count()
    )

    running_runs = (
        db.query(Run)
        .filter(
            Run.project_id == project_id,
            Run.status == "RUNNING"
        )
        .count()
    )

    registered_models = (
        db.query(RegisteredModel)
        .join(Run)
        .filter(
            Run.project_id == project_id
        )
        .count()
    )

    production_models = (
        db.query(RegisteredModel)
        .join(Run)
        .filter(
            Run.project_id == project_id,
            RegisteredModel.stage == "Production"
        )
        .count()
    )

    artifacts = (
        db.query(Artifact)
        .join(Run)
        .filter(
            Run.project_id == project_id
        )
        .count()
    )

    latest_run = (
        db.query(Run)
        .filter(
            Run.project_id == project_id
        )
        .order_by(
            Run.run_id.desc()
        )
        .first()
    )

    latest_model = (
        db.query(RegisteredModel)
        .join(Run)
        .filter(
            Run.project_id == project_id
        )
        .order_by(
            RegisteredModel.model_id.desc()
        )
        .first()
    )

    return {
        "project_id": project.project_id,
        "project_name": project.project_name,

        "total_runs": total_runs,

        "running_runs": running_runs,

        "registered_models": registered_models,

        "production_models": production_models,

        "artifacts": artifacts,

        "latest_run": (
            latest_run.run_name
            if latest_run
            else None
        ),

        "latest_model": (
            latest_model.model_name
            if latest_model
            else None
        )
    }, 200


def get_recent_runs(db, current_user, project_id):

    project = get_project(
        db,
        current_user,
        project_id
    )

    if project is None:
        return {
            "error": "Project not found."
        }, 404

    runs = (
        db.query(Run)
        .filter(
            Run.project_id == project_id
        )
        .order_by(
            Run.run_id.desc()
        )
        .limit(10)
        .all()
    )

    response = []

    for run in runs:

        response.append({
            "run_id": run.run_id,
            "run_name": run.run_name,
            "status": run.status,
            "start_time": run.start_time,
            "end_time": run.end_time,
            "notes": run.notes
        })

    return {
        "project_id": project.project_id,
        "project_name": project.project_name,
        "runs": response
    }, 200


def get_dashboard_analytics(
    db,
    current_user,
    project_id
):

    project = get_project(
        db,
        current_user,
        project_id
    )

    if project is None:
        return {
            "error": "Project not found."
        }, 404

    # ----------------------------------------------
    # Accuracy trend
    # ----------------------------------------------

    accuracy_metrics = (
        db.query(Metric)
        .join(Run)
        .filter(
            Run.project_id == project_id,
            Metric.metric_name == "accuracy"
        )
        .order_by(
            Metric.run_id,
            Metric.step
        )
        .all()
    )

    accuracy_trend = []

    for metric in accuracy_metrics:

        accuracy_trend.append({
            "run_id": metric.run_id,
            "step": metric.step,
            "value": metric.metric_value,
            "logged_at": metric.logged_at
        })

    # ----------------------------------------------
    # Run status distribution
    # ----------------------------------------------

    status_counts = (
        db.query(
            Run.status,
            func.count(Run.run_id)
        )
        .filter(
            Run.project_id == project_id
        )
        .group_by(
            Run.status
        )
        .all()
    )

    status_distribution = {}

    for status, count in status_counts:

        status_distribution[status] = count

    # ----------------------------------------------
    # Top registered models by latest accuracy
    # ----------------------------------------------

    registered_models = (
        db.query(RegisteredModel)
        .join(Run)
        .filter(
            Run.project_id == project_id
        )
        .all()
    )

    leaderboard = []

    for model in registered_models:

        latest_accuracy = (
            db.query(Metric)
            .filter(
                Metric.run_id == model.run_id,
                Metric.metric_name == "accuracy"
            )
            .order_by(
                Metric.step.desc()
            )
            .first()
        )

        if latest_accuracy is None:
            continue

        leaderboard.append({
            "model_name": model.model_name,
            "version": model.version,
            "stage": model.stage,
            "accuracy": latest_accuracy.metric_value
        })

    leaderboard.sort(
        key=lambda item: item["accuracy"],
        reverse=True
    )

    leaderboard = leaderboard[:5]

    return {
        "project_id": project.project_id,
        "project_name": project.project_name,

        "metric_trends": {
            "accuracy": accuracy_trend
        },

        "status_distribution": status_distribution,

        "top_models": leaderboard
    }, 200