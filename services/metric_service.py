from models.metric import Metric


def log_metric(
    db,
    run_id,
    metric_name,
    metric_value
):
    # Check if run exists and is not completed
    from models.run import Run
    run = db.query(Run).filter(
        Run.id == run_id
    ).first()

    if not run:
        raise ValueError(
            "Run not found"
        )

    if run.status == "COMPLETED":
        raise ValueError(
            "Run already completed"
        )
    
    # Log metric after validation that run exists and is not completed
    metric = Metric(
        run_id=run_id,
        metric_name=metric_name,
        metric_value=metric_value
    )

    db.add(metric)

    db.commit()

    db.refresh(metric)

    return metric