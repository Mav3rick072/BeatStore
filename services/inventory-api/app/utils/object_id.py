from bson import ObjectId
from bson.errors import InvalidId


def to_object_id(value: str) -> ObjectId:
    try:
        return ObjectId(value)
    except (InvalidId, TypeError):
        raise ValueError(f"'{value}' no es un ObjectId válido")


def is_valid_object_id(value: str) -> bool:
    try:
        ObjectId(value)
        return True
    except (InvalidId, TypeError):
        return False


def serialize_doc(doc: dict) -> dict:
    """Convierte un documento de Mongo a un dict serializable en JSON."""
    if doc is None:
        return None
    doc = dict(doc)
    if "_id" in doc:
        doc["id"] = str(doc.pop("_id"))
    for key, value in list(doc.items()):
        if isinstance(value, ObjectId):
            doc[key] = str(value)
    return doc
