from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.models.customer import Customer
from app.schemas.customer import CustomerCreate


class CustomerRepository:
    def __init__(self, db: Session):
        self.db = db

    def list(self, page: int = 1, limit: int = 25, search: str | None = None) -> list[Customer]:
        query = self.db.query(Customer)
        if search:
            needle = f"%{search}%"
            query = query.filter(or_(Customer.full_name.ilike(needle), Customer.email.ilike(needle), Customer.phone.ilike(needle)))
        return query.order_by(Customer.id.desc()).offset((page - 1) * limit).limit(limit).all()

    def get(self, customer_id: int) -> Customer | None:
        return self.db.get(Customer, customer_id)

    def get_by_email(self, email: str) -> Customer | None:
        return self.db.query(Customer).filter(Customer.email == email).first()

    def create(self, payload: CustomerCreate) -> Customer:
        customer = Customer(**payload.model_dump())
        self.db.add(customer)
        self.db.commit()
        self.db.refresh(customer)
        return customer

    def delete(self, customer: Customer) -> None:
        self.db.delete(customer)
        self.db.commit()
