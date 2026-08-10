from app.database.connection import db
from app.repositories.brand_repository import BrandRepository
from app.repositories.category_repository import CategoryRepository
from app.repositories.movement_repository import MovementRepository
from app.repositories.product_repository import ProductRepository
from app.repositories.reservation_repository import ReservationRepository
from app.repositories.supplier_repository import SupplierRepository
from app.services.brand_service import BrandService
from app.services.category_service import CategoryService
from app.services.inventory_service import InventoryService
from app.services.product_service import ProductService
from app.services.supplier_service import SupplierService

_category_repo = CategoryRepository(db)
_brand_repo = BrandRepository(db)
_supplier_repo = SupplierRepository(db)
_product_repo = ProductRepository(db)
_movement_repo = MovementRepository(db)
_reservation_repo = ReservationRepository(db)

category_service = CategoryService(_category_repo)
brand_service = BrandService(_brand_repo)
supplier_service = SupplierService(_supplier_repo)
product_service = ProductService(_product_repo, _category_repo, _movement_repo)
inventory_service = InventoryService(_product_repo, _movement_repo, _reservation_repo)


def get_category_service() -> CategoryService:
    return category_service


def get_brand_service() -> BrandService:
    return brand_service


def get_supplier_service() -> SupplierService:
    return supplier_service


def get_product_service() -> ProductService:
    return product_service


def get_inventory_service() -> InventoryService:
    return inventory_service
