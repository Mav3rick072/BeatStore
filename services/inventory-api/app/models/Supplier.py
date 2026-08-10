from datetime import datetime, timezone
from typing import Optional

from pydantic import BaseModel, EmailStr, Field


class SupplierCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=120)
    contactName: Optional[str] = Field(default=None, max_length=120)
    phone: Optional[str] = Field(default=None, max_length=20)
    email: Optional[EmailStr] = None
    address: Optional[str] = Field(default=None, max_length=200)


class SupplierUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=2, max_length=120)
    contactName: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    address: Optional[str] = None


class SupplierResponse(BaseModel):
    id: str
    name: str
    contactName: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    createdAt: datetime
    updatedAt: datetime


def new_supplier_document(payload: SupplierCreate) -> dict:
    now = datetime.now(timezone.utc)
    return {
        "name": payload.name.strip(),
        "contactName": payload.contactName,
        "phone": payload.phone,
        "email": payload.email,
        "address": payload.address,
        "createdAt": now,
        "updatedAt": now,
    }
