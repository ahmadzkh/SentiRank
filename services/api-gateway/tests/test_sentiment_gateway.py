from typing import Any

from fastapi.testclient import TestClient

from app.clients.service_client import ServiceClient, ServiceClientError
from app.main import app


client = TestClient(app)


def test_sentiment_summary_routes_should_preserve_success_envelope(monkeypatch) -> None:
    async def fake_request_json(
        self,
        method,
        url,
        json_body=None,
        query_params=None,
        service_name="decision-service",
    ):
        assert method == "GET"
        assert service_name == "sentiment-service"
        return 200, {
            "success": True,
            "message": "Sentiment summary loaded.",
            "data": {"upstream_url": url, "warnings": []},
        }

    monkeypatch.setattr(ServiceClient, "request_json", fake_request_json)

    response = client.get("/sentiment/summary")

    assert response.status_code == 200
    payload = response.json()
    assert payload["success"] is True
    assert payload["data"]["upstream_url"] == "http://sentiment-service:8002/sentiment/summary"


def test_sentiment_predict_should_forward_json_payload(monkeypatch) -> None:
    calls: list[dict[str, Any]] = []
    request_payload = {"text": "aplikasi sering error", "run_label": "gateway_test"}

    async def fake_request_json(
        self,
        method,
        url,
        json_body=None,
        query_params=None,
        service_name="decision-service",
    ):
        calls.append(
            {
                "method": method,
                "url": url,
                "json_body": json_body,
                "service_name": service_name,
            }
        )
        return 200, {
            "success": True,
            "message": "Sentiment prediction completed.",
            "data": {"label": "Negative", "mode": "fallback"},
        }

    monkeypatch.setattr(ServiceClient, "request_json", fake_request_json)

    response = client.post("/sentiment/predict", json=request_payload)

    assert response.status_code == 200
    assert response.json()["data"]["label"] == "Negative"
    assert calls == [
        {
            "method": "POST",
            "url": "http://sentiment-service:8002/sentiment/predict",
            "json_body": request_payload,
            "service_name": "sentiment-service",
        }
    ]


def test_gateway_should_not_predict_sentiment_locally(monkeypatch) -> None:
    async def fake_request_json(
        self,
        method,
        url,
        json_body=None,
        query_params=None,
        service_name="decision-service",
    ):
        return 200, {
            "success": True,
            "message": "Sentinel upstream response.",
            "data": {"sentinel": "returned_by_sentiment_service_mock"},
        }

    monkeypatch.setattr(ServiceClient, "request_json", fake_request_json)

    response = client.post("/sentiment/predict", json={"text": "bagus"})

    assert response.status_code == 200
    assert response.json()["data"]["sentinel"] == "returned_by_sentiment_service_mock"


def test_sentiment_service_unavailable_should_return_error_envelope(monkeypatch) -> None:
    async def fake_request_json(
        self,
        method,
        url,
        json_body=None,
        query_params=None,
        service_name="decision-service",
    ):
        raise ServiceClientError(
            message="Sentiment service is unavailable.",
            code="SENTIMENT_SERVICE_UNAVAILABLE",
            status_code=503,
            details={"url": url},
        )

    monkeypatch.setattr(ServiceClient, "request_json", fake_request_json)

    response = client.get("/sentiment/evaluation")

    assert response.status_code == 503
    payload = response.json()
    assert payload["success"] is False
    assert payload["error"]["code"] == "SENTIMENT_SERVICE_UNAVAILABLE"
