from models.run import Run
from datetime import datetime

# Function to create a new run in the database 
def create_run(db, experiment_name):

    run = Run(
        experiment_name=experiment_name
    )

    db.add(run)
    db.commit()
    db.refresh(run)

    return run

# Function to end a run in the database by updating its status and end time
def end_run(db, run_id):

    run = db.query(Run).filter(
        Run.id == run_id
    ).first()

    if not run:
        return None

    run.status = "COMPLETED"
    run.end_time = datetime.utcnow()

    db.commit()
    db.refresh(run)

    return run

# Function to retrieve runs from the database with optional pagination and status filtering
def get_runs(
    db,
    page=1,
    limit=10,
    status=None
):

    query = db.query(Run)

    if status:
        query = query.filter(
            Run.status == status
        )

    total = query.count()

    runs = (
        query
        .order_by(Run.created_at.desc())
        .offset((page - 1) * limit)
        .limit(limit)
        .all()
    )

    return runs, total

# Function to retrieve a run by its ID from the database
def get_run_by_id(db, run_id):

    run = (
        db.query(Run)
        .filter(Run.id == run_id)
        .first()
    )

    return run

# Function to compare two runs by their IDs and return them if they exist in the database
def compare_runs(
    db,
    run1_id,
    run2_id
):

    run1 = (
        db.query(Run)
        .filter(Run.id == run1_id)
        .first()
    )

    run2 = (
        db.query(Run)
        .filter(Run.id == run2_id)
        .first()
    )

    if not run1:
        raise ValueError(
            f"Run {run1_id} not found"
        )

    if not run2:
        raise ValueError(
            f"Run {run2_id} not found"
        )

    return run1, run2