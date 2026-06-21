from models.metric import Metric


def log_metric(
    db,
    run_id,
    metric_name,
    metric_value
):

    metric = Metric(
        run_id=run_id,
        metric_name=metric_name,
        metric_value=metric_value
    )

    db.add(metric)

    db.commit()

    db.refresh(metric)

    return metric