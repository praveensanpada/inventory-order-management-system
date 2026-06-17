from decimal import Decimal
from pydantic import BaseModel

from app.schemas.product import ProductRead


class DashboardSummary(BaseModel):
    total_products: int
    total_customers: int
    total_orders: int
    low_stock_products: list[ProductRead]
    total_inventory_value: Decimal
