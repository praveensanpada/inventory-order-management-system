from sqlalchemy import asc, desc, or_
from sqlalchemy.orm import Session

from app.models.product import Product
from app.schemas.product import ProductCreate, ProductUpdate


class ProductRepository:
    def __init__(self, db: Session):
        self.db = db

    def list(
        self,
        page: int = 1,
        limit: int = 25,
        search: str | None = None,
        sort_by: str = "id",
        sort_order: str = "desc",
        low_stock: bool | None = None,
    ) -> list[Product]:
        query = self.db.query(Product)
        if search:
            needle = f"%{search}%"
            query = query.filter(or_(Product.name.ilike(needle), Product.sku.ilike(needle)))
        if low_stock is not None:
            query = query.filter(Product.stock_quantity <= 5 if low_stock else Product.stock_quantity > 5)
        sort_column = getattr(Product, sort_by, Product.id)
        query = query.order_by(desc(sort_column) if sort_order == "desc" else asc(sort_column))
        return query.offset((page - 1) * limit).limit(limit).all()

    def get(self, product_id: int) -> Product | None:
        return self.db.get(Product, product_id)

    def get_by_sku(self, sku: str) -> Product | None:
        return self.db.query(Product).filter(Product.sku == sku).first()

    def create(self, payload: ProductCreate) -> Product:
        product = Product(**payload.model_dump())
        self.db.add(product)
        self.db.commit()
        self.db.refresh(product)
        return product

    def update(self, product: Product, payload: ProductUpdate) -> Product:
        for key, value in payload.model_dump(exclude_unset=True).items():
            setattr(product, key, value)
        self.db.commit()
        self.db.refresh(product)
        return product

    def delete(self, product: Product) -> None:
        self.db.delete(product)
        self.db.commit()
