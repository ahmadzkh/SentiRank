from fastapi.testclient import TestClient

from app.core.config import get_settings
from app.main import app
from app.services.sentiment_inference_service import SentimentInferenceService


client = TestClient(app)


def _configure_missing_model(monkeypatch, tmp_path) -> None:
    monkeypatch.setenv("SENTIMENT_MODEL_SOURCE", "local")
    monkeypatch.setenv("INDOBERT_MODEL_PATH", str(tmp_path / "missing-indobert"))
    monkeypatch.setenv("HF_TOKEN", "secret-test-token")
    get_settings.cache_clear()
    SentimentInferenceService.clear_model_cache()


def test_get_health_should_return_sentiment_service_status(monkeypatch, tmp_path) -> None:
    _configure_missing_model(monkeypatch, tmp_path)

    response = client.get("/health")

    assert response.status_code == 200
    payload = response.json()
    assert payload["success"] is True
    assert payload["message"] == "Sentiment service is healthy."
    assert payload["data"]["service"] == "sentiment-service"
    assert payload["data"]["model_status"] in {"available", "unavailable"}
    assert payload["data"]["model_available"] is False
    assert payload["data"]["prediction_source"] == "fallback_rule"
    assert "secret-test-token" not in response.text


def test_predict_should_return_fallback_envelope_when_model_missing(monkeypatch, tmp_path) -> None:
    _configure_missing_model(monkeypatch, tmp_path)

    response = client.post(
        "/sentiment/predict",
        json={"text": "aplikasi sering error dan lambat", "run_label": "test"},
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["success"] is True
    assert payload["data"]["label"] == "Negative"
    assert payload["data"]["mode"] == "fallback"
    assert payload["data"]["model_name"] == "run_3_weighted_loss_lr_1e-5"
    assert payload["data"]["prediction_source"] == "fallback_rule"
    assert payload["data"]["model_available"] is False
    assert payload["data"]["is_fallback"] is True
    assert payload["data"]["warnings"]
    assert "Model artifact is not available" in payload["data"]["warnings"][0]
    assert "secret-test-token" not in response.text


def test_summary_routes_should_return_standard_envelope(monkeypatch, tmp_path) -> None:
    _configure_missing_model(monkeypatch, tmp_path)

    for path in ["/sentiment/summary", "/sentiment/evaluation"]:
        response = client.get(path)
        assert response.status_code == 200
        payload = response.json()
        assert payload["success"] is True
        assert "warnings" in payload["data"]
        assert "secret-test-token" not in response.text


def test_predict_should_reject_blank_text() -> None:
    response = client.post("/sentiment/predict", json={"text": "   "})

    assert response.status_code == 422


def test_summary_error_should_not_expose_internal_path(monkeypatch) -> None:
    class BrokenSummaryService:
        def summary(self):
            raise OSError("C:/internal/datasets/private.json")

    monkeypatch.setattr(
        "app.routers.sentiment._summary_service",
        lambda: BrokenSummaryService(),
    )

    response = client.get("/sentiment/summary")

    assert response.status_code == 500
    assert response.json()["error"]["details"] == {}
    assert "internal" not in response.text
    assert "private.json" not in response.text
