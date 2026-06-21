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