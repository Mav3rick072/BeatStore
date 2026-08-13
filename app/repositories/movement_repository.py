from app.repositories.base_repository import BaseRepository


class MovementRepository(BaseRepository):
    collection_name = "inventory_movements"

    def find_by_product(self, product_id: str) -> list[dict]:
        return self.find_all({"productId": product_id})
