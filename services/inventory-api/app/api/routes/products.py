from typing import Optional

from fastapi import APIRouter, Depends, Query

from app.api.deps import get_product_service
from app.models.Product import ProductCreate, ProductUpdate
from app.services.product_service import ProductService
from app.utils.response import success

router = APIRouter(prefix="/api/products", tags=["Products"])


@router.get("/")
def list_products(
    q: Optional[str] = Query(default=None, description="Búsqueda por nombre, SKU o código de barras"),
    categoryId: Optional[str] = None,
    rentable: bool = False,
    service: ProductService = Depends(get_product_service),
):
    return success(service.list(q, categoryId, rentable))


@router.get("/low-stock")
def list_low_stock(service: ProductService = Depends(get_product_service)):
    return success(service.low_stock())


@router.get("/barcode/{barcode}")
def get_by_barcode(barcode: str, service: ProductService = Depends(get_product_service)):
    return success(service.get_by_barcode(barcode))


@router.get("/{product_id}")
def get_product(product_id: str, service: ProductService = Depends(get_product_service)):
    return success(service.get(product_id))


@router.post("/", status_code=201)
def create_product(payload: ProductCreate, service: ProductService = Depends(get_product_service)):
    return success(service.create(payload), "Producto creado correctamente")


@router.patch("/{product_id}")
def update_product(
    product_id: str, payload: ProductUpdate, service: ProductService = Depends(get_product_service)
):
    return success(service.update(product_id, payload), "Producto actualizado correctamente")


@router.delete("/{product_id}")
def delete_product(product_id: str, service: ProductService = Depends(get_product_service)):
    service.delete(product_id)
    return success(None, "Producto desactivado correctamente")
