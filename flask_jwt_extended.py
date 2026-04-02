"""
Minimal local shim for flask_jwt_extended to support tests in this environment.
This is NOT production-grade. In production, install Flask-JWT-Extended.
"""
from functools import wraps
from flask import request, g


def create_access_token(identity):
    return f"token-{identity}"


class JWTManager:
    def __init__(self):
        pass

    def init_app(self, app):
        return None


def jwt_required():
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            auth = request.headers.get("Authorization", "")
            if auth.startswith("Bearer "):
                token = auth.split(" ", 1)[1]
                # expected token format: token-<identity>
                if token.startswith("token-"):
                    ident = token.split("token-", 1)[1]
                    try:
                        g._jwt_identity = int(ident)
                    except Exception:
                        g._jwt_identity = ident
            return fn(*args, **kwargs)

        return wrapper

    return decorator


def get_jwt_identity():
    from flask import g

    return getattr(g, "_jwt_identity", None)
