from fastapi import APIRouter

from app.core.config import settings
from app.database.connection import mongodb

router = APIRouter(prefix="/api/health", tags=["Health"])


@router.get("/")
def health_check():
    mongo_ok = mongodb.ping()
    return {
        "success": True,
        "service": "inventory-api",
        "language": "Python",
        "framework": "FastAPI",
        "message": "Inventory API is running.",
        "database": "connected" if mongo_ok else "unreachable",
        "data": {"env": settings.app_env, "version": settings.app_version},
    }
