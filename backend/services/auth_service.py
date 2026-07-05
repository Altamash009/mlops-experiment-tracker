from sqlalchemy.orm import Session

from models.user import User

from utils.security import (
    hash_password,
    verify_password,
    create_access_token
)


def register_user(db: Session, data):

    existing = db.query(User).filter(
        User.email == data["email"]
    ).first()

    if existing:

        return {
            "error": "Email already registered."
        }, 400

    user = User(

        name=data["name"],

        email=data["email"],

        password_hash=hash_password(
            data["password"]
        )

    )

    db.add(user)

    db.commit()

    db.refresh(user)

    return {

        "message": "Registration successful."

    }, 201


def login_user(db: Session, data):

    user = db.query(User).filter(
        User.email == data["email"]
    ).first()

    if not user:

        return {
            "error": "Invalid email or password."
        }, 401

    if not verify_password(
        data["password"],
        user.password_hash
    ):

        return {
            "error": "Invalid email or password."
        }, 401

    token = create_access_token(
        user.user_id
    )

    return {

        "token": token,

        "user": {

            "id": user.user_id,

            "name": user.name,

            "email": user.email

        }

    }, 200