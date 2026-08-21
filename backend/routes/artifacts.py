from flask import Blueprint, request

from models.database import SessionLocal

from utils.auth import jwt_required

from services.artifact_service import (
    upload_artifact,
    get_run_artifacts,
    generate_artifact_download,
    delete_artifact
)


artifacts_bp = Blueprint(
    "artifacts",
    __name__
)


@artifacts_bp.route(
    "/upload",
    methods=["POST"]
)
@jwt_required
def upload_artifact_route(current_user):

    db = SessionLocal()

    try:

        run_id = request.form.get("run_id")
        artifact_type = request.form.get(
            "artifact_type",
            "other"
        )
        description = request.form.get(
            "description"
        )

        file = request.files.get("file")

        if not run_id:

            return {
                "error": "run_id is required."
            }, 400

        try:

            run_id = int(run_id)

        except (TypeError, ValueError):

            return {
                "error": "run_id must be an integer."
            }, 400

        response, status = upload_artifact(
            db=db,
            current_user=current_user,
            run_id=run_id,
            file=file,
            artifact_type=artifact_type,
            description=description
        )

        return response, status

    finally:

        db.close()



@artifacts_bp.route(
    "/run/<int:run_id>",
    methods=["GET"]
)
@jwt_required
def get_run_artifacts_route(current_user, run_id):

    db = SessionLocal()

    try:

        response, status = get_run_artifacts(
            db,
            current_user,
            run_id
        )

        return response, status

    finally:

        db.close()



@artifacts_bp.route(
    "/download/<int:artifact_id>",
    methods=["GET"]
)
@jwt_required
def download_artifact_route(
    current_user,
    artifact_id
):

    db = SessionLocal()

    try:

        response, status = generate_artifact_download(
            db,
            current_user,
            artifact_id
        )

        return response, status

    finally:

        db.close()


@artifacts_bp.route(
    "/<int:artifact_id>",
    methods=["DELETE"]
)
@jwt_required
def delete_artifact_route(current_user, artifact_id):

    db = SessionLocal()

    try:

        response, status = delete_artifact(
            db,
            current_user,
            artifact_id
        )

        return response, status

    finally:

        db.close()