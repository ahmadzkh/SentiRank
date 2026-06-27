from app.clients.service_client import ServiceClient, ServiceClientError
from app.main import app
from fastapi.testclient import TestClient


client = TestClient(app)


def test_report_summary_route_should_preserve_success_envelope(monkeypatch) -> None:
    async def fake_request_json(
        self,
        method,
        url,
        json_body=None,
        query_params=None,
        service_name="decision-service",
    ):
        assert method == "GET"
        assert service_name == "report-service"
        return 200, {
            "success": True,
            "message": "Report summary loaded.",
            "data": {"upstream_url": url, "project_name": "SentiRank"},
        }

    monkeypatch.setattr(ServiceClient, "request_json", fake_request_json)

    response = client.get("/reports/summary")

    assert response.status_code == 200
    payload = response.json()
    assert payload["success"] is True
    assert payload["data"]["upstream_url"] == "http://report-service:8005/reports/summary"


def test_evaluation_summary_route_should_be_proxied(monkeypatch) -> None:
    calls = []

    async def fake_request_json(
        self,
        method,
        url,
        json_body=None,
        query_params=None,
        service_name="decision-service",
    ):
        calls.append({"method": method, "url": url, "service_name": service_name})
        return 200, {
            "success": True,
            "message": "Evaluation summary loaded.",
            "data": {"selected_indobert_model": "run_3_weighted_loss_lr_1e-5"},
        }

    monkeypatch.setattr(ServiceClient, "request_json", fake_request_json)

    response = client.get("/evaluation/summary")

    assert response.status_code == 200
    assert response.json()["data"]["selected_indobert_model"] == "run_3_weighted_loss_lr_1e-5"
    assert calls == [
        {
            "method": "GET",
            "url": "http://report-service:8005/evaluation/summary",
            "service_name": "report-service",
        }
    ]


def test_ranking_comparison_route_should_be_proxied(monkeypatch) -> None:
    calls = []

    async def fake_request_json(
        self,
        method,
        url,
        json_body=None,
        query_params=None,
        service_name="decision-service",
    ):
        calls.append({"method": method, "url": url, "service_name": service_name})
        return 200, {
            "success": True,
            "message": "Ranking comparison loaded.",
            "data": {"items": [], "summary": {}, "warnings": []},
        }

    monkeypatch.setattr(ServiceClient, "request_json", fake_request_json)

    response = client.get("/reports/ranking-comparison")

    assert response.status_code == 200
    assert calls == [
        {
            "method": "GET",
            "url": "http://report-service:8005/reports/ranking-comparison",
            "service_name": "report-service",
        }
    ]


def test_report_service_unavailable_should_return_error_envelope(monkeypatch) -> None:
    async def fake_request_json(
        self,
        method,
        url,
        json_body=None,
        query_params=None,
        service_name="decision-service",
    ):
        raise ServiceClientError(
            message="Report service is unavailable.",
            code="REPORT_SERVICE_UNAVAILABLE",
            status_code=503,
            details={"url": url},
        )

    monkeypatch.setattr(ServiceClient, "request_json", fake_request_json)

    response = client.get("/reports/summary")

    assert response.status_code == 503
    payload = response.json()
    assert payload["success"] is False
    assert payload["error"]["code"] == "REPORT_SERVICE_UNAVAILABLE"
    assert payload["error"]["details"] == {}
    assert "http://report-service" not in response.text
