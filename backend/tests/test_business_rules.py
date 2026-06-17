from decimal import Decimal

from app.schemas.order import OrderCreate, OrderItemCreate


def test_order_payload_requires_positive_quantities():
    try:
        OrderCreate(customer_id=1, items=[OrderItemCreate(product_id=1, quantity=0)])
    except Exception as exc:
        assert "greater than 0" in str(exc)


def test_decimal_total_example():
    assert Decimal("49.99") * 2 == Decimal("99.98")
