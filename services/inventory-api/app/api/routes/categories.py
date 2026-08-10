from fastapi import APIRouter, Depends

from app.api.deps import get_category_service
from app.models.Category import CategoryCreate, CategoryUpdate
from app.services.category_service import CategoryService
from app.utils.response import success

router = APIRouter(prefix="/api/categories", tags=["Categories"])


@router.get("/")
def list_categories(service: CategoryService = Depends(get_category_service)):
    return success(service.list())


@router.get("/{category_id}")
def get_category(category_id: str, service: CategoryService = Depends(get_category_service)):
    return success(service.get(category_id))


@router.post("/", status_code=201)
def create_category(payload: CategoryCreate, service: CategoryService = Depends(get_category_service)):
    return success(service.create(payload), "Categoría creada correctamente")


@router.patch("/{category_id}")
def update_category(
    category_id: str, payload: CategoryUpdate, service: CategoryService = Depends(get_category_service)
):
    return success(service.update(category_id, payload), "Categoría actualizada correctamente")


@router.delete("/{category_id}")
def delete_category(category_id: str, service: CategoryService = Depends(get_category_service)):
    service.delete(category_id)
    return success(None, "Categoría eliminada correctamente")
