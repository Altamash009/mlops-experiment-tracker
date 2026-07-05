from flask import Blueprint, request

from models.database import SessionLocal

from services.auth_service import (
    register_user,
    login_user
)

auth_bp = Blueprint(
    "auth",
    __name__
)


@auth_bp.route(
    "/register",
    methods=["POST"]
)
def register():

    db = SessionLocal()

    try:

        data = request.get_json()

        response, status = register_user(
            db,
            data
        )

        return response, status

    finally:

        db.close()


@auth_bp.route(
    "/login",
    methods=["POST"]
)
def login():

    db = SessionLocal()

    try:

        data = request.get_json()

        response, status = login_user(
            db,
            data
        )

        return response, status

    finally:

        db.close()