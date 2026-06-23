from flask import (
    Blueprint,
    request,
    jsonify
)

from models.database import SessionLocal

from services.model_registry_service import (
    register_model,
    promote_model,
    get_production_model
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