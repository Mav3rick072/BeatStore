from datetime import datetime, timedelta, timezone
from enum import Enum

from pydantic import BaseModel, Field


class ReservationStatus(str, Enum):
    PENDING = "PENDING"
    CONFIRMED = "CONFIRMED"
    RELEASED = "RELEASED"
    EXPIRED = "EXPIRED"


class ReservationItem(BaseModel):
    productId: str
    quantity: int = Field(..., gt=0)


class ReservationCreate(BaseModel):
    idempotencyKey: str
    items: list[ReservationItem]
    ttlSeconds: int = Field(default=600, ge=30, le=3600)


class ReservationResponse(BaseModel):
    id: str
    idempotencyKey: str
    items: list[ReservationItem]
    status: ReservationStatus
    expiresAt: datetime
    createdAt: datetime
    updatedAt: datetime


def new_reservation_document(payload: ReservationCreate) -> dict:
    now = datetime.now(timezone.utc)
    return {
        "idempotencyKey": payload.idempotencyKey,
        "items": [item.model_dump() for item in payload.items],
        "status": ReservationStatus.PENDING.value,
        "expiresAt": now + timedelta(seconds=payload.ttlSeconds),
        "createdAt": now,
        "updatedAt": now,
    }
