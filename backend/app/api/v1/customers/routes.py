from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.schemas.common import ApiResponse
from app.schemas.customer import CustomerCreate
from app.services.auth_service import get_current_user
from app.services.customer_service import CustomerService

router = APIRouter(prefix="/customers", tags=["Customers"], dependencies=[Depends(get_current_user)])


@router.post("", status_code=status.HTTP_201_CREATED, response_model=ApiResponse)
def create_customer(payload: CustomerCreate, db: Session = Depends(get_db)):
    return ApiResponse(message="Customer created", data=CustomerService(db).create_customer(payload))


@router.get("", response_model=ApiResponse)
def list_customers(page: int = 1, limit: int = 25, search: str | None = None, db: Session = Depends(get_db)):
    return ApiResponse(message="Customers retrieved", data=CustomerService(db).list_customers(page, min(limit, 100), search))


@router.get("/{customer_id}", response_model=ApiResponse)
def get_customer(customer_id: int, db: Session = Depends(get_db)):
    return ApiResponse(message="Customer retrieved", data=CustomerService(db).get_customer(customer_id))


@router.delete("/{customer_id}", response_model=ApiResponse)
def delete_customer(customer_id: int, db: Session = Depends(get_db)):
    CustomerService(db).delete_customer(customer_id)
    return ApiResponse(message="Customer deleted", data=None)
