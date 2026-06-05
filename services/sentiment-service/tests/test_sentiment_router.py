from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_get_health_should_return_sentiment_service_status() -> None:
    response = client.get("/health")

    assert response.status_code == 200
    payload = response.json()
    assert payload["success"] is True
    assert payload["message"] == "Sentiment service is healthy."
    assert payload["data"]["service"] == "sentiment-service"
    assert payload["data"]["model_status"] in {"available", "unavailable"}


def test_predict_should_return_fallback_envelope_when_model_missing() -> None:
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
    assert payload["data"]["warnings"]


def test_summary_routes_should_return_standard_envelope() -> None:
    for path in ["/sentiment/summary", "/sentiment/evaluation"]:
        response = client.get(path)
        assert response.status_code == 200
        payload = response.json()
        assert payload["success"] is True
        assert "warnings" in payload["data"]


def test_predict_should_reject_blank_text() -> None:
    response = client.post("/sentiment/predict", json={"text": "   "})

    assert response.status_code == 422
