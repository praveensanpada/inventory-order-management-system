from datetime import datetime
from pydantic import BaseModel, EmailStr, Field


class CustomerCreate(BaseModel):
    full_name: str = Field(min_length=2, max_length=255)
    email: EmailStr
    phone: str = Field(min_length=7, max_length=50)


class CustomerRead(CustomerCreate):
    id: int
    created_at: datetime

    model_config = {"from_attributes": True}
