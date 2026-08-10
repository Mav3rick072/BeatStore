from __future__ import annotations

from datetime import datetime, timezone

from app.core.exceptions import ConflictError, NotFoundError
from app.models.Category import CategoryCreate, CategoryUpdate, new_category_document
from app.repositories.category_repository import CategoryRepository


class CategoryService:
    def __init__(self, repository: CategoryRepository):
        self.repository = repository

    def list(self) -> list[dict]:
        return self.repository.find_all()

    def get(self, category_id: str) -> dict:
        doc = self.repository.find_by_id(category_id)
        if not doc:
            raise NotFoundError("Categoría", category_id)
        return doc

    def create(self, payload: CategoryCreate) -> dict:
        if self.repository.exists({"name": payload.name.strip()}):
            raise ConflictError(f"Ya existe una categoría con el nombre '{payload.name}'")
        return self.repository.insert(new_category_document(payload))

    def update(self, category_id: str, payload: CategoryUpdate) -> dict:
        self.get(category_id)
        changes = {k: v for k, v in payload.model_dump(exclude_unset=True).items() if v is not None}
        if changes:
            changes["updatedAt"] = datetime.now(timezone.utc)
        return self.repository.update(category_id, changes)

    def delete(self, category_id: str) -> None:
        self.get(category_id)
        self.repository.delete(category_id)
