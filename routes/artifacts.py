from flask import (
    Blueprint,
    request,
    jsonify
)

from models.database import SessionLocal

from services.artifact_service import (
    log_artifact
)

artifacts_bp = Blueprint(
    "artifacts",
    __name__
)


@artifacts_bp.route(
    "/log",
    methods=["POST"]
)
def create_artifact():

    data = request.get_json()

    db = SessionLocal()

    try:

        artifact = log_artifact(
            db,
            data["run_id"],
            data["file_name"],
            data["file_type"],
            data["storage_uri"]
        )

        return jsonify({
            "message": "Artifact logged",
            "artifact_id": artifact.id
        })

    except ValueError as e:

        return jsonify({
            "error": str(e)
        }), 400

    finally:
        db.close()