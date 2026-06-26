from models.artifact import Artifact
from models.run import Run
import os
from werkzeug.utils import secure_filename
import hashlib

# Function to log an artifact
def log_artifact(
    db,
    run_id,
    file_name,
    file_type,
    storage_uri
):

    run = (
        db.query(Run)
        .filter(Run.id == run_id)
        .first()
    )

    if not run:
        raise ValueError(
            "Run not found"
        )

    if run.status == "COMPLETED":
        raise ValueError(
            "Run already completed"
        )

    artifact = Artifact(
        run_id=run_id,
        file_name=file_name,
        file_type=file_type,
        storage_type="LOCAL",
        storage_uri=storage_uri
    )

    db.add(artifact)

    db.commit()

    db.refresh(artifact)

    return artifact

# Function to calculate the checksum of a file
def calculate_checksum(file_path):

    sha256 = hashlib.sha256()

    with open(file_path, "rb") as file:

        while True:

            chunk = file.read(4096)

            if not chunk:
                break

            sha256.update(chunk)

    return sha256.hexdigest()

# Function to upload an artifact file
def upload_artifact(
    db,
    run_id,
    uploaded_file
):
    filename = secure_filename(
        uploaded_file.filename
    )

    version = get_next_artifact_version(
        db,
        run_id,
        filename
    )

    storage_filename = (
        f"v{version}_{filename}"
    )

    storage_path = os.path.join(
        "artifacts_storage",
        storage_filename
    )

    uploaded_file.save(
        storage_path
    )

    file_size = os.path.getsize(
        storage_path
    )

    checksum = calculate_checksum(storage_path)

    artifact = Artifact(
        run_id=run_id,
        file_name=filename,
        file_type=filename.split(".")[-1],
        storage_type="LOCAL",
        storage_uri=storage_path,
        artifact_version=version,
        file_size=file_size,
        checksum=checksum
    )

    db.add(artifact)

    db.commit()

    db.refresh(artifact)

    return artifact

# Function to retrieve an artifact by its ID
def get_artifact_by_id(
    db,
    artifact_id
):

    return (
        db.query(Artifact)
        .filter(
            Artifact.id == artifact_id
        )
        .first()
    )

# Function to get the next artifact version for a given run and file name
def get_next_artifact_version(
    db,
    run_id,
    file_name
):

    latest = (
        db.query(Artifact)
        .filter(
            Artifact.run_id == run_id,
            Artifact.file_name == file_name
        )
        .order_by(
            Artifact.artifact_version.desc()
        )
        .first()
    )

    if latest:

        return latest.artifact_version + 1

    return 1

# Function to get the latest artifact for a given run and file name
def get_latest_artifact(
    db,
    run_id,
    file_name
):

    return (
        db.query(Artifact)
        .filter(
            Artifact.run_id == run_id,
            Artifact.file_name == file_name
        )
        .order_by(
            Artifact.artifact_version.desc()
        )
        .first()
    )