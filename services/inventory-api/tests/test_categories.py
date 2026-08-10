from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_create_and_list_category():
    payload = {"name": "Categoría de prueba", "description": "Creada por pytest"}
    create_response = client.post("/api/categories/", json=payload)
    assert create_response.status_code == 201
    body = create_response.json()
    assert body["success"] is True
    assert body["data"]["name"] == payload["name"]

    list_response = client.get("/api/categories/")
    assert list_response.status_code == 200
    names = [c["name"] for c in list_response.json()["data"]]
    assert payload["name"] in names
