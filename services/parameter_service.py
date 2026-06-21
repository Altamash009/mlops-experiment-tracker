from models.parameter import Parameter


def log_parameter(
    db,
    run_id,
    param_name,
    param_value
):

    parameter = Parameter(
        run_id=run_id,
        param_name=param_name,
        param_value=str(param_value)
    )

    db.add(parameter)

    db.commit()

    db.refresh(parameter)

    return parameter