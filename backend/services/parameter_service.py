from models.parameter import Parameter
from models.run import Run
from models.project import Project


def log_parameter(db, current_user, data):

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
            "error": "Cannot log parameters. Run has already ended."
        }, 400

    existing = (
        db.query(Parameter)
        .filter(
            Parameter.run_id == run.run_id,
            Parameter.param_name == data["param_name"]
        )
        .first()
    )

    if existing:

        return {
            "error": "Parameter already exists for this run."
        }, 409

    parameter = Parameter(

        run_id=run.run_id,

        param_name=data["param_name"],

        param_value=str(data["param_value"])

    )

    db.add(parameter)

    db.commit()

    db.refresh(parameter)

    return {

        "message": "Parameter logged successfully.",

        "parameter": {

            "parameter_id": parameter.parameter_id,

            "run_id": parameter.run_id,

            "param_name": parameter.param_name,

            "param_value": parameter.param_value

        }

    }, 201



def get_run_parameters(db, current_user, run_id):

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

    parameters = (
        db.query(Parameter)
        .filter(
            Parameter.run_id == run_id
        )
        .order_by(Parameter.parameter_id)
        .all()
    )

    result = []

    for parameter in parameters:

        result.append({

            "parameter_id": parameter.parameter_id,

            "param_name": parameter.param_name,

            "param_value": parameter.param_value

        })

    return {

        "run_id": run.run_id,

        "run_name": run.run_name,

        "total_parameters": len(result),

        "parameters": result

    }, 200