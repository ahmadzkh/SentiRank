from typing import Any

from fastapi.testclient import TestClient

from app.clients.service_client import ServiceClient, ServiceClientError
from app.main import app


client = TestClient(app)


def test_review_summary_routes_should_preserve_success_envelope(monkeypatch) -> None:
    async def fake_request_json(self, method, url, json_body=None, query_params=None, service_name="decision-service"):
        assert method == "GET"
        assert service_name == "review-service"
        return 200, {
            "success": True,
            "message": "Summary loaded.",
            "data": {"upstream_url": url, "warnings": []},
        }

    monkeypatch.setattr(ServiceClient, "request_json", fake_request_json)

    response = client.get("/dataset/summary")

    assert response.status_code == 200
    payload = response.json()
    assert payload["success"] is True
    assert payload["data"]["upstream_url"] == "http://review-service:8001/dataset/summary"


def test_random_reviews_should_forward_query_params(monkeypatch) -> None:
    calls: list[dict[str, Any]] = []

    async def fake_request_json(self, method, url, json_body=None, query_params=None, service_name="decision-service"):
        calls.append(
            {
                "method": method,
                "url": url,
                "query_params": query_params,
                "service_name": service_name,
            }
        )
        return 200, {
            "success": True,
            "message": "Random review samples loaded.",
            "data": {"reviews": [], "count": 0, "filters": query_params, "warnings": []},
        }

    monkeypatch.setattr(ServiceClient, "request_json", fake_request_json)

    response = client.get("/reviews/random?limit=5&sentiment=Positive&rating=5&seed=42")

    assert response.status_code == 200
    assert calls == [
        {
            "method": "GET",
            "url": "http://review-service:8001/reviews/random",
            "query_params": {
                "limit": "5",
                "sentiment": "Positive",
                "rating": "5",
                "seed": "42",
            },
            "service_name": "review-service",
        }
    ]


def test_latest_negative_reviews_should_forward_query_params(monkeypatch) -> None:
    calls: list[dict[str, Any]] = []

    async def fake_request_json(self, method, url, json_body=None, query_params=None, service_name="decision-service"):
        calls.append(
            {
                "method": method,
                "url": url,
                "query_params": query_params,
                "service_name": service_name,
            }
        )
        return 200, {
            "success": True,
            "message": "Latest negative reviews loaded.",
            "data": {"reviews": [], "count": 0, "filters": query_params, "warnings": []},
        }

    monkeypatch.setattr(ServiceClient, "request_json", fake_request_json)

    response = client.get("/reviews/latest-negative?limit=5")

    assert response.status_code == 200
    assert calls == [
        {
            "method": "GET",
            "url": "http://review-service:8001/reviews/latest-negative",
            "query_params": {"limit": "5"},
            "service_name": "review-service",
        }
    ]


def test_review_service_unavailable_should_return_error_envelope(monkeypatch) -> None:
    async def fake_request_json(self, method, url, json_body=None, query_params=None, service_name="decision-service"):
        raise ServiceClientError(
            message="Review Service is unavailable.",
            code="REVIEW_SERVICE_UNAVAILABLE",
            status_code=503,
            details={"url": url},
        )

    monkeypatch.setattr(ServiceClient, "request_json", fake_request_json)

    response = client.get("/scraping/summary")

    assert response.status_code == 503
    payload = response.json()
    assert payload["success"] is False
    assert payload["error"]["code"] == "REVIEW_SERVICE_UNAVAILABLE"


def test_all_review_gateway_routes_should_forward(monkeypatch) -> None:
    paths: list[str] = []

    async def fake_request_json(self, method, url, json_body=None, query_params=None, service_name="decision-service"):
        paths.append(url.rsplit("8001", 1)[-1])
        return 200, {"success": True, "message": "Forwarded.", "data": {}}

    monkeypatch.setattr(ServiceClient, "request_json", fake_request_json)

    for path in ["/dataset/summary", "/scraping/summary", "/preprocessing/summary", "/reviews/latest-negative"]:
        response = client.get(path)
        assert response.status_code == 200

    assert paths == [
        "/dataset/summary",
        "/scraping/summary",
        "/preprocessing/summary",
        "/reviews/latest-negative",
    ]
