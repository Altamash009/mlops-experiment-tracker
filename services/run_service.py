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