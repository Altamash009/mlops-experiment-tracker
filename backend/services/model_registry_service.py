from models.model_registry import RegisteredModel
from models.run import Run
from models.project import Project
from models.metric import Metric
from utils.model_stages import MODEL_STAGES
from utils.metric_rules import METRIC_RULES

# Function to register a model from a completed run
def register_model(db, current_user, data):

    run_id = data.get("run_id")
    model_name = data.get("model_name")
    description = data.get("description")

    if not run_id or not model_name:
        return {
            "error": "run_id and model_name are required."
        }, 400

    # Verify the run belongs to the authenticated user
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

    # A completed/failed run should be registerable.
    # We only prevent registration from a currently running experiment,
    # because the final model should come from a finished run.
    if run.status == "RUNNING":
        return {
            "error": "Cannot register a model from a RUNNING run. End the run first."
        }, 400

    # Find the latest version for this model within this project
    latest_model = (
        db.query(RegisteredModel)
        .join(Run)
        .filter(
            Run.project_id == run.project_id,
            RegisteredModel.model_name == model_name
        )
        .order_by(
            RegisteredModel.version.desc()
        )
        .first()
    )

    next_version = (
        latest_model.version + 1
        if latest_model
        else 1
    )

    registered_model = RegisteredModel(
        run_id=run.run_id,
        model_name=model_name,
        version=next_version,
        stage="Development",
        description=description
    )

    db.add(registered_model)
    db.commit()
    db.refresh(registered_model)

    return {
        "message": "Model registered successfully.",
        "model": {
            "model_id": registered_model.model_id,
            "run_id": registered_model.run_id,
            "model_name": registered_model.model_name,
            "version": registered_model.version,
            "stage": registered_model.stage,
            "description": registered_model.description,
            "registered_at": registered_model.registered_at
        }
    }, 201


# Function to retrieve all registered models for a specific project
def get_project_models(db, current_user, project_id):

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

    models = (
        db.query(RegisteredModel)
        .join(Run)
        .filter(
            Run.project_id == project_id
        )
        .order_by(
            RegisteredModel.model_name,
            RegisteredModel.version.desc()
        )
        .all()
    )

    result = []

    for model in models:

        result.append({
            "model_id": model.model_id,
            "run_id": model.run_id,
            "model_name": model.model_name,
            "version": model.version,
            "stage": model.stage,
            "description": model.description,
            "registered_at": model.registered_at
        })

    return {
        "project_id": project.project_id,
        "project_name": project.project_name,
        "total_models": len(result),
        "models": result
    }, 200



from utils.model_stages import MODEL_STAGES

# Function to update the stage of a registered model
def promote_model(db, current_user, model_id):

    model = (
        db.query(RegisteredModel)
        .join(Run)
        .join(Project)
        .filter(
            RegisteredModel.model_id == model_id,
            Project.user_id == current_user.user_id
        )
        .first()
    )

    if model is None:
        return {
            "error": "Registered model not found."
        }, 404

    if model.stage == "Development":
        model.stage = "Staging"

    elif model.stage == "Staging":

        existing_production = (
            db.query(RegisteredModel)
            .join(Run)
            .filter(
                Run.project_id == model.run.project_id,
                RegisteredModel.model_name == model.model_name,
                RegisteredModel.stage == "Production",
                RegisteredModel.model_id != model.model_id
            )
            .all()
        )

        for production_model in existing_production:
            production_model.stage = "Archived"

        model.stage = "Production"

    elif model.stage == "Production":
        return {
            "error": "Model is already in Production."
        }, 400

    elif model.stage == "Archived":
        return {
            "error": "Archived models must be restored using rollback."
        }, 400

    db.commit()
    db.refresh(model)

    return {
        "message": "Model promoted successfully.",
        "model": {
            "model_id": model.model_id,
            "run_id": model.run_id,
            "model_name": model.model_name,
            "version": model.version,
            "stage": model.stage,
            "description": model.description,
            "registered_at": model.registered_at
        }
    }, 200


