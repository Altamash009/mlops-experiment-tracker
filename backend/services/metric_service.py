from models.metric import Metric
from models.run import Run
from models.project import Project


def log_metric(db, current_user, data):

    run = (
        db.query(Run)
        .join(Project)
        .filter(
            Run.run_id == data["run_id"],
            Project.user_id == current_user.user_id
        )
        .first()
    )

    if run is None:

        return {
            "error": "Run not found."
        }, 404

    if run.status != "RUNNING":

        return {
            "error": "Cannot log metrics. Run has already ended."
        }, 400

    metric_name = data.get("metric_name")
    metric_value = data.get("metric_value")
    step = data.get("step", 0)

    if not metric_name or metric_value is None:

        return {
            "error": "metric_name and metric_value are required."
        }, 400

    try:

        metric_value = float(metric_value)

    except (ValueError, TypeError):

        return {
            "error": "metric_value must be numeric."
        }, 400

    try:

        step = int(step)

    except (ValueError, TypeError):

        return {
            "error": "step must be an integer."
        }, 400

    if step < 0:

        return {
            "error": "step cannot be negative."
        }, 400

    existing = (
        db.query(Metric)
        .filter(
            Metric.run_id == run.run_id,
            Metric.metric_name == metric_name,
            Metric.step == step
        )
        .first()
    )

    if existing:

        return {
            "error": "Metric already exists for this step."
        }, 409

    metric = Metric(

        run_id=run.run_id,

        metric_name=metric_name,

        metric_value=metric_value,

        step=step

    )

    db.add(metric)

    db.commit()

    db.refresh(metric)

    return {

        "message": "Metric logged successfully.",

        "metric": {

            "metric_id": metric.metric_id,

            "metric_name": metric.metric_name,

            "metric_value": metric.metric_value,

            "step": metric.step,

            "logged_at": metric.logged_at

        }

    }, 201



def get_run_metrics(db, current_user, run_id):

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

    metrics = (
        db.query(Metric)
        .filter(
            Metric.run_id == run_id
        )
        .order_by(
            Metric.metric_name,
            Metric.step
        )
        .all()
    )

    result = []

    for metric in metrics:

        result.append({

            "metric_id": metric.metric_id,

            "metric_name": metric.metric_name,

            "metric_value": metric.metric_value,

            "step": metric.step,

            "logged_at": metric.logged_at

        })

    return {

        "run_id": run.run_id,

        "run_name": run.run_name,

        "total_metrics": len(result),

        "metrics": result

    }, 200