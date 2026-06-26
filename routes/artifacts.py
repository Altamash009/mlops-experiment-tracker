from flask import send_file
import os
from models.artifact import Artifact
from flask import (
    Blueprint,
    request,
    jsonify
)

from models.database import SessionLocal

from services.artifact_service import (
    log_artifact,
    upload_artifact,
    get_artifact_by_id
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


@artifacts_bp.route(
    "/upload",
    methods=["POST"]
)
def upload():

    run_id = request.form.get(
        "run_id"
    )

    uploaded_file = request.files.get(
        "file"
    )

    if not run_id:

        return jsonify({
            "error":"run_id required"
        }), 400

    if not uploaded_file:

        return jsonify({
            "error":"file required"
        }), 400
    
    db = SessionLocal()

    try:
        artifact = upload_artifact(
            db,
            int(run_id),
            uploaded_file
        )

        return jsonify({

            "artifact_id":
                artifact.id,

            "file_name":
                artifact.file_name,

            "storage_uri":
                artifact.storage_uri
        })
    except ValueError as e:
        return jsonify({
            "error": str(e)
        }), 400
    finally:
        db.close()

# Route to download an artifact file
@artifacts_bp.route(
    "/download/<int:artifact_id>",
    methods=["GET"]
)
def download_artifact(artifact_id):

    db = SessionLocal()

    try:

        artifact = get_artifact_by_id(
            db,
            artifact_id
        )

        if not artifact:

            return jsonify({
                "error": "Artifact not found"
            }), 404

        if not os.path.exists(
            artifact.storage_uri
        ):

            return jsonify({
                "error": "Artifact file missing from storage"
            }), 404

        return send_file(
            artifact.storage_uri,
            as_attachment=True,
            download_name=artifact.file_name
        )

    finally:

        db.close()