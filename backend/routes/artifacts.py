from flask import Blueprint, request

from models.database import SessionLocal

from utils.auth import jwt_required

from services.artifact_service import upload_artifact


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