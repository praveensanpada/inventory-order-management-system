from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.schemas.common import ApiResponse
from app.schemas.product import ProductCreate, ProductUpdate
from app.services.auth_service import get_current_user
from app.services.product_service import ProductService

router = APIRouter(prefix="/products", tags=["Products"], dependencies=[Depends(get_current_user)])


@router.post("", status_code=status.HTTP_201_CREATED, response_model=ApiResponse)
def create_product(payload: ProductCreate, db: Session = Depends(get_db)):
    return ApiResponse(message="Product created", data=ProductService(db).create_product(payload))


@router.get("", response_model=ApiResponse)
def list_products(
    page: int = 1,
    limit: int = 25,
    search: str | None = None,
    sort_by: str = "id",
    sort_order: str = "desc",
    low_stock: bool | None = None,
    db: Session = Depends(get_db),
):
    return ApiResponse(
        message="Products retrieved",
        data=ProductService(db).list_products(page, min(limit, 100), search, sort_by, sort_order, low_stock),
    )


@router.get("/{product_id}", response_model=ApiResponse)
def get_product(product_id: int, db: Session = Depends(get_db)):
    return ApiResponse(message="Product retrieved", data=ProductService(db).get_product(product_id))


@router.put("/{product_id}", response_model=ApiResponse)
def update_product(product_id: int, payload: ProductUpdate, db: Session = Depends(get_db)):
    return ApiResponse(message="Product updated", data=ProductService(db).update_product(product_id, payload))


@router.delete("/{product_id}", response_model=ApiResponse)
def delete_product(product_id: int, db: Session = Depends(get_db)):
    ProductService(db).delete_product(product_id)
    return ApiResponse(message="Product deleted", data=None)
