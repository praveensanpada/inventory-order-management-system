from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.schemas.auth import LoginRequest, RefreshRequest
from app.schemas.common import ApiResponse
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/login", response_model=ApiResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    token = AuthService(db).login(payload.email, payload.password_hash)
    return ApiResponse(message="Login successful", data=token)


@router.post("/refresh", response_model=ApiResponse)
def refresh_token(payload: RefreshRequest, db: Session = Depends(get_db)):
    token = AuthService(db).refresh(payload.refresh_token)
    return ApiResponse(message="Token refreshed", data=token)
