from pymongo import ASCENDING, MongoClient, TEXT
from pymongo.database import Database

from app.core.config import settings


class MongoDB:

    def __init__(self):
        self.client = MongoClient(settings.mongodb_uri)
        self.database: Database = self.client[settings.mongodb_database]

    def get_database(self) -> Database:
        return self.database

    def ping(self) -> bool:
        try:
            self.client.admin.command("ping")
            return True
        except Exception:
            return False

    def ensure_indexes(self) -> None:
        db = self.database

        db.categories.create_index([("name", ASCENDING)], unique=True)

        db.brands.create_index([("name", ASCENDING)], unique=True)

        db.suppliers.create_index([("name", ASCENDING)])

        db.products.create_index(
            [("barcode", ASCENDING)],
            unique=True,
            partialFilterExpression={"barcode": {"$type": "string"}},
        )
        db.products.create_index([("sku", ASCENDING)], unique=True)
        db.products.create_index([("categoryId", ASCENDING)])
        db.products.create_index([("isRentable", ASCENDING)])
        db.products.create_index([("name", TEXT)])

        db.inventory_movements.create_index([("productId", ASCENDING)])
        db.inventory_movements.create_index([("createdAt", ASCENDING)])

        db.stock_reservations.create_index([("idempotencyKey", ASCENDING)], unique=True)
        db.stock_reservations.create_index([("status", ASCENDING)])
        db.stock_reservations.create_index([("expiresAt", ASCENDING)])


mongodb = MongoDB()
db = mongodb.get_database()
