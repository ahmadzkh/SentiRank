from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_get_health_should_return_report_service_status() -> None:
    response = client.get("/health")

    assert response.status_code == 200
    payload = response.json()
    assert payload["success"] is True
    assert payload["message"] == "Report service is healthy."
    assert payload["data"]["service"] == "report-service"
    assert payload["data"]["status"] == "healthy"


def test_report_routes_should_return_standard_envelope() -> None:
    for path in ["/reports/summary", "/evaluation/summary", "/reports/ranking-comparison"]:
        response = client.get(path)
        assert response.status_code == 200
        payload = response.json()
        assert payload["success"] is True
        assert "warnings" in payload["data"]


def test_report_summary_should_include_selected_models_and_expert_note() -> None:
    response = client.get("/reports/summary")

    assert response.status_code == 200
    data = response.json()["data"]
    assert data["selected_models"]["sentiment"] == "run_3_weighted_loss_lr_1e-5"
    assert data["selected_models"]["aspect"] == "merged_5class"
    assert "expert judgement" in data["expert_judgement_note"].lower()


def test_report_error_should_not_expose_internal_path(monkeypatch) -> None:
    class BrokenReportService:
        def report_summary(self):
            raise OSError("C:/internal/datasets/private.json")

    monkeypatch.setattr(
        "app.routers.report._report_service",
        lambda: BrokenReportService(),
    )

    response = client.get("/reports/summary")

    assert response.status_code == 500
    assert response.json()["error"]["details"] == {}
    assert "internal" not in response.text
    assert "private.json" not in response.text
