from flask import Blueprint, request

from models.database import SessionLocal

from utils.auth import jwt_required

from services.model_registry_service import (
    register_model,
    get_project_models,
    promote_model,
    rollback_model,
    get_registered_model,
    get_model_history,
    get_model_leaderboard
)


registry_bp = Blueprint(
    "registry",
    __name__
)


@registry_bp.route(
    "/register",
    methods=["POST"]
)
@jwt_required
def register_model_route(current_user):

    db = SessionLocal()

    try:

        data = request.get_json() or {}

        response, status = register_model(
            db,
            current_user,
            data
        )

        return response, status

    finally:

        db.close()



@registry_bp.route(
    "/project/<int:project_id>",
    methods=["GET"]
)
@jwt_required
def get_project_models_route(current_user, project_id):

    db = SessionLocal()

    try:

        response, status = get_project_models(
            db,
            current_user,
            project_id
        )

        return response, status

    finally:

        db.close()



@registry_bp.route(
    "/<int:model_id>/promote",
    methods=["POST"]
)
@jwt_required
def promote_model_route(current_user, model_id):

    db = SessionLocal()

    try:

        response, status = promote_model(
            db,
            current_user,
            model_id
        )

        return response, status

    finally:
        db.close()


@registry_bp.route(
    "/<int:model_id>/rollback",
    methods=["POST"]
)
@jwt_required
def rollback_model_route(current_user, model_id):

    db = SessionLocal()

    try:

        response, status = rollback_model(
            db,
            current_user,
            model_id
        )

        return response, status

    finally:

        db.close()



@registry_bp.route(
    "/<int:model_id>",
    methods=["GET"]
)
@jwt_required
def get_registered_model_route(current_user, model_id):

    db = SessionLocal()

    try:

        response, status = get_registered_model(
            db,
            current_user,
            model_id
        )

        return response, status

    finally:

        db.close()



@registry_bp.route(
    "/project/<int:project_id>/history/<path:model_name>",
    methods=["GET"]
)
@jwt_required
def get_model_history_route(current_user, project_id, model_name):

    db = SessionLocal()

    try:

        response, status = get_model_history(
            db,
            current_user,
            project_id,
            model_name
        )

        return response, status

    finally:

        db.close()




@registry_bp.route(
    "/project/<int:project_id>/leaderboard/<path:model_name>",
    methods=["GET"]
)
@jwt_required
def get_model_leaderboard_route(
    current_user,
    project_id,
    model_name
):

    db = SessionLocal()

    try:

        metric_name = request.args.get(
            "metric",
            "accuracy"
        )

        top_raw = request.args.get(
            "top",
            "3"
        )

        try:

            top = int(top_raw)

        except (TypeError, ValueError):

            return {
                "error": "top must be an integer."
            }, 400

        response, status = get_model_leaderboard(
            db=db,
            current_user=current_user,
            project_id=project_id,
            model_name=model_name,
            metric_name=metric_name,
            top=top
        )

        return response, status

    finally:

        db.close()