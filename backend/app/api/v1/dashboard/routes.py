from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.schemas.common import ApiResponse
from app.services.auth_service import get_current_user
from app.services.dashboard_service import DashboardService

router = APIRouter(prefix="/dashboard", tags=["Dashboard"], dependencies=[Depends(get_current_user)])


@router.get("/summary", response_model=ApiResponse)
def get_summary(db: Session = Depends(get_db)):
    return ApiResponse(message="Dashboard summary retrieved", data=DashboardService(db).summary())
