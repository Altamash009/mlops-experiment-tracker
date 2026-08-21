import hashlib
import time
from pathlib import Path

from models.artifact import Artifact
from models.run import Run
from models.project import Project

from artifact_storage.cloudinary_storage import CloudinaryStorage


storage = CloudinaryStorage()


def calculate_sha256(file):

    sha256 = hashlib.sha256()

    while True:

        chunk = file.read(1024 * 1024)

        if not chunk:
            break

        sha256.update(chunk)

    file.seek(0)

    return sha256.hexdigest()


def upload_artifact(db, current_user, run_id, file, artifact_type, description):

    # --------------------------------------------------
    # 1. Validate run ownership
    # --------------------------------------------------

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
    # 2. Only RUNNING runs can receive artifacts
    # --------------------------------------------------

    if run.status != "RUNNING":

        return {
            "error": "Cannot upload artifacts. Run has already ended."
        }, 400

    # --------------------------------------------------
    # 3. Validate file
    # --------------------------------------------------

    if file is None or not file.filename:

        return {
            "error": "Artifact file is required."
        }, 400

    artifact_name = file.filename

    # --------------------------------------------------
    # 4. Calculate file size
    # --------------------------------------------------

    file.seek(0, 2)

    file_size = file.tell()

    file.seek(0)

    # --------------------------------------------------
    # 5. Calculate SHA-256
    # --------------------------------------------------

    checksum = calculate_sha256(file)

    # --------------------------------------------------
    # 6. Validate artifact type
    # --------------------------------------------------

    allowed_types = {
        "model",
        "dataset",
        "plot",
        "image",
        "report",
        "log",
        "config",
        "other"
    }

    if artifact_type not in allowed_types:

        return {
            "error": (
                "Invalid artifact_type. Allowed values: "
                + ", ".join(sorted(allowed_types))
            )
        }, 400

    # --------------------------------------------------
    # 7. Generate Cloudinary object path
    # --------------------------------------------------

    public_id = (
        f"artifact_{run.run_id}_{checksum[:12]}"
    )

    folder = (
        f"mlops-tracker/"
        f"user-{current_user.user_id}/"
        f"project-{run.project_id}/"
        f"run-{run.run_id}"
    )

    # --------------------------------------------------
    # 8. Upload to Cloudinary
    # --------------------------------------------------

    try:

        storage_result = storage.save(
            file=file,
            public_id=public_id,
            folder=folder
        )

    except Exception as exc:

        return {
            "error": "Artifact upload failed.",
            "details": str(exc)
        }, 500

    # --------------------------------------------------
    # 9. Save artifact metadata in PostgreSQL
    # --------------------------------------------------

    artifact = Artifact(

        run_id=run.run_id,

        artifact_name=artifact_name,

        artifact_type=artifact_type,

        description=description,

        storage_path=storage_result["public_id"],

        file_size=file_size,

        checksum=checksum

    )

    try:

        db.add(artifact)

        db.commit()

        db.refresh(artifact)

    except Exception:

        db.rollback()

        # Try to remove the uploaded Cloudinary object
        try:

            storage.delete(
                public_id=storage_result["public_id"]
            )

        except Exception:

            pass

        return {
            "error": "Failed to save artifact metadata."
        }, 500

    # --------------------------------------------------
    # 10. Return response
    # --------------------------------------------------

    return {

        "message": "Artifact uploaded successfully.",

        "artifact": {

            "artifact_id": artifact.artifact_id,

            "run_id": artifact.run_id,

            "artifact_name": artifact.artifact_name,

            "artifact_type": artifact.artifact_type,

            "description": artifact.description,

            "storage_path": artifact.storage_path,

            "file_size": artifact.file_size,

            "checksum": artifact.checksum,

            "uploaded_at": artifact.uploaded_at

        }

    }, 201


# Function to retrieve artifacts for a specific run, ensuring the user has access to the run
def get_run_artifacts(db, current_user, run_id):

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

    artifacts = (
        db.query(Artifact)
        .filter(
            Artifact.run_id == run_id
        )
        .order_by(
            Artifact.uploaded_at.desc()
        )
        .all()
    )

    result = []

    for artifact in artifacts:

        result.append({
            "artifact_id": artifact.artifact_id,
            "artifact_name": artifact.artifact_name,
            "artifact_type": artifact.artifact_type,
            "description": artifact.description,
            "storage_path": artifact.storage_path,
            "file_size": artifact.file_size,
            "checksum": artifact.checksum,
            "uploaded_at": artifact.uploaded_at
        })

    return {
        "run_id": run.run_id,
        "run_name": run.run_name,
        "total_artifacts": len(result),
        "artifacts": result
    }, 200


# Function to generate a temporary download URL for an artifact, ensuring the user has access to the artifact
def generate_artifact_download(db, current_user, artifact_id):

    artifact = (
        db.query(Artifact)
        .join(Run)
        .join(Project)
        .filter(
            Artifact.artifact_id == artifact_id,
            Project.user_id == current_user.user_id
        )
        .first()
    )

    if artifact is None:

        return {
            "error": "Artifact not found."
        }, 404

    file_format = Path(
        artifact.artifact_name
    ).suffix.lstrip(".")

    if not file_format:

        return {
            "error": "Artifact file format could not be determined."
        }, 400

    # URL valid for 10 minutes
    expires_at = int(time.time()) + 600

    download_url = storage.generate_download_url(
        public_id=artifact.storage_path,
        file_format=file_format,
        expires_at=expires_at
    )

    return {
        "artifact_id": artifact.artifact_id,
        "artifact_name": artifact.artifact_name,
        "expires_at": expires_at,
        "download_url": download_url
    }, 200


# Function to delete an artifact, ensuring the user has access to the artifact and that the associated run is still running
def delete_artifact(db, current_user, artifact_id):

    artifact = (
        db.query(Artifact)
        .join(Run)
        .join(Project)
        .filter(
            Artifact.artifact_id == artifact_id,
            Project.user_id == current_user.user_id
        )
        .first()
    )

    if artifact is None:

        return {
            "error": "Artifact not found."
        }, 404

    run = artifact.run

    if run.status != "RUNNING":

        return {
            "error": "Cannot delete artifacts. Run has already ended."
        }, 400

    try:

        storage.delete(
            public_id=artifact.storage_path,
            resource_type="raw",
            delivery_type="private"
        )

    except Exception:

        return {
            "error": "Failed to delete artifact from storage."
        }, 500

    db.delete(artifact)
    db.commit()

    return {
        "message": "Artifact deleted successfully.",
        "artifact_id": artifact_id
    }, 200