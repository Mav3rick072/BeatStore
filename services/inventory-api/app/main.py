from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.routes.brands import router as brands_router
from app.api.routes.categories import router as categories_router
from app.api.routes.health import router as health_router
from app.api.routes.inventory import router as inventory_router
from app.api.routes.products import router as products_router
from app.api.routes.suppliers import router as suppliers_router
from app.core.config import settings
from app.core.exceptions import (
    ConflictError,
    InsufficientStockError,
    NotFoundError,
    ValidationAppError,
    conflict_handler,
    insufficient_stock_handler,
    not_found_handler,
    validation_app_handler,
)
from app.core.logging import configure_logging
from app.database.connection import mongodb
from app.utils.response import error

configure_logging(settings.app_env)

app = FastAPI(
    title=settings.app_name,
    description="Microservicio encargado de la administración del inventario de BeatStore.",
    version=settings.app_version,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # El único consumidor esperado es main-api dentro de la red de Docker.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_exception_handler(NotFoundError, not_found_handler)
app.add_exception_handler(ConflictError, conflict_handler)
app.add_exception_handler(InsufficientStockError, insufficient_stock_handler)
app.add_exception_handler(ValidationAppError, validation_app_handler)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content=error("Datos de entrada inválidos", code="VALIDATION_ERROR", details=exc.errors()),
    )


@app.on_event("startup")
def on_startup() -> None:
    mongodb.ensure_indexes()


app.include_router(health_router)
app.include_router(categories_router)
app.include_router(brands_router)
app.include_router(suppliers_router)
app.include_router(products_router)
app.include_router(inventory_router)


@app.get("/")
def root():
    return {
        "success": True,
        "message": f"{settings.app_name} is running.",
        "data": None,
    }
