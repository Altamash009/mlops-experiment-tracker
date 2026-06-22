from models.parameter import Parameter


def log_parameter(
    db,
    run_id,
    param_name,
    param_value
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

    # Log parameter after validation that run exists and is not completed
    parameter = Parameter(
        run_id=run_id,
        param_name=param_name,
        param_value=str(param_value)
    )

    db.add(parameter)

    db.commit()

    db.refresh(parameter)

    return parameter