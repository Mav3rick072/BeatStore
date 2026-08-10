"""
Script de datos iniciales para inventory-api.
Uso dentro del contenedor:
    docker compose exec inventory-api python scripts/seed.py
"""
from app.database.connection import db

CATEGORIES = [
    {"name": "Guitarras", "description": "Guitarras acústicas y eléctricas"},
    {"name": "Baterías", "description": "Baterías acústicas y electrónicas"},
    {"name": "Teclados", "description": "Pianos, teclados y sintetizadores"},
    {"name": "Accesorios", "description": "Cuerdas, baquetas, estuches, cables"},
    {"name": "Audio", "description": "Micrófonos, bocinas y consolas"},
]

BRANDS = ["Yamaha", "Fender", "Gibson", "Pearl", "Shure"]


def run() -> None:
    from datetime import datetime, timezone

    now = datetime.now(timezone.utc)

    category_ids = {}
    for cat in CATEGORIES:
        existing = db.categories.find_one({"name": cat["name"]})
        if existing:
            category_ids[cat["name"]] = existing["_id"]
            continue
        result = db.categories.insert_one({**cat, "createdAt": now, "updatedAt": now})
        category_ids[cat["name"]] = result.inserted_id

    brand_ids = {}
    for name in BRANDS:
        existing = db.brands.find_one({"name": name})
        if existing:
            brand_ids[name] = existing["_id"]
            continue
        result = db.brands.insert_one({"name": name, "createdAt": now, "updatedAt": now})
        brand_ids[name] = result.inserted_id

    products = [
        {
            "name": "Guitarra acústica Yamaha F310",
            "sku": "GTR-YAM-F310",
            "barcode": "7501234560012",
            "categoryId": str(category_ids["Guitarras"]),
            "brandId": str(brand_ids["Yamaha"]),
            "priceInCents": 459900,
            "isRentable": True,
            "rentalPriceInCents": 15000,
            "stock": {"quantity": 12, "reserved": 0, "minStock": 3},
        },
        {
            "name": "Batería acústica Pearl Export",
            "sku": "BAT-PRL-EXP",
            "barcode": "7501234560029",
            "categoryId": str(category_ids["Baterías"]),
            "brandId": str(brand_ids["Pearl"]),
            "priceInCents": 1299900,
            "isRentable": True,
            "rentalPriceInCents": 50000,
            "stock": {"quantity": 4, "reserved": 0, "minStock": 1},
        },
        {
            "name": "Micrófono Shure SM58",
            "sku": "MIC-SHU-SM58",
            "barcode": "7501234560036",
            "categoryId": str(category_ids["Audio"]),
            "brandId": str(brand_ids["Shure"]),
            "priceInCents": 189900,
            "isRentable": False,
            "rentalPriceInCents": None,
            "stock": {"quantity": 20, "reserved": 0, "minStock": 5},
        },
        {
            "name": "Set de cuerdas para guitarra eléctrica",
            "sku": "ACC-STR-ELEC",
            "barcode": "7501234560043",
            "categoryId": str(category_ids["Accesorios"]),
            "brandId": None,
            "priceInCents": 19900,
            "isRentable": False,
            "rentalPriceInCents": None,
            "stock": {"quantity": 50, "reserved": 0, "minStock": 10},
        },
    ]

    for product in products:
        if db.products.find_one({"sku": product["sku"]}):
            continue
        db.products.insert_one(
            {
                **product,
                "description": None,
                "supplierId": None,
                "attributes": {},
                "images": [],
                "isActive": True,
                "createdAt": now,
                "updatedAt": now,
            }
        )

    print("Datos iniciales de inventory-api cargados correctamente.")


if __name__ == "__main__":
    run()
