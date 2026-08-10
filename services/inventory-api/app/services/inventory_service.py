from datetime import datetime, timezone

from app.core.exceptions import (
    ConflictError,
    InsufficientStockError,
    NotFoundError,
    ValidationAppError,
)
from app.models.InventoryMovement import MovementType, new_movement_document
from app.models.StockReservation import (
    ReservationCreate,
    ReservationStatus,
    new_reservation_document,
)
from app.repositories.movement_repository import MovementRepository
from app.repositories.product_repository import ProductRepository
from app.repositories.reservation_repository import ReservationRepository


class InventoryService:
    def __init__(
        self,
        product_repository: ProductRepository,
        movement_repository: MovementRepository,
        reservation_repository: ReservationRepository,
    ):
        self.products = product_repository
        self.movements = movement_repository
        self.reservations = reservation_repository

    # ------------------------------------------------------------------
    # Movimientos
    # ------------------------------------------------------------------
    def movements_for_product(self, product_id: str) -> list[dict]:
        if not self.products.find_by_id(product_id):
            raise NotFoundError("Producto", product_id)
        return self.movements.find_by_product(product_id)

    def all_movements(self) -> list[dict]:
        return self.movements.find_all()

    def low_stock_alerts(self) -> list[dict]:
        return self.products.low_stock()

    # ------------------------------------------------------------------
    # Reservas de stock (usadas por main-api al registrar una venta)
    # ------------------------------------------------------------------
    def create_reservation(self, payload: ReservationCreate) -> dict:
        existing = self.reservations.find_by_idempotency_key(payload.idempotencyKey)
        if existing:
            # Idempotencia: si ya existe una reserva con esta clave, la devolvemos tal cual.
            return existing

        for item in payload.items:
            product = self.products.find_by_id(item.productId)
            if not product:
                raise NotFoundError("Producto", item.productId)
            available = self.products.available_quantity(item.productId)
            if available < item.quantity:
                raise InsufficientStockError(item.productId, item.quantity, available)

        # Reservamos: aumentamos stock.reserved de cada producto.
        for item in payload.items:
            self.products.increment_reserved(item.productId, item.quantity)

        return self.reservations.insert(new_reservation_document(payload))

    def _get_active_reservation(self, reservation_id: str) -> dict:
        reservation = self.reservations.find_by_id(reservation_id)
        if not reservation:
            raise NotFoundError("Reserva de stock", reservation_id)
        if reservation["status"] != ReservationStatus.PENDING.value:
            raise ConflictError(
                f"La reserva '{reservation_id}' ya se encuentra en estado {reservation['status']}"
            )
        return reservation

    def confirm_reservation(self, reservation_id: str, reference_id: str | None = None) -> dict:
        reservation = self._get_active_reservation(reservation_id)

        for item in reservation["items"]:
            self.products.increment_stock(item["productId"], -item["quantity"])
            self.products.increment_reserved(item["productId"], -item["quantity"])
            self.movements.insert(
                new_movement_document(
                    product_id=item["productId"],
                    movement_type=MovementType.SALE,
                    quantity=-item["quantity"],
                    reason="Confirmación de venta",
                    reference_id=reference_id or reservation["idempotencyKey"],
                    reference_type="SALE",
                )
            )

        return self.reservations.update(
            reservation_id,
            {"status": ReservationStatus.CONFIRMED.value, "updatedAt": datetime.now(timezone.utc)},
        )

    def release_reservation(self, reservation_id: str, reason: str = "Liberación de reserva") -> dict:
        reservation = self._get_active_reservation(reservation_id)

        for item in reservation["items"]:
            self.products.increment_reserved(item["productId"], -item["quantity"])

        return self.reservations.update(
            reservation_id,
            {"status": ReservationStatus.RELEASED.value, "updatedAt": datetime.now(timezone.utc)},
        )

    # ------------------------------------------------------------------
    # Devoluciones y alquileres (llamados desde main-api)
    # ------------------------------------------------------------------
    def register_return(self, product_id: str, quantity: int, reference_id: str) -> dict:
        if quantity <= 0:
            raise ValidationAppError("La cantidad a devolver debe ser mayor a cero")
        if not self.products.find_by_id(product_id):
            raise NotFoundError("Producto", product_id)

        self.products.increment_stock(product_id, quantity)
        self.movements.insert(
            new_movement_document(
                product_id=product_id,
                movement_type=MovementType.RETURN,
                quantity=quantity,
                reason="Devolución de venta",
                reference_id=reference_id,
                reference_type="RETURN",
            )
        )
        return self.products.find_by_id(product_id)

    def register_rental_out(self, product_id: str, quantity: int, reference_id: str) -> dict:
        product = self.products.find_by_id(product_id)
        if not product:
            raise NotFoundError("Producto", product_id)
        if not product.get("isRentable"):
            raise ValidationAppError(f"El producto '{product_id}' no está marcado como alquilable")

        available = self.products.available_quantity(product_id)
        if available < quantity:
            raise InsufficientStockError(product_id, quantity, available)

        self.products.increment_stock(product_id, -quantity)
        self.movements.insert(
            new_movement_document(
                product_id=product_id,
                movement_type=MovementType.RENTAL_OUT,
                quantity=-quantity,
                reason="Salida por alquiler",
                reference_id=reference_id,
                reference_type="RENTAL",
            )
        )
        return self.products.find_by_id(product_id)

    def register_rental_return(self, product_id: str, quantity: int, reference_id: str) -> dict:
        if not self.products.find_by_id(product_id):
            raise NotFoundError("Producto", product_id)

        self.products.increment_stock(product_id, quantity)
        self.movements.insert(
            new_movement_document(
                product_id=product_id,
                movement_type=MovementType.RENTAL_IN,
                quantity=quantity,
                reason="Devolución de alquiler",
                reference_id=reference_id,
                reference_type="RENTAL",
            )
        )
        return self.products.find_by_id(product_id)
