from models.artifact import Artifact
from models.run import Run


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