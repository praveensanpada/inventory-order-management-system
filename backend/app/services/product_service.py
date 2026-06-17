from fastapi import status
from sqlalchemy.orm import Session

from app.middlewares.exceptions import AppError
from app.repositories.product_repository import ProductRepository
from app.schemas.product import ProductCreate, ProductUpdate


class ProductService:
    def __init__(self, db: Session):
        self.repo = ProductRepository(db)

    def list_products(self, page: int, limit: int, search: str | None, sort_by: str, sort_order: str, low_stock: bool | None):
        return self.repo.list(page, limit, search, sort_by, sort_order, low_stock)

    def get_product(self, product_id: int):
        product = self.repo.get(product_id)
        if not product:
            raise AppError("Product not found", status.HTTP_404_NOT_FOUND)
        return product

    def create_product(self, payload: ProductCreate):
        if self.repo.get_by_sku(payload.sku):
            raise AppError("Product SKU already exists", status.HTTP_409_CONFLICT)
        return self.repo.create(payload)

    def update_product(self, product_id: int, payload: ProductUpdate):
        product = self.get_product(product_id)
        if payload.sku and payload.sku != product.sku and self.repo.get_by_sku(payload.sku):
            raise AppError("Product SKU already exists", status.HTTP_409_CONFLICT)
        return self.repo.update(product, payload)

    def delete_product(self, product_id: int) -> None:
        self.repo.delete(self.get_product(product_id))
