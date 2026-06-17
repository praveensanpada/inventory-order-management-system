from fastapi import status
from sqlalchemy.orm import Session

from app.middlewares.exceptions import AppError
from app.repositories.customer_repository import CustomerRepository
from app.schemas.customer import CustomerCreate


class CustomerService:
    def __init__(self, db: Session):
        self.repo = CustomerRepository(db)

    def list_customers(self, page: int, limit: int, search: str | None):
        return self.repo.list(page, limit, search)

    def get_customer(self, customer_id: int):
        customer = self.repo.get(customer_id)
        if not customer:
            raise AppError("Customer not found", status.HTTP_404_NOT_FOUND)
        return customer

    def create_customer(self, payload: CustomerCreate):
        if self.repo.get_by_email(payload.email):
            raise AppError("Customer email already exists", status.HTTP_409_CONFLICT)
        return self.repo.create(payload)

    def delete_customer(self, customer_id: int) -> None:
        self.repo.delete(self.get_customer(customer_id))
