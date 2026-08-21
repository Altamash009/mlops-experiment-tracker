from datetime import datetime

from models.run import Run
from models.project import Project
from models.parameter import Parameter
from models.metric import Metric
from models.artifact import Artifact
from models.model_registry import RegisteredModel

from utils.metric_rules import METRIC_RULES

def generate_run_name():

    return datetime.now().strftime(
        "Run-%Y%m%d-%H%M%S"
    )


def start_run(db, current_user, data):

    project = (
        db.query(Project)
        .filter(
            Project.project_id == data["project_id"],
            Project.user_id == current_user.user_id
        )
        .first()
    )

    if project is None:

        return {
            "error": "Project not found."
        }, 404

    run_name = data.get("run_name")

    if not run_name:

        run_name = generate_run_name()

    run = Run(

        project_id=project.project_id,

        run_name=run_name,

        notes=data.get("notes"),

        status="RUNNING"
    )

    db.add(run)

    db.commit()

    db.refresh(run)

    return {

        "message": "Run started successfully.",

        "run": {

            "run_id": run.run_id,

            "project_id": run.project_id,

            "run_name": run.run_name,

            "status": run.status,

            "start_time": run.start_time

        }

    }, 201


def end_run(db, current_user, run_id, data):

    run = (
        db.query(Run)
        .join(Project)
        .filter(
            Run.run_id == run_id,
            Project.user_id == current_user.user_id
        )
        .first()
    )

    if run is None:

        return {
            "error": "Run not found."
        }, 404

    if run.status != "RUNNING":

        return {
            "error": "Run has already ended."
        }, 400

    run.status = data.get("status", "COMPLETED")

    run.end_time = datetime.utcnow()

    db.commit()

    db.refresh(run)

    return {

        "message": "Run ended successfully.",

        "run": {

            "run_id": run.run_id,

            "status": run.status,

            "start_time": run.start_time,

            "end_time": run.end_time

        }

    }, 200


