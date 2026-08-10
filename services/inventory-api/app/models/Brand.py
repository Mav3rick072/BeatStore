from datetime import datetime, timezone
from typing import Optional

from pydantic import BaseModel, Field


class BrandCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=80)


class BrandUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=2, max_length=80)


class BrandResponse(BaseModel):
    id: str
    name: str
    createdAt: datetime
    updatedAt: datetime


def new_brand_document(payload: BrandCreate) -> dict:
    now = datetime.now(timezone.utc)
    return {"name": payload.name.strip(), "createdAt": now, "updatedAt": now}
