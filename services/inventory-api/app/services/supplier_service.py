from __future__ import annotations

from datetime import datetime, timezone

from app.core.exceptions import NotFoundError
from app.models.Supplier import SupplierCreate, SupplierUpdate, new_supplier_document
from app.repositories.supplier_repository import SupplierRepository


class SupplierService:
    def __init__(self, repository: SupplierRepository):
        self.repository = repository

    def list(self) -> list[dict]:
        return self.repository.find_all()

    def get(self, supplier_id: str) -> dict:
        doc = self.repository.find_by_id(supplier_id)
        if not doc:
            raise NotFoundError("Proveedor", supplier_id)
        return doc

    def create(self, payload: SupplierCreate) -> dict:
        return self.repository.insert(new_supplier_document(payload))

    def update(self, supplier_id: str, payload: SupplierUpdate) -> dict:
        self.get(supplier_id)
        changes = {k: v for k, v in payload.model_dump(exclude_unset=True).items() if v is not None}
        if changes:
            changes["updatedAt"] = datetime.now(timezone.utc)
        return self.repository.update(supplier_id, changes)

    def delete(self, supplier_id: str) -> None:
        self.get(supplier_id)
        self.repository.delete(supplier_id)
