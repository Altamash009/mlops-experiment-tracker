from flask import Blueprint, request

from models.database import SessionLocal

from utils.auth import jwt_required

from services.dashboard_service import (
    get_dashboard_summary,
    get_recent_runs,
    get_dashboard_analytics
)


dashboard_bp = Blueprint(
    "dashboard",
    __name__
)


@dashboard_bp.route(
    "/summary",
    methods=["GET"]
)
@jwt_required
def dashboard_summary(current_user):

    project_id = request.args.get("project_id")

    if not project_id:

        return {
            "error": "project_id is required."
        }, 400

    try:

        project_id = int(project_id)

    except (TypeError, ValueError):

        return {
            "error": "project_id must be an integer."
        }, 400

    db = SessionLocal()

    try:

        response, status = get_dashboard_summary(
            db,
            current_user,
            project_id
        )

        return response, status

    finally:

        db.close()


@dashboard_bp.route(
    "/recent-runs",
    methods=["GET"]
)
@jwt_required
def recent_runs(current_user):

    project_id = request.args.get("project_id")

    if not project_id:

        return {
            "error": "project_id is required."
        }, 400

    try:

        project_id = int(project_id)

    except (TypeError, ValueError):

        return {
            "error": "project_id must be an integer."
        }, 400

    db = SessionLocal()

    try:

        response, status = get_recent_runs(
            db,
            current_user,
            project_id
        )

        return response, status

    finally:

        db.close()


@dashboard_bp.route(
    "/analytics",
    methods=["GET"]
)
@jwt_required
def dashboard_analytics(current_user):

    project_id = request.args.get("project_id")

    if not project_id:

        return {
            "error": "project_id is required."
        }, 400

    try:

        project_id = int(project_id)

    except (TypeError, ValueError):

        return {
            "error": "project_id must be an integer."
        }, 400

    db = SessionLocal()

    try:

        response, status = get_dashboard_analytics(
            db,
            current_user,
            project_id
        )

        return response, status

    finally:

        db.close()