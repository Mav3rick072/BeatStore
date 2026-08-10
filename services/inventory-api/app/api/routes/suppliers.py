from fastapi import APIRouter, Depends

from app.api.deps import get_supplier_service
from app.models.Supplier import SupplierCreate, SupplierUpdate
from app.services.supplier_service import SupplierService
from app.utils.response import success

router = APIRouter(prefix="/api/suppliers", tags=["Suppliers"])


@router.get("/")
def list_suppliers(service: SupplierService = Depends(get_supplier_service)):
    return success(service.list())


@router.get("/{supplier_id}")
def get_supplier(supplier_id: str, service: SupplierService = Depends(get_supplier_service)):
    return success(service.get(supplier_id))


@router.post("/", status_code=201)
def create_supplier(payload: SupplierCreate, service: SupplierService = Depends(get_supplier_service)):
    return success(service.create(payload), "Proveedor creado correctamente")


@router.patch("/{supplier_id}")
def update_supplier(
    supplier_id: str, payload: SupplierUpdate, service: SupplierService = Depends(get_supplier_service)
):
    return success(service.update(supplier_id, payload), "Proveedor actualizado correctamente")


@router.delete("/{supplier_id}")
def delete_supplier(supplier_id: str, service: SupplierService = Depends(get_supplier_service)):
    service.delete(supplier_id)
    return success(None, "Proveedor eliminado correctamente")
