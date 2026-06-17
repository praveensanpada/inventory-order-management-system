from sqlalchemy.orm import Session, joinedload

from app.models.order import Order
from app.models.order_item import OrderItem


class OrderRepository:
    def __init__(self, db: Session):
        self.db = db

    def list(self, page: int = 1, limit: int = 25) -> list[Order]:
        return (
            self.db.query(Order)
            .options(joinedload(Order.customer), joinedload(Order.items).joinedload(OrderItem.product))
            .order_by(Order.id.desc())
            .offset((page - 1) * limit)
            .limit(limit)
            .all()
        )

    def get(self, order_id: int) -> Order | None:
        return (
            self.db.query(Order)
            .options(joinedload(Order.customer), joinedload(Order.items).joinedload(OrderItem.product))
            .filter(Order.id == order_id)
            .first()
        )

    def delete(self, order: Order) -> None:
        self.db.delete(order)
        self.db.commit()
