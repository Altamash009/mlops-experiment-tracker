import bcrypt
import jwt
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv
from jwt import ExpiredSignatureError
from jwt import InvalidTokenError


load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")


def hash_password(password: str):

    return bcrypt.hashpw(
        password.encode(),
        bcrypt.gensalt()
    ).decode()


def verify_password(password, hashed):

    return bcrypt.checkpw(
        password.encode(),
        hashed.encode()
    )


def create_access_token(user_id):

    payload = {
        "user_id": user_id,
        "exp": datetime.utcnow() + timedelta(days=7)
    }

    return jwt.encode(
        payload,
        SECRET_KEY,
        algorithm="HS256"
    )


def decode_token(token):

    try:

        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=["HS256"]
        )

        return payload

    except ExpiredSignatureError:

        raise Exception("Token expired")

    except InvalidTokenError:

        raise Exception("Invalid token")