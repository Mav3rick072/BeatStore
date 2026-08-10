from fastapi import APIRouter, Depends

from app.api.deps import get_brand_service
from app.models.Brand import BrandCreate, BrandUpdate
from app.services.brand_service import BrandService
from app.utils.response import success

router = APIRouter(prefix="/api/brands", tags=["Brands"])


@router.get("/")
def list_brands(service: BrandService = Depends(get_brand_service)):
    return success(service.list())


@router.get("/{brand_id}")
def get_brand(brand_id: str, service: BrandService = Depends(get_brand_service)):
    return success(service.get(brand_id))


@router.post("/", status_code=201)
def create_brand(payload: BrandCreate, service: BrandService = Depends(get_brand_service)):
    return success(service.create(payload), "Marca creada correctamente")


@router.patch("/{brand_id}")
def update_brand(brand_id: str, payload: BrandUpdate, service: BrandService = Depends(get_brand_service)):
    return success(service.update(brand_id, payload), "Marca actualizada correctamente")


@router.delete("/{brand_id}")
def delete_brand(brand_id: str, service: BrandService = Depends(get_brand_service)):
    service.delete(brand_id)
    return success(None, "Marca eliminada correctamente")
