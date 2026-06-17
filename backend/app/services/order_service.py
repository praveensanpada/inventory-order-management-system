from decimal import Decimal
from fastapi import status
from sqlalchemy.orm import Session

from app.middlewares.exceptions import AppError
from app.models.customer import Customer
from app.models.order import Order
from app.models.order_item import OrderItem
from app.models.product import Product
from app.repositories.order_repository import OrderRepository
from app.schemas.order import OrderCreate


class OrderService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = OrderRepository(db)

    def list_orders(self, page: int, limit: int):
        return self.repo.list(page, limit)

    def get_order(self, order_id: int):
        order = self.repo.get(order_id)
        if not order:
            raise AppError("Order not found", status.HTTP_404_NOT_FOUND)
        return order

    def create_order(self, payload: OrderCreate):
        customer = self.db.get(Customer, payload.customer_id)
        if not customer:
            raise AppError("Customer not found", status.HTTP_404_NOT_FOUND)

        product_ids = [item.product_id for item in payload.items]
        products = {
            product.id: product
            for product in self.db.query(Product).filter(Product.id.in_(product_ids)).with_for_update().all()
        }
        missing = set(product_ids) - set(products)
        if missing:
            raise AppError(f"Product(s) not found: {sorted(missing)}", status.HTTP_404_NOT_FOUND)

        total = Decimal("0.00")
        order_items: list[OrderItem] = []
        try:
            for item in payload.items:
                product = products[item.product_id]
                if product.stock_quantity < item.quantity:
                    raise AppError(f"Insufficient stock for SKU {product.sku}", status.HTTP_409_CONFLICT)
                product.stock_quantity -= item.quantity
                total += product.price * item.quantity
                order_items.append(
                    OrderItem(product_id=product.id, quantity=item.quantity, price_at_purchase=product.price)
                )

            order = Order(customer_id=payload.customer_id, total_amount=total, status="created", items=order_items)
            self.db.add(order)
            self.db.commit()
            return self.get_order(order.id)
        except Exception:
            self.db.rollback()
            raise

    def delete_order(self, order_id: int) -> None:
        order = self.get_order(order_id)
        try:
            for item in order.items:
                product = self.db.get(Product, item.product_id)
                if product:
                    product.stock_quantity += item.quantity
            self.db.delete(order)
            self.db.commit()
        except Exception:
            self.db.rollback()
            raise
