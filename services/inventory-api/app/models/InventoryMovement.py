from datetime import datetime, timezone
from enum import Enum

from pydantic import BaseModel


class MovementType(str, Enum):
    IN = "IN"
    OUT = "OUT"
    ADJUSTMENT = "ADJUSTMENT"
    SALE = "SALE"
    RETURN = "RETURN"
    RENTAL_OUT = "RENTAL_OUT"
    RENTAL_IN = "RENTAL_IN"


class MovementResponse(BaseModel):
    id: str
    productId: str
    type: MovementType
    quantity: int
    reason: str | None = None
    referenceId: str | None = None
    referenceType: str | None = None
    createdAt: datetime


def new_movement_document(
    product_id: str,
    movement_type: MovementType,
    quantity: int,
    reason: str | None = None,
    reference_id: str | None = None,
    reference_type: str | None = None,
) -> dict:
    return {
        "productId": product_id,
        "type": movement_type.value,
        "quantity": quantity,
        "reason": reason,
        "referenceId": reference_id,
        "referenceType": reference_type,
        "createdAt": datetime.now(timezone.utc),
    }
