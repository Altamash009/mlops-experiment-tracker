from flask import (
    Blueprint,
    request,
    jsonify
)

from models.database import SessionLocal

from services.model_registry_service import (
    register_model,
    promote_model,
    get_production_model,
    get_model_history,
    rollback_model
)

registry_bp = Blueprint(
    "registry",
    __name__
)

# Route to register a model in the model registry
@registry_bp.route(
    "/register",
    methods=["POST"]
)
def create_registry_entry():

    data = request.get_json()

    db = SessionLocal()

    try:

        registry = register_model(

            db,

            data["model_name"],

            data["version"],

            data["run_id"]
        )

        return jsonify({

            "id":
                registry.id,

            "model_name":
                registry.model_name,

            "version":
                registry.version,

            "stage":
                registry.stage
        })

    except ValueError as e:

        return jsonify({
            "error": str(e)
        }), 400

    finally:

        db.close()

# Route to promote a model to the next stage in the model registry
@registry_bp.route(
    "/promote/<int:model_id>",
    methods=["POST"]
)
def promote_registry_model(
    model_id
):

    db = SessionLocal()

    try:

        model = promote_model(
            db,
            model_id
        )

        return jsonify({

            "model_id":
                model.id,

            "model_name":
                model.model_name,

            "version":
                model.version,

            "stage":
                model.stage
        })

    except ValueError as e:

        return jsonify({
            "error": str(e)
        }), 400

    finally:

        db.close()

# Route to get the production model from the model registry
@registry_bp.route(
    "/production/<string:model_name>",
    methods=["GET"]
)
def production_model(
    model_name
):

    db = SessionLocal()

    try:

        model = get_production_model(
            db,
            model_name
        )

        return jsonify({

            "id":
                model.id,

            "model_name":
                model.model_name,

            "version":
                model.version,

            "stage":
                model.stage,

            "run_id":
                model.run_id
        })

    except ValueError as e:

        return jsonify({
            "error": str(e)
        }), 404

    finally:
        db.close()


# Route to get the model history from the model registry
@registry_bp.route(
    "/history/<string:model_name>",
    methods=["GET"]
)
def model_history(
    model_name
):

    db = SessionLocal()

    try:

        models = get_model_history(
            db,
            model_name
        )

        result = []

        for model in models:

            metrics = {}

            if model.run:

                for metric in model.run.metrics:

                    metrics[
                        metric.metric_name
                    ] = metric.metric_value

            result.append({

                "id":
                    model.id,

                "model_name":
                    model.model_name,

                "version":
                    model.version,

                "stage":
                    model.stage,

                "run_id":
                    model.run_id,

                "metrics":
                    metrics,

                "created_at":
                    model.created_at
            })

        return jsonify(result)

    except ValueError as e:

        return jsonify({
            "error": str(e)
        }), 404

    finally:

        db.close()


# Route to rollback a model to the previous stage in the model registry
@registry_bp.route(
    "/rollback/<int:model_id>",
    methods=["POST"]
)
def rollback(
    model_id
):

    db = SessionLocal()

    try:

        model = rollback_model(
            db,
            model_id
        )

        return jsonify({

            "model_name":
                model.model_name,

            "version":
                model.version,

            "stage":
                model.stage
        })

    except ValueError as e:

        return jsonify({
            "error":
            str(e)
        }), 404

    finally:

        db.close()