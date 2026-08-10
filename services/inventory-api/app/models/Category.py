from datetime import datetime, timezone
from typing import Optional

from pydantic import BaseModel, Field


class CategoryCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=80)
    description: Optional[str] = Field(default=None, max_length=300)


class CategoryUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=2, max_length=80)
    description: Optional[str] = Field(default=None, max_length=300)


class CategoryResponse(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    createdAt: datetime
    updatedAt: datetime


def new_category_document(payload: CategoryCreate) -> dict:
    now = datetime.now(timezone.utc)
    return {
        "name": payload.name.strip(),
        "description": payload.description,
        "createdAt": now,
        "updatedAt": now,
    }
