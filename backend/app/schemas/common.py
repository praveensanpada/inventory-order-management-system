from typing import Any
from fastapi.encoders import jsonable_encoder
from pydantic import BaseModel, field_serializer


class ApiResponse(BaseModel):
    success: bool = True
    message: str
    data: Any | None = None

    @field_serializer("data")
    def serialize_data(self, value: Any) -> Any:
        return jsonable_encoder(value)
