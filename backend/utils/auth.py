from functools import wraps

from flask import request, jsonify

from models.database import SessionLocal
from models.user import User

from utils.security import decode_token


def jwt_required(func):

    @wraps(func)
    def wrapper(*args, **kwargs):

        auth_header = request.headers.get("Authorization")

        if not auth_header:
            return jsonify({
                "error": "Authorization header missing."
            }), 401

        if not auth_header.startswith("Bearer "):
            return jsonify({
                "error": "Invalid authorization format."
            }), 401

        token = auth_header.split(" ")[1]

        try:

            payload = decode_token(token)

        except Exception:
            return jsonify({
                "error": "Invalid or expired token."
            }), 401

        db = SessionLocal()

        try:

            current_user = db.query(User).filter(
                User.user_id == payload["user_id"]
            ).first()

            if current_user is None:

                return jsonify({
                    "error": "User not found."
                }), 401

            return func(current_user, *args, **kwargs)

        finally:

            db.close()

    return wrapper