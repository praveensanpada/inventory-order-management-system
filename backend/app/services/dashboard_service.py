from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.customer import Customer
from app.models.order import Order
from app.models.product import Product


class DashboardService:
    def __init__(self, db: Session):
        self.db = db

    def summary(self) -> dict:
        total_products = self.db.query(func.count(Product.id)).scalar() or 0
        total_customers = self.db.query(func.count(Customer.id)).scalar() or 0
        total_orders = self.db.query(func.count(Order.id)).scalar() or 0
        low_stock_products = self.db.query(Product).filter(Product.stock_quantity <= 5).order_by(Product.stock_quantity).all()
        total_inventory_value = self.db.query(func.coalesce(func.sum(Product.price * Product.stock_quantity), 0)).scalar()
        return {
            "total_products": total_products,
            "total_customers": total_customers,
            "total_orders": total_orders,
            "low_stock_products": low_stock_products,
            "total_inventory_value": total_inventory_value,
        }