# Function to rollback a model to production from archived
def rollback_model(db, current_user, model_id):

    # Find the model and verify ownership
    model = (
        db.query(RegisteredModel)
        .join(Run)
        .join(Project)
        .filter(
            RegisteredModel.model_id == model_id,
            Project.user_id == current_user.user_id
        )
        .first()
    )

    if model is None:

        return {
            "error": "Registered model not found."
        }, 404

    # A rollback target must be archived
    if model.stage != "Archived":

        return {
            "error": "Only Archived models can be rolled back."
        }, 400

    # Find the current production version
    current_production = (
        db.query(RegisteredModel)
        .join(Run)
        .filter(
            Run.project_id == model.run.project_id,
            RegisteredModel.model_name == model.model_name,
            RegisteredModel.stage == "Production"
        )
        .first()
    )

    # Move current production version to Archived
    if current_production:

        current_production.stage = "Archived"

    # Promote selected archived version
    model.stage = "Production"

    db.commit()

    db.refresh(model)

    return {

        "message": "Model rollback completed successfully.",

        "model": {

            "model_id": model.model_id,

            "run_id": model.run_id,

            "model_name": model.model_name,

            "version": model.version,

            "stage": model.stage,

            "description": model.description,

            "registered_at": model.registered_at

        }

    }, 200



# Function to retrieve a specific registered model by its ID
def get_registered_model(db, current_user, model_id):

    model = (
        db.query(RegisteredModel)
        .join(Run)
        .join(Project)
        .filter(
            RegisteredModel.model_id == model_id,
            Project.user_id == current_user.user_id
        )
        .first()
    )

    if model is None:

        return {
            "error": "Registered model not found."
        }, 404

    return {
        "model": {
            "model_id": model.model_id,
            "project_id": model.run.project_id,
            "run_id": model.run_id,
            "model_name": model.model_name,
            "version": model.version,
            "stage": model.stage,
            "description": model.description,
            "registered_at": model.registered_at
        }
    }, 200



# Function to retrieve the history of a specific model by its name within a project
def get_model_history(
    db,
    current_user,
    project_id,
    model_name
):

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

    models = (
        db.query(RegisteredModel)
        .join(Run)
        .filter(
            Run.project_id == project_id,
            RegisteredModel.model_name == model_name
        )
        .order_by(
            RegisteredModel.version.desc()
        )
        .all()
    )

    return {
        "project_id": project_id,
        "project_name": project.project_name,
        "model_name": model_name,
        "total_versions": len(models),
        "versions": [
            {
                "model_id": model.model_id,
                "run_id": model.run_id,
                "version": model.version,
                "stage": model.stage,
                "description": model.description,
                "registered_at": model.registered_at
            }
            for model in models
        ]
    }, 200



# Function to retrieve the leaderboard of a specific model based on a metric
def get_model_leaderboard(
    db,
    current_user,
    project_id,
    model_name,
    metric_name="accuracy",
    top=3
):

    # --------------------------------------------------
    # 1. Verify project ownership
    # --------------------------------------------------

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

    # --------------------------------------------------
    # 2. Validate top
    # --------------------------------------------------

    if top <= 0:

        return {
            "error": "top must be greater than 0."
        }, 400

    # --------------------------------------------------
    # 3. Validate metric
    # --------------------------------------------------

    if metric_name not in METRIC_RULES:

        return {
            "error": (
                f"Unsupported metric. "
                f"Supported metrics: {list(METRIC_RULES.keys())}"
            )
        }, 400

    # --------------------------------------------------
    # 4. Get all registered versions of this model
    # --------------------------------------------------

    models = (
        db.query(RegisteredModel)
        .join(Run)
        .filter(
            Run.project_id == project_id,
            RegisteredModel.model_name == model_name
        )
        .all()
    )

    leaderboard = []

    # --------------------------------------------------
    # 5. Get the latest value of the requested metric
    #    for each model version
    # --------------------------------------------------

    for model in models:

        metric = (
            db.query(Metric)
            .filter(
                Metric.run_id == model.run_id,
                Metric.metric_name == metric_name
            )
            .order_by(
                Metric.step.desc()
            )
            .first()
        )

        if metric is None:
            continue

        leaderboard.append({

            "model_id": model.model_id,

            "version": model.version,

            "run_id": model.run_id,

            "stage": model.stage,

            "metric_name": metric_name,

            "metric_value": metric.metric_value,

            "metric_step": metric.step

        })

    # --------------------------------------------------
    # 6. Sort according to metric rule
    # --------------------------------------------------

    sort_rule = METRIC_RULES[metric_name]

    leaderboard.sort(
        key=lambda item: item["metric_value"],
        reverse=(sort_rule == "higher")
    )

    # --------------------------------------------------
    # 7. Return top N
    # --------------------------------------------------

    leaderboard = leaderboard[:top]

    return {

        "project_id": project.project_id,

        "project_name": project.project_name,

        "model_name": model_name,

        "metric": metric_name,

        "metric_rule": sort_rule,

        "top": top,

        "leaderboard": leaderboard

    }, 200