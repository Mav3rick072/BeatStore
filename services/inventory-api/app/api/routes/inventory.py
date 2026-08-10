from pydantic import BaseModel, Field

from fastapi import APIRouter, Depends

from app.api.deps import get_inventory_service
from app.models.StockReservation import ReservationCreate
from app.services.inventory_service import InventoryService
from app.utils.response import success

router = APIRouter(prefix="/api/inventory", tags=["Inventory"])


class AdjustmentRequest(BaseModel):
    quantity: int
    reason: str = Field(..., min_length=3, max_length=200)


class ReturnRequest(BaseModel):
    productId: str
    quantity: int = Field(..., gt=0)
    referenceId: str


class RentalMovementRequest(BaseModel):
    productId: str
    quantity: int = Field(..., gt=0)
    referenceId: str


class ConfirmReservationRequest(BaseModel):
    referenceId: str | None = None


@router.get("/movements")
def all_movements(service: InventoryService = Depends(get_inventory_service)):
    return success(service.all_movements())


@router.get("/movements/{product_id}")
def movements_by_product(product_id: str, service: InventoryService = Depends(get_inventory_service)):
    return success(service.movements_for_product(product_id))


@router.get("/alerts/low-stock")
def low_stock_alerts(service: InventoryService = Depends(get_inventory_service)):
    return success(service.low_stock_alerts())


# --- Reservas de stock (flujo de venta desde main-api) ---------------------

@router.post("/reservations", status_code=201)
def create_reservation(payload: ReservationCreate, service: InventoryService = Depends(get_inventory_service)):
    return success(service.create_reservation(payload), "Reserva de stock creada")


@router.post("/reservations/{reservation_id}/confirm")
def confirm_reservation(
    reservation_id: str,
    payload: ConfirmReservationRequest,
    service: InventoryService = Depends(get_inventory_service),
):
    return success(
        service.confirm_reservation(reservation_id, payload.referenceId),
        "Reserva confirmada, stock descontado",
    )


@router.post("/reservations/{reservation_id}/release")
def release_reservation(reservation_id: str, service: InventoryService = Depends(get_inventory_service)):
    return success(service.release_reservation(reservation_id), "Reserva liberada")


# --- Devoluciones y alquileres ---------------------------------------------

@router.post("/returns")
def register_return(payload: ReturnRequest, service: InventoryService = Depends(get_inventory_service)):
    return success(
        service.register_return(payload.productId, payload.quantity, payload.referenceId),
        "Devolución registrada, stock actualizado",
    )


@router.post("/rentals/checkout")
def rental_checkout(payload: RentalMovementRequest, service: InventoryService = Depends(get_inventory_service)):
    return success(
        service.register_rental_out(payload.productId, payload.quantity, payload.referenceId),
        "Salida por alquiler registrada",
    )


@router.post("/rentals/checkin")
def rental_checkin(payload: RentalMovementRequest, service: InventoryService = Depends(get_inventory_service)):
    return success(
        service.register_rental_return(payload.productId, payload.quantity, payload.referenceId),
        "Devolución de alquiler registrada",
    )
