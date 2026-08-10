from datetime import datetime, timezone
from typing import Optional

from pydantic import BaseModel, Field


class ProductCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=150)
    sku: str = Field(..., min_length=2, max_length=40)
    barcode: Optional[str] = Field(default=None, max_length=40)
    categoryId: str
    brandId: Optional[str] = None
    supplierId: Optional[str] = None
    description: Optional[str] = Field(default=None, max_length=500)
    priceInCents: int = Field(..., ge=0)
    isRentable: bool = False
    rentalPriceInCents: Optional[int] = Field(default=None, ge=0)
    attributes: dict = Field(default_factory=dict)
    images: list[str] = Field(default_factory=list)
    initialStock: int = Field(default=0, ge=0)
    minStock: int = Field(default=0, ge=0)


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    barcode: Optional[str] = None
    categoryId: Optional[str] = None
    brandId: Optional[str] = None
    supplierId: Optional[str] = None
    description: Optional[str] = None
    priceInCents: Optional[int] = Field(default=None, ge=0)
    isRentable: Optional[bool] = None
    rentalPriceInCents: Optional[int] = Field(default=None, ge=0)
    attributes: Optional[dict] = None
    images: Optional[list[str]] = None
    minStock: Optional[int] = Field(default=None, ge=0)
    isActive: Optional[bool] = None


class ProductResponse(BaseModel):
    id: str
    name: str
    sku: str
    barcode: Optional[str] = None
    categoryId: str
    brandId: Optional[str] = None
    supplierId: Optional[str] = None
    description: Optional[str] = None
    priceInCents: int
    isRentable: bool
    rentalPriceInCents: Optional[int] = None
    attributes: dict
    images: list[str]
    stock: dict
    isActive: bool
    createdAt: datetime
    updatedAt: datetime


def new_product_document(payload: ProductCreate) -> dict:
    now = datetime.now(timezone.utc)
    return {
        "name": payload.name.strip(),
        "sku": payload.sku.strip().upper(),
        "barcode": payload.barcode,
        "categoryId": payload.categoryId,
        "brandId": payload.brandId,
        "supplierId": payload.supplierId,
        "description": payload.description,
        "priceInCents": payload.priceInCents,
        "isRentable": payload.isRentable,
        "rentalPriceInCents": payload.rentalPriceInCents,
        "attributes": payload.attributes,
        "images": payload.images,
        "stock": {
            "quantity": payload.initialStock,
            "reserved": 0,
            "minStock": payload.minStock,
        },
        "isActive": True,
        "createdAt": now,
        "updatedAt": now,
    }
