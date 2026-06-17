from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.schemas.common import ApiResponse
from app.schemas.order import OrderCreate
from app.services.auth_service import get_current_user
from app.services.order_service import OrderService

router = APIRouter(prefix="/orders", tags=["Orders"], dependencies=[Depends(get_current_user)])


@router.post("", status_code=status.HTTP_201_CREATED, response_model=ApiResponse)
def create_order(payload: OrderCreate, db: Session = Depends(get_db)):
    return ApiResponse(message="Order created", data=OrderService(db).create_order(payload))


@router.get("", response_model=ApiResponse)
def list_orders(page: int = 1, limit: int = 25, db: Session = Depends(get_db)):
    return ApiResponse(message="Orders retrieved", data=OrderService(db).list_orders(page, min(limit, 100)))


@router.get("/{order_id}", response_model=ApiResponse)
def get_order(order_id: int, db: Session = Depends(get_db)):
    return ApiResponse(message="Order retrieved", data=OrderService(db).get_order(order_id))


@router.delete("/{order_id}", response_model=ApiResponse)
def delete_order(order_id: int, db: Session = Depends(get_db)):
    OrderService(db).delete_order(order_id)
    return ApiResponse(message="Order deleted", data=None)
