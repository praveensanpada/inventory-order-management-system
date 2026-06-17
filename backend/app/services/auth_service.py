from fastapi import Depends, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.security import create_access_token, create_refresh_token, decode_access_token, hash_password, sha256_password, verify_password
from app.database.session import get_db
from app.middlewares.exceptions import AppError
from app.models.user import User

bearer_scheme = HTTPBearer()


class AuthService:
    def __init__(self, db: Session):
        self.db = db

    def login(self, email: str, password_hash: str) -> dict:
        user = self.db.query(User).filter(User.email == email, User.is_active.is_(True)).first()
        if not user or not verify_password(password_hash, user.hashed_password):
            raise AppError("Invalid email or password", status.HTTP_401_UNAUTHORIZED)
        return {
            "access_token": create_access_token(user.email, user.role),
            "refresh_token": create_refresh_token(user.email, user.role),
            "token_type": "bearer",
            "role": user.role,
        }

    def refresh(self, refresh_token: str) -> dict:
        try:
            payload = decode_access_token(refresh_token)
        except ValueError as exc:
            raise AppError(str(exc), status.HTTP_401_UNAUTHORIZED) from exc
        if payload.get("type") != "refresh":
            raise AppError("Invalid refresh token", status.HTTP_401_UNAUTHORIZED)
        user = self.db.query(User).filter(User.email == payload.get("sub"), User.is_active.is_(True)).first()
        if not user:
            raise AppError("User not found or inactive", status.HTTP_401_UNAUTHORIZED)
        return {
            "access_token": create_access_token(user.email, user.role),
            "refresh_token": create_refresh_token(user.email, user.role),
            "token_type": "bearer",
            "role": user.role,
        }


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    try:
        payload = decode_access_token(credentials.credentials)
    except ValueError as exc:
        raise AppError(str(exc), status.HTTP_401_UNAUTHORIZED) from exc
    if payload.get("type") != "access":
        raise AppError("Invalid access token", status.HTTP_401_UNAUTHORIZED)
    user = db.query(User).filter(User.email == payload.get("sub"), User.is_active.is_(True)).first()
    if not user:
        raise AppError("User not found or inactive", status.HTTP_401_UNAUTHORIZED)
    return user


def ensure_admin_user(db: Session, email: str, password: str) -> None:
    frontend_hash = sha256_password(password)
    user = db.query(User).filter(User.email == email).first()
    if user:
        if not verify_password(frontend_hash, user.hashed_password):
            user.hashed_password = hash_password(frontend_hash)
            db.commit()
        return
    db.add(User(email=email, hashed_password=hash_password(frontend_hash), role="admin", is_active=True))
    db.commit()
