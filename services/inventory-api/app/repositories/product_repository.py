from typing import Optional

from app.repositories.base_repository import BaseRepository
from app.utils.object_id import serialize_doc, to_object_id


class ProductRepository(BaseRepository):
    collection_name = "products"

    def find_by_barcode(self, barcode: str) -> Optional[dict]:
        return serialize_doc(self.collection.find_one({"barcode": barcode}))

    def find_by_sku(self, sku: str) -> Optional[dict]:
        return serialize_doc(self.collection.find_one({"sku": sku.upper()}))

    def search(self, query: Optional[str], category_id: Optional[str], only_rentable: bool) -> list[dict]:
        filters: dict = {"isActive": True}
        if category_id:
            filters["categoryId"] = category_id
        if only_rentable:
            filters["isRentable"] = True
        if query:
            filters["$or"] = [
                {"name": {"$regex": query, "$options": "i"}},
                {"sku": {"$regex": query, "$options": "i"}},
                {"barcode": {"$regex": query, "$options": "i"}},
            ]
        return [serialize_doc(d) for d in self.collection.find(filters).sort("name", 1)]

    def low_stock(self) -> list[dict]:
        pipeline = [
            {"$match": {"isActive": True}},
            {"$match": {"$expr": {"$lte": ["$stock.quantity", "$stock.minStock"]}}},
        ]
        return [serialize_doc(d) for d in self.collection.aggregate(pipeline)]

    def increment_stock(self, product_id: str, delta: int) -> Optional[dict]:
        self.collection.update_one(
            {"_id": to_object_id(product_id)},
            {"$inc": {"stock.quantity": delta}},
        )
        return self.find_by_id(product_id)

    def increment_reserved(self, product_id: str, delta: int) -> Optional[dict]:
        self.collection.update_one(
            {"_id": to_object_id(product_id)},
            {"$inc": {"stock.reserved": delta}},
        )
        return self.find_by_id(product_id)

    def available_quantity(self, product_id: str) -> int:
        doc = self.find_by_id_raw(product_id)
        if not doc:
            return 0
        stock = doc.get("stock", {})
        return max(stock.get("quantity", 0) - stock.get("reserved", 0), 0)
