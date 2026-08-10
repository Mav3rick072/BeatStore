from fastapi import Request
from fastapi.responses import JSONResponse

from app.utils.response import error


class NotFoundError(Exception):
    def __init__(self, resource: str, identifier: str):
        self.resource = resource
        self.identifier = identifier
        super().__init__(f"{resource} con id '{identifier}' no encontrado")


class ConflictError(Exception):
    def __init__(self, message: str):
        self.message = message
        super().__init__(message)


class InsufficientStockError(Exception):
    def __init__(self, product_id: str, requested: int, available: int):
        self.product_id = product_id
        self.requested = requested
        self.available = available
        super().__init__(
            f"Stock insuficiente para el producto {product_id}: "
            f"solicitado {requested}, disponible {available}"
        )


class ValidationAppError(Exception):
    def __init__(self, message: str):
        self.message = message
        super().__init__(message)


async def not_found_handler(request: Request, exc: NotFoundError):
    return JSONResponse(
        status_code=404,
        content=error(str(exc), code="NOT_FOUND"),
    )


async def conflict_handler(request: Request, exc: ConflictError):
    return JSONResponse(
        status_code=409,
        content=error(str(exc), code="CONFLICT"),
    )


async def insufficient_stock_handler(request: Request, exc: InsufficientStockError):
    return JSONResponse(
        status_code=422,
        content=error(
            str(exc),
            code="INSUFFICIENT_STOCK",
            details=[
                {
                    "productId": exc.product_id,
                    "requested": exc.requested,
                    "available": exc.available,
                }
            ],
        ),
    )


async def validation_app_handler(request: Request, exc: ValidationAppError):
    return JSONResponse(
        status_code=400,
        content=error(str(exc), code="VALIDATION_ERROR"),
    )
