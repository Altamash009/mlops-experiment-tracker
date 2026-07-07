from datetime import datetime

from models.run import Run
from models.project import Project

def generate_run_name():

    return datetime.now().strftime(
        "Run-%Y%m%d-%H%M%S"
    )


def start_run(db, current_user, data):

    project = (
        db.query(Project)
        .filter(
            Project.project_id == data["project_id"],
            Project.user_id == current_user.user_id
        )
        .first()
    )

    if project is None:

        return {
            "error": "Project not found."
        }, 404

    run_name = data.get("run_name")

    if not run_name:

        run_name = generate_run_name()

    run = Run(

        project_id=project.project_id,

        run_name=run_name,

        notes=data.get("notes"),

        status="RUNNING"
    )

    db.add(run)

    db.commit()

    db.refresh(run)

    return {

        "message": "Run started successfully.",

        "run": {

            "run_id": run.run_id,

            "project_id": run.project_id,

            "run_name": run.run_name,

            "status": run.status,

            "start_time": run.start_time

        }

    }, 201


def end_run(db, current_user, run_id, data):

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

    if run.status != "RUNNING":

        return {
            "error": "Run has already ended."
        }, 400

    run.status = data.get("status", "COMPLETED")

    run.end_time = datetime.utcnow()

    db.commit()

    db.refresh(run)

    return {

        "message": "Run ended successfully.",

        "run": {

            "run_id": run.run_id,

            "status": run.status,

            "start_time": run.start_time,

            "end_time": run.end_time

        }

    }, 200


def get_project_runs(db, current_user, project_id):

    project = (
        db.query(Project)
        .filter(
            Project.project_id == project_id,
            Project.user_id == current_user.user_id
        )
        .first()
    )

    if project is None:

        return {
            "error": "Project not found."
        }, 404

    runs = (
        db.query(Run)
        .filter(
            Run.project_id == project_id
        )
        .order_by(
            Run.start_time.desc()
        )
        .all()
    )

    result = []

    for run in runs:

        result.append({

            "run_id": run.run_id,

            "run_name": run.run_name,

            "status": run.status,

            "start_time": run.start_time,

            "end_time": run.end_time,

            "notes": run.notes

        })

    return {

        "project_id": project.project_id,

        "project_name": project.project_name,

        "total_runs": len(result),

        "runs": result

    }, 200


def get_run_details(db, current_user, run_id):

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

    return {

        "run": {

            "run_id": run.run_id,

            "project_id": run.project_id,

            "run_name": run.run_name,

            "status": run.status,

            "notes": run.notes,

            "start_time": run.start_time,

            "end_time": run.end_time,

            "parameters": [],

            "metrics": [],

            "artifacts": [],

            "registered_models": []

        }

    }, 200