from typing import Any, Optional


def success(data: Any = None, message: str = "Operación realizada correctamente") -> dict:
    return {"success": True, "message": message, "data": data}


def error(message: str, code: str = "ERROR", details: Optional[list] = None) -> dict:
    return {
        "success": False,
        "message": message,
        "error": {"code": code, "details": details or []},
    }
