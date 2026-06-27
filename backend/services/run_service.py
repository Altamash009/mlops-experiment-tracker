from models.run import Run
from datetime import datetime
from models.metric import Metric
from utils.metric_rules import (
    METRIC_RULES
)

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


# Function to build a comparison of metrics between two runs and determine the winner for each metric
def build_metric_comparison(
    run1,
    run2
):

    comparison = {}

    run1_metrics = {
        metric.metric_name:
        metric.metric_value

        for metric in run1.metrics
    }

    run2_metrics = {
        metric.metric_name:
        metric.metric_value

        for metric in run2.metrics
    }

    metric_names = set(
        run1_metrics.keys()
    ).union(
        run2_metrics.keys()
    )

    for metric_name in metric_names:

        value1 = run1_metrics.get(
            metric_name
        )

        value2 = run2_metrics.get(
            metric_name
        )

        winner = None

        if (
            value1 is not None
            and value2 is not None
        ):

            if value1 > value2:
                winner = "run1"

            elif value2 > value1:
                winner = "run2"

            else:
                winner = "tie"

        comparison[
            metric_name
        ] = {

            "run1":
                value1,

            "run2":
                value2,

            "winner":
                winner
        }

    return comparison

# Function to get the best run based on a specific metric and its associated rule (higher or lower is better)
def get_best_run(
    db,
    metric_name
):

    metrics = (
        db.query(Metric)
        .filter(
            Metric.metric_name
            == metric_name
        )
        .all()
    )

    if not metrics:
        raise ValueError(
            "Metric not found"
        )

    rule = METRIC_RULES.get(
        metric_name,
        "higher"
    )

    if rule == "higher":

        best_metric = max(
            metrics,
            key=lambda m:
            m.metric_value
        )

    else:

        best_metric = min(
            metrics,
            key=lambda m:
            m.metric_value
        )

    return best_metric