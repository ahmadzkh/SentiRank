from fastapi.testclient import TestClient

from app.clients.service_client import ServiceClient
from app.main import app


client = TestClient(app)


def test_get_health_should_return_gateway_status() -> None:
    response = client.get("/health")

    assert response.status_code == 200
    payload = response.json()
    assert payload["success"] is True
    assert payload["message"] == "API Gateway is healthy."
    assert payload["data"]["service"] == "api-gateway-service"
    assert payload["data"]["version"] == "0.1.0"


def test_get_health_services_should_return_per_service_status(monkeypatch) -> None:
    async def fake_request_json(self, method, url, json_body=None):
        return 200, {
            "success": True,
            "message": "Service is healthy.",
            "data": {"status": "healthy"},
        }

    monkeypatch.setattr(ServiceClient, "request_json", fake_request_json)

    response = client.get("/health/services")

    assert response.status_code == 200
    payload = response.json()
    assert payload["success"] is True
    assert payload["data"]["api_gateway"] == "healthy"
    assert payload["data"]["services"]["decision-service"]["status"] == "healthy"
