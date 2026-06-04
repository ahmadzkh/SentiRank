from typing import Any

from fastapi.testclient import TestClient

from app.clients.service_client import ServiceClient, ServiceClientError
from app.main import app


client = TestClient(app)


def test_get_ahp_criteria_should_preserve_decision_service_envelope(monkeypatch) -> None:
    async def fake_request_json(self, method, url, json_body=None):
        assert method == "GET"
        assert url.endswith("/ahp/criteria")
        assert json_body is None
        return 200, {
            "success": True,
            "message": "AHP/Fuzzy AHP criteria are ready.",
            "data": [{"id": "C1", "name": "Features, Content & Audio Experience"}],
        }

    monkeypatch.setattr(ServiceClient, "request_json", fake_request_json)

    response = client.get("/ahp/criteria")

    assert response.status_code == 200
    payload = response.json()
    assert payload["success"] is True
    assert payload["message"] == "AHP/Fuzzy AHP criteria are ready."
    assert payload["data"][0]["id"] == "C1"


def test_post_ahp_calculate_should_forward_json_payload(monkeypatch) -> None:
    calls: list[dict[str, Any]] = []
    request_payload = {
        "run_label": "gateway_test",
        "criteria": [
            {"id": "C1", "name": "Features"},
            {"id": "C2", "name": "Reliability"},
        ],
        "comparisons": [
            {"criterion_a": "C1", "criterion_b": "C2", "value_a_over_b": 3},
        ],
    }

    async def fake_request_json(self, method, url, json_body=None):
        calls.append({"method": method, "url": url, "json_body": json_body})
        return 200, {
            "success": True,
            "message": "AHP calculation completed.",
            "data": {"method": "AHP", "run_label": "gateway_test"},
        }

    monkeypatch.setattr(ServiceClient, "request_json", fake_request_json)

    response = client.post("/ahp/calculate", json=request_payload)

    assert response.status_code == 200
    assert response.json()["data"]["method"] == "AHP"
    assert calls == [
        {
            "method": "POST",
            "url": "http://127.0.0.1:8004/ahp/calculate",
            "json_body": request_payload,
        }
    ]


def test_gateway_should_not_calculate_ahp_locally(monkeypatch) -> None:
    async def fake_request_json(self, method, url, json_body=None):
        return 200, {
            "success": True,
            "message": "Sentinel upstream response.",
            "data": {
                "method": "AHP",
                "sentinel": "returned_by_decision_service_mock",
            },
        }

    monkeypatch.setattr(ServiceClient, "request_json", fake_request_json)

    response = client.post(
        "/ahp/calculate",
        json={"criteria": [], "comparisons": []},
    )

    assert response.status_code == 200
    assert response.json()["data"]["sentinel"] == "returned_by_decision_service_mock"


def test_gateway_should_preserve_decision_service_status_code(monkeypatch) -> None:
    async def fake_request_json(self, method, url, json_body=None):
        return 422, {
            "success": False,
            "message": "Expected 10 comparisons, found 9.",
            "error": {"code": "VALIDATION_ERROR", "details": {}},
        }

    monkeypatch.setattr(ServiceClient, "request_json", fake_request_json)

    response = client.post("/ahp/calculate", json={"criteria": [], "comparisons": []})

    assert response.status_code == 422
    payload = response.json()
    assert payload["success"] is False
    assert payload["error"]["code"] == "VALIDATION_ERROR"


def test_gateway_should_handle_decision_service_unavailable(monkeypatch) -> None:
    async def fake_request_json(self, method, url, json_body=None):
        raise ServiceClientError(
            message="Decision service is unavailable.",
            code="DECISION_SERVICE_UNAVAILABLE",
            status_code=503,
            details={"url": url},
        )

    monkeypatch.setattr(ServiceClient, "request_json", fake_request_json)

    response = client.get("/ahp/criteria")

    assert response.status_code == 503
    payload = response.json()
    assert payload["success"] is False
    assert payload["message"] == "Decision service is unavailable."
    assert payload["error"]["code"] == "DECISION_SERVICE_UNAVAILABLE"


def test_post_fuzzy_and_compare_routes_should_forward_to_decision_service(monkeypatch) -> None:
    calls: list[str] = []

    async def fake_request_json(self, method, url, json_body=None):
        calls.append(url)
        return 200, {
            "success": True,
            "message": "Forwarded.",
            "data": {"upstream_path": url.rsplit("8004", 1)[-1]},
        }

    monkeypatch.setattr(ServiceClient, "request_json", fake_request_json)

    fuzzy_response = client.post("/ahp/fuzzy-calculate", json={"sample": True})
    compare_response = client.post("/ahp/compare", json={"sample": True})

    assert fuzzy_response.status_code == 200
    assert compare_response.status_code == 200
    assert calls == [
        "http://127.0.0.1:8004/ahp/fuzzy-calculate",
        "http://127.0.0.1:8004/ahp/compare",
    ]
