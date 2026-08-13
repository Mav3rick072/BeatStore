from typing import Optional

from app.repositories.base_repository import BaseRepository
from app.utils.object_id import serialize_doc


class ReservationRepository(BaseRepository):
    collection_name = "stock_reservations"

    def find_by_idempotency_key(self, key: str) -> Optional[dict]:
        return serialize_doc(self.collection.find_one({"idempotencyKey": key}))
