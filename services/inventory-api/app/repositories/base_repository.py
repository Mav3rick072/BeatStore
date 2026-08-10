from typing import Optional

from pymongo.collection import Collection
from pymongo.database import Database

from app.utils.object_id import serialize_doc, to_object_id


class BaseRepository:
    collection_name: str = ""

    def __init__(self, db: Database):
        self.collection: Collection = db[self.collection_name]

    def find_by_id_raw(self, doc_id: str) -> Optional[dict]:
        return self.collection.find_one({"_id": to_object_id(doc_id)})

    def find_by_id(self, doc_id: str) -> Optional[dict]:
        return serialize_doc(self.find_by_id_raw(doc_id))

    def find_all(self, filters: Optional[dict] = None) -> list[dict]:
        filters = filters or {}
        return [serialize_doc(d) for d in self.collection.find(filters).sort("createdAt", -1)]

    def insert(self, document: dict) -> dict:
        result = self.collection.insert_one(document)
        return self.find_by_id(str(result.inserted_id))

    def update(self, doc_id: str, changes: dict) -> Optional[dict]:
        if not changes:
            return self.find_by_id(doc_id)
        self.collection.update_one({"_id": to_object_id(doc_id)}, {"$set": changes})
        return self.find_by_id(doc_id)

    def delete(self, doc_id: str) -> bool:
        result = self.collection.delete_one({"_id": to_object_id(doc_id)})
        return result.deleted_count > 0

    def exists(self, filters: dict) -> bool:
        return self.collection.count_documents(filters, limit=1) > 0
