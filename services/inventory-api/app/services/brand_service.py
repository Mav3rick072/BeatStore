from __future__ import annotations

from datetime import datetime, timezone

from app.core.exceptions import ConflictError, NotFoundError
from app.models.Brand import BrandCreate, BrandUpdate, new_brand_document
from app.repositories.brand_repository import BrandRepository


class BrandService:
    def __init__(self, repository: BrandRepository):
        self.repository = repository

    def list(self) -> list[dict]:
        return self.repository.find_all()

    def get(self, brand_id: str) -> dict:
        doc = self.repository.find_by_id(brand_id)
        if not doc:
            raise NotFoundError("Marca", brand_id)
        return doc

    def create(self, payload: BrandCreate) -> dict:
        if self.repository.exists({"name": payload.name.strip()}):
            raise ConflictError(f"Ya existe una marca con el nombre '{payload.name}'")
        return self.repository.insert(new_brand_document(payload))

    def update(self, brand_id: str, payload: BrandUpdate) -> dict:
        self.get(brand_id)
        changes = {k: v for k, v in payload.model_dump(exclude_unset=True).items() if v is not None}
        if changes:
            changes["updatedAt"] = datetime.now(timezone.utc)
        return self.repository.update(brand_id, changes)

    def delete(self, brand_id: str) -> None:
        self.get(brand_id)
        self.repository.delete(brand_id)
