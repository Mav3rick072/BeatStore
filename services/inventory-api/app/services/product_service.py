from __future__ import annotations

from datetime import datetime, timezone
from typing import Optional

from app.core.exceptions import ConflictError, NotFoundError, ValidationAppError
from app.models.InventoryMovement import MovementType, new_movement_document
from app.models.Product import ProductCreate, ProductUpdate, new_product_document
from app.repositories.category_repository import CategoryRepository
from app.repositories.movement_repository import MovementRepository
from app.repositories.product_repository import ProductRepository
from app.utils.object_id import to_object_id


class ProductService:
    def __init__(
        self,
        repository: ProductRepository,
        category_repository: CategoryRepository,
        movement_repository: MovementRepository,
    ):
        self.repository = repository
        self.category_repository = category_repository
        self.movement_repository = movement_repository

    def list(self, query: Optional[str], category_id: Optional[str], only_rentable: bool) -> list[dict]:
        return self.repository.search(query, category_id, only_rentable)

    def get(self, product_id: str) -> dict:
        doc = self.repository.find_by_id(product_id)
        if not doc:
            raise NotFoundError("Producto", product_id)
        return doc

    def get_by_barcode(self, barcode: str) -> dict:
        doc = self.repository.find_by_barcode(barcode)
        if not doc:
            raise NotFoundError("Producto", barcode)
        return doc

    def create(self, payload: ProductCreate) -> dict:
        if not self.category_repository.find_by_id(payload.categoryId):
            raise ValidationAppError(f"La categoría '{payload.categoryId}' no existe")
        if self.repository.find_by_sku(payload.sku):
            raise ConflictError(f"Ya existe un producto con el SKU '{payload.sku}'")
        if payload.barcode and self.repository.find_by_barcode(payload.barcode):
            raise ConflictError(f"Ya existe un producto con el código de barras '{payload.barcode}'")
        if payload.isRentable and payload.rentalPriceInCents is None:
            raise ValidationAppError("Debe indicar rentalPriceInCents cuando isRentable es true")

        created = self.repository.insert(new_product_document(payload))

        if payload.initialStock > 0:
            self.movement_repository.insert(
                new_movement_document(
                    product_id=created["id"],
                    movement_type=MovementType.IN,
                    quantity=payload.initialStock,
                    reason="Stock inicial al crear el producto",
                )
            )
        return created

    def update(self, product_id: str, payload: ProductUpdate) -> dict:
        self.get(product_id)
        changes = {k: v for k, v in payload.model_dump(exclude_unset=True).items() if v is not None}
        if "minStock" in changes:
            min_stock = changes.pop("minStock")
            self.repository.collection.update_one(
                {"_id": to_object_id(product_id)},
                {"$set": {"stock.minStock": min_stock}},
            )
        if changes:
            changes["updatedAt"] = datetime.now(timezone.utc)
            self.repository.update(product_id, changes)
        return self.get(product_id)

    def delete(self, product_id: str) -> None:
        self.get(product_id)
        self.repository.update(product_id, {"isActive": False, "updatedAt": datetime.now(timezone.utc)})

    def adjust_stock(self, product_id: str, quantity: int, reason: str) -> dict:
        product = self.get(product_id)
        new_qty = product["stock"]["quantity"] + quantity
        if new_qty < 0:
            raise ValidationAppError("El ajuste dejaría el stock en un valor negativo")
        self.repository.increment_stock(product_id, quantity)
        self.movement_repository.insert(
            new_movement_document(
                product_id=product_id,
                movement_type=MovementType.ADJUSTMENT if quantity != 0 else MovementType.ADJUSTMENT,
                quantity=quantity,
                reason=reason,
            )
        )
        return self.get(product_id)

    def low_stock(self) -> list[dict]:
        return self.repository.low_stock()
