from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health_endpoint_responds_success():
    response = client.get("/api/health/")
    assert response.status_code == 200
    body = response.json()
    assert body["success"] is True
    assert body["service"] == "inventory-api"