def get_project_runs(db, current_user, project_id):

    project = (
        db.query(Project)
        .filter(
            Project.project_id == project_id,
            Project.user_id == current_user.user_id
        )
        .first()
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
            Run.start_time.desc()
        )
        .all()
    )

    result = []

    for run in runs:

        result.append({

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

        "total_runs": len(result),

        "runs": result

    }, 200




def get_run_details(db, current_user, run_id):

    run = (
        db.query(Run)
        .join(Project)
        .filter(
            Run.run_id == run_id,
            Project.user_id == current_user.user_id
        )
        .first()
    )

    if run is None:
        return {
            "error": "Run not found."
        }, 404

    # --------------------------------------------------
    # Parameters
    # --------------------------------------------------

    parameters = (
        db.query(Parameter)
        .filter(
            Parameter.run_id == run.run_id
        )
        .order_by(
            Parameter.parameter_id
        )
        .all()
    )

    parameter_map = {}

    for parameter in parameters:
        parameter_map[parameter.param_name] = parameter.param_value

    # --------------------------------------------------
    # Metrics
    # --------------------------------------------------

    metrics = (
        db.query(Metric)
        .filter(
            Metric.run_id == run.run_id
        )
        .order_by(
            Metric.metric_name,
            Metric.step
        )
        .all()
    )

    grouped_metrics = {}

    for metric in metrics:

        if metric.metric_name not in grouped_metrics:
            grouped_metrics[metric.metric_name] = []

        grouped_metrics[metric.metric_name].append({
            "metric_id": metric.metric_id,
            "step": metric.step,
            "value": metric.metric_value,
            "logged_at": metric.logged_at
        })

    # --------------------------------------------------
    # Artifacts
    # --------------------------------------------------

    artifacts = (
        db.query(Artifact)
        .filter(
            Artifact.run_id == run.run_id
        )
        .order_by(
            Artifact.uploaded_at.desc()
        )
        .all()
    )

    artifact_list = []

    for artifact in artifacts:

        artifact_list.append({
            "artifact_id": artifact.artifact_id,
            "artifact_name": artifact.artifact_name,
            "artifact_type": artifact.artifact_type,
            "description": artifact.description,
            "storage_path": artifact.storage_path,
            "file_size": artifact.file_size,
            "checksum": artifact.checksum,
            "uploaded_at": artifact.uploaded_at
        })

    # --------------------------------------------------
    # Registered Models
    # --------------------------------------------------

    registered_models = (
        db.query(RegisteredModel)
        .filter(
            RegisteredModel.run_id == run.run_id
        )
        .order_by(
            RegisteredModel.version.desc()
        )
        .all()
    )

    registered_model_list = []

    for model in registered_models:

        registered_model_list.append({
            "model_id": model.model_id,
            "model_name": model.model_name,
            "version": model.version,
            "stage": model.stage,
            "description": model.description,
            "registered_at": model.registered_at
        })

    # --------------------------------------------------
    # Final response
    # --------------------------------------------------

    return {
        "run": {
            "run_id": run.run_id,
            "project_id": run.project_id,
            "run_name": run.run_name,
            "status": run.status,
            "notes": run.notes,
            "start_time": run.start_time,
            "end_time": run.end_time,
            "parameters": parameter_map,
            "metrics": grouped_metrics,
            "artifacts": artifact_list,
            "registered_models": registered_model_list
        }
    }, 200




def compare_runs(db, current_user, data):

    run_ids = data.get("run_ids")

    if not isinstance(run_ids, list) or len(run_ids) < 2:
        return {
            "error": "run_ids must contain at least two run IDs."
        }, 400

    try:
        run_ids = [int(run_id) for run_id in run_ids]
    except (TypeError, ValueError):
        return {
            "error": "run_ids must contain valid integers."
        }, 400

    if len(set(run_ids)) != len(run_ids):
        return {
            "error": "Duplicate run IDs are not allowed."
        }, 400

    runs = (
        db.query(Run)
        .join(Project)
        .filter(
            Run.run_id.in_(run_ids),
            Project.user_id == current_user.user_id
        )
        .all()
    )

    if len(runs) != len(run_ids):
        return {
            "error": "One or more runs were not found or are not accessible."
        }, 404

    project_ids = {run.project_id for run in runs}

    if len(project_ids) != 1:
        return {
            "error": "Runs must belong to the same project."
        }, 400

    run_map = {run.run_id: run for run in runs}

    metrics = (
        db.query(Metric)
        .filter(Metric.run_id.in_(run_ids))
        .order_by(
            Metric.run_id,
            Metric.metric_name,
            Metric.step
        )
        .all()
    )

    parameters = (
        db.query(Parameter)
        .filter(Parameter.run_id.in_(run_ids))
        .order_by(
            Parameter.run_id,
            Parameter.parameter_id
        )
        .all()
    )

    comparison = []

    for run_id in run_ids:

        run = run_map[run_id]

        run_metrics = {}
        run_parameters = {}

        for metric in metrics:

            if metric.run_id != run_id:
                continue

            run_metrics.setdefault(
                metric.metric_name,
                []
            ).append({
                "step": metric.step,
                "value": metric.metric_value,
                "logged_at": metric.logged_at
            })

        for parameter in parameters:

            if parameter.run_id != run_id:
                continue

            run_parameters[
                parameter.param_name
            ] = parameter.param_value

        comparison.append({
            "run_id": run.run_id,
            "run_name": run.run_name,
            "status": run.status,
            "start_time": run.start_time,
            "end_time": run.end_time,
            "parameters": run_parameters,
            "metrics": run_metrics
        })

    return {
        "project_id": next(iter(project_ids)),
        "run_ids": run_ids,
        "runs": comparison
    }, 200




def get_best_run(
    db,
    current_user,
    project_id,
    metric_name="accuracy"
):

    if metric_name not in METRIC_RULES:
        return {
            "error": (
                f"Unsupported metric. "
                f"Supported metrics: {list(METRIC_RULES.keys())}"
            )
        }, 400

    project = (
        db.query(Project)
        .filter(
            Project.project_id == project_id,
            Project.user_id == current_user.user_id
        )
        .first()
    )

    if project is None:
        return {
            "error": "Project not found."
        }, 404

    runs = (
        db.query(Run)
        .filter(
            Run.project_id == project_id,
            Run.status == "COMPLETED"
        )
        .all()
    )

    candidates = []

    for run in runs:

        metric = (
            db.query(Metric)
            .filter(
                Metric.run_id == run.run_id,
                Metric.metric_name == metric_name
            )
            .order_by(
                Metric.step.desc()
            )
            .first()
        )

        if metric is None:
            continue

        candidates.append({
            "run_id": run.run_id,
            "run_name": run.run_name,
            "status": run.status,
            "metric_name": metric_name,
            "metric_value": metric.metric_value,
            "metric_step": metric.step
        })

    if not candidates:
        return {
            "error": (
                f"No completed runs contain metric '{metric_name}'."
            )
        }, 404

    sort_rule = METRIC_RULES[metric_name]

    candidates.sort(
        key=lambda item: item["metric_value"],
        reverse=(sort_rule == "higher")
    )

    best = candidates[0]

    return {
        "project_id": project.project_id,
        "project_name": project.project_name,
        "metric": metric_name,
        "metric_rule": sort_rule,
        "best_run": best
    }, 200