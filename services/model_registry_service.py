from models.model_registry import (
    ModelRegistry
)
from utils.model_stages import (
    MODEL_STAGES
)

from models.run import Run

# Function to register a model in the model registry
def register_model(
    db,
    model_name,
    version,
    run_id
):

    run = (
        db.query(Run)
        .filter(
            Run.id == run_id
        )
        .first()
    )

    if not run:
        raise ValueError(
            "Run not found"
        )

    registry = ModelRegistry(

        model_name=model_name,

        version=version,

        run_id=run_id,

        stage="Development"
    )

    db.add(registry)

    db.commit()

    db.refresh(registry)

    return registry

# Function to promote a model to the next stage in the model registry
def promote_model(
    db,
    model_id
):

    model = (
        db.query(ModelRegistry)
        .filter(
            ModelRegistry.id == model_id
        )
        .first()
    )

    if not model:
        raise ValueError(
            "Model not found"
        )

    current_index = (
        MODEL_STAGES.index(
            model.stage
        )
    )

    if current_index == (
        len(MODEL_STAGES) - 1
    ):
        raise ValueError(
            "Already in final stage"
        )

    model.stage = MODEL_STAGES[
        current_index + 1
    ]

    db.commit()

    db.refresh(model)

    return model

# Function to get the current production model from the model registry
def get_production_model(db):

    model = (
        db.query(ModelRegistry)
        .filter(
            ModelRegistry.stage == "Production"
        )
        .first()
    )

    if not model:
        raise ValueError(
            "No production model found"
        )

    return model