from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_get_health_should_return_aspect_service_status() -> None:
    response = client.get("/health")

    assert response.status_code == 200
    payload = response.json()
    assert payload["success"] is True
    assert payload["message"] == "Aspect service is healthy."
    assert payload["data"]["service"] == "aspect-service"
    assert payload["data"]["model_status"] in {"available", "unavailable"}


def test_classify_should_return_fallback_envelope() -> None:
    response = client.post(
        "/aspects/classify",
        json={"text": "iklan terlalu banyak dan mengganggu", "run_label": "test"},
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["success"] is True
    assert payload["data"]["label"] == "Ads Experience"
    assert payload["data"]["mode"] == "fallback"
    assert payload["data"]["classifier_name"] == "merged_5class"
    assert payload["data"]["warnings"]


def test_classify_should_reject_blank_text() -> None:
    response = client.post("/aspects/classify", json={"text": "   "})

    assert response.status_code == 422


def test_summary_routes_should_return_standard_envelope() -> None:
    for path in ["/aspects/summary", "/aspects/evaluation"]:
        response = client.get(path)
        assert response.status_code == 200
        payload = response.json()
        assert payload["success"] is True
        assert "warnings" in payload["data"]


def test_summary_error_should_not_expose_internal_path(monkeypatch) -> None:
    class BrokenSummaryService:
        def summary(self):
            raise OSError("C:/internal/datasets/private.json")

    monkeypatch.setattr(
        "app.routers.aspect._summary_service",
        lambda: BrokenSummaryService(),
    )

    response = client.get("/aspects/summary")

    assert response.status_code == 500
    assert response.json()["error"]["details"] == {}
    assert "internal" not in response.text
    assert "private.json" not in response.text
