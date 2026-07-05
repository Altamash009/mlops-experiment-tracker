from flask import Blueprint, request

from models.database import SessionLocal

from utils.auth import jwt_required

from services.project_service import (
    create_project,
    get_projects,
    get_project_by_id,
    update_project,
    delete_project
)

projects_bp = Blueprint(
    "projects",
    __name__
)


@projects_bp.route(
    "/create",
    methods=["POST"]
)
@jwt_required
def create_project_route(current_user):

    db = SessionLocal()

    try:

        data = request.get_json()

        response, status = create_project(
            db,
            current_user,
            data
        )

        return response, status

    finally:

        db.close()

@projects_bp.route(
    "",
    methods=["GET"]
)
@jwt_required
def get_projects_route(current_user):

    db = SessionLocal()

    try:

        response, status = get_projects(
            db,
            current_user
        )

        return response, status

    finally:

        db.close()

@projects_bp.route(
    "/<int:project_id>",
    methods=["GET"]
)
@jwt_required
def get_project_route(current_user, project_id):

    db = SessionLocal()

    try:

        response, status = get_project_by_id(
            db,
            current_user,
            project_id
        )

        return response, status

    finally:

        db.close()


@projects_bp.route(
    "/<int:project_id>",
    methods=["PUT"]
)
@jwt_required
def update_project_route(current_user, project_id):

    db = SessionLocal()

    try:

        data = request.get_json()

        response, status = update_project(
            db,
            current_user,
            project_id,
            data
        )

        return response, status

    finally:

        db.close()


@projects_bp.route(
    "/<int:project_id>",
    methods=["DELETE"]
)
@jwt_required
def delete_project_route(current_user, project_id):

    db = SessionLocal()

    try:

        response, status = delete_project(
            db,
            current_user,
            project_id
        )

        return response, status

    finally:

        db.close()