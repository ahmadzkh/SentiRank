import asyncio
from pathlib import Path
from typing import Any

from fastapi.testclient import TestClient

from app.clients.service_client import ServiceClient
from app.core.config import Settings
from app.main import app
from app.repositories.inference_history_repository import (
    InferenceHistoryRepository,
    InferencePersistenceError,
)
from app.services.runtime_review_inference_service import RuntimeReviewInferenceService


client = TestClient(app)


def _settings(database_url: str) -> Settings:
    return Settings(
        request_timeout_seconds=1,
        sentiment_service_url="http://sentiment-service:8002",
        aspect_service_url="http://aspect-service:8003",
        database_url=database_url,
    )


def _sentiment_payload(is_fallback: bool = False) -> dict[str, Any]:
    return {
        "success": True,
        "message": "Sentiment prediction completed.",
        "data": {
            "text": "iklan terlalu banyak",
            "label": "Negative",
            "confidence": 0.94,
            "probabilities": {
                "Negative": 0.94,
                "Neutral": 0.04,
                "Positive": 0.02,
            },
            "model_name": "run_3_weighted_loss_lr_1e-5",
            "mode": "fallback" if is_fallback else "model",
            "prediction_source": "fallback_rule" if is_fallback else "model",
            "model_available": not is_fallback,
            "is_fallback": is_fallback,
            "warnings": ["sentiment fallback"] if is_fallback else [],
        },
    }


def _aspect_payload(is_fallback: bool = False) -> dict[str, Any]:
    return {
        "success": True,
        "message": "Aspect classification completed.",
        "data": {
            "text": "iklan terlalu banyak",
            "label": "Ads Experience",
            "confidence": None if is_fallback else 0.88,
            "scores": {} if is_fallback else {"Ads Experience": 0.88},
            "classifier_name": "merged_5class",
            "model_name": None if is_fallback else "svm_merged_5class",
            "mode": "fallback" if is_fallback else "model",
            "prediction_source": "fallback_keyword" if is_fallback else "model",
            "model_available": not is_fallback,
            "is_fallback": is_fallback,
            "warnings": ["aspect fallback"] if is_fallback else [],
        },
    }


class FakeServiceClient:
    def __init__(self, calls: list[dict[str, Any]], fallback: bool = False) -> None:
        self.calls = calls
        self.fallback = fallback

    async def request_json(
        self,
        method,
        url,
        json_body=None,
        query_params=None,
        service_name="decision-service",
    ):
        self.calls.append(
            {
                "method": method,
                "url": url,
                "json_body": json_body,
                "service_name": service_name,
            }
        )
        if service_name == "sentiment-service":
            return 200, _sentiment_payload(is_fallback=self.fallback)
        if service_name == "aspect-service":
            return 200, _aspect_payload(is_fallback=self.fallback)
        raise AssertionError(f"unexpected service call: {service_name}")


class FailingRepository:
    def save(self, record):
        raise InferencePersistenceError("database unavailable")

    def list_latest(self, limit):
        return []

    def check_ready(self):
        return {"ready": False}


def _sqlite_url(tmp_path: Path) -> str:
    return f"sqlite:///{tmp_path / 'runtime_history.db'}"


def test_empty_text_should_be_rejected() -> None:
    response = client.post("/inference/review", json={"text": ""})

    assert response.status_code == 422
    payload = response.json()
    assert payload["success"] is False
    assert payload["message"] == "Teks ulasan wajib diisi."
    assert payload["data"] is None


def test_invalid_json_should_return_controlled_validation_error() -> None:
    response = client.post(
        "/inference/review",
        data="{invalid-json",
        headers={"Content-Type": "application/json"},
    )

    assert response.status_code == 422
    payload = response.json()
    assert payload["success"] is False
    assert payload["message"] == "Teks ulasan wajib diisi."
    assert payload["data"] is None


def test_valid_review_should_call_sentiment_and_aspect_and_persist(tmp_path: Path) -> None:
    calls: list[dict[str, Any]] = []
    repository = InferenceHistoryRepository(_sqlite_url(tmp_path))
    service = RuntimeReviewInferenceService(
        settings=_settings(repository.database_url),
        client=FakeServiceClient(calls),
        repository=repository,
    )

    result = asyncio.run(service.infer_review("iklan terlalu banyak dan aplikasi sering lag"))
    history = repository.list_latest(10)

    assert result["saved"] is True
    assert result["sentiment"]["label"] == "Negative"
    assert result["aspect"]["label"] == "Ads Experience"
    assert result["sentiment"]["prediction_source"] == "model"
    assert result["aspect"]["prediction_source"] == "model"
    assert len(history) == 1
    assert history[0]["id"] == result["id"]
    assert [call["service_name"] for call in calls] == ["sentiment-service", "aspect-service"]
    assert calls[0]["json_body"]["text"] == "iklan terlalu banyak dan aplikasi sering lag"


def test_history_should_return_newest_records_first(tmp_path: Path) -> None:
    repository = InferenceHistoryRepository(_sqlite_url(tmp_path))
    settings = _settings(repository.database_url)

    first_service = RuntimeReviewInferenceService(
        settings=settings,
        client=FakeServiceClient([]),
        repository=repository,
    )
    second_service = RuntimeReviewInferenceService(
        settings=settings,
        client=FakeServiceClient([]),
        repository=repository,
    )

    first = asyncio.run(first_service.infer_review("review pertama"))
    second = asyncio.run(second_service.infer_review("review kedua"))
    history = repository.list_latest(10)

    assert [item["id"] for item in history] == [second["id"], first["id"]]


def test_downstream_fallback_metadata_should_be_preserved(tmp_path: Path) -> None:
    calls: list[dict[str, Any]] = []
    repository = InferenceHistoryRepository(_sqlite_url(tmp_path))
    service = RuntimeReviewInferenceService(
        settings=_settings(repository.database_url),
        client=FakeServiceClient(calls, fallback=True),
        repository=repository,
    )

    result = asyncio.run(service.infer_review("teks demo fallback"))
    history = repository.list_latest(1)

    assert result["sentiment"]["prediction_source"] == "fallback_rule"
    assert result["sentiment"]["model_available"] is False
    assert result["sentiment"]["is_fallback"] is True
    assert result["aspect"]["prediction_source"] == "fallback_keyword"
    assert result["aspect"]["model_available"] is False
    assert result["aspect"]["is_fallback"] is True
    assert history[0]["sentiment"]["prediction_source"] == "fallback_rule"
    assert history[0]["aspect"]["prediction_source"] == "fallback_keyword"


def test_database_error_should_return_saved_false() -> None:
    service = RuntimeReviewInferenceService(
        settings=_settings("sqlite:///unused.db"),
        client=FakeServiceClient([]),
        repository=FailingRepository(),
    )

    result = asyncio.run(service.infer_review("iklan terlalu banyak"))

    assert result["saved"] is False
    assert result["warnings"]
    assert result["persistence_error"]["code"] == "INFERENCE_PERSISTENCE_ERROR"


def test_inference_endpoint_should_use_runtime_service(monkeypatch) -> None:
    class FakeRuntimeService:
        async def infer_review(self, text: str) -> dict[str, Any]:
            return {
                "id": "runtime-1",
                "text": text,
                "sentiment": {"label": "Negative", "prediction_source": "model", "is_fallback": False},
                "aspect": {"label": "Ads Experience", "prediction_source": "model", "is_fallback": False},
                "saved": True,
                "created_at": "2026-06-19T00:00:00+00:00",
            }

    monkeypatch.setattr("app.routers.inference.get_runtime_service", lambda: FakeRuntimeService())

    response = client.post("/inference/review", json={"text": " iklan terlalu banyak "})

    assert response.status_code == 200
    payload = response.json()
    assert payload["success"] is True
    assert payload["message"] == "Inference completed and saved."
    assert payload["data"]["text"] == "iklan terlalu banyak"


def test_history_endpoint_should_clamp_limit(monkeypatch) -> None:
    class FakeRuntimeService:
        def list_history(self, limit: int) -> dict[str, Any]:
            return {"items": [{"limit": limit}], "total": 1}

    monkeypatch.setattr("app.routers.inference.get_runtime_service", lambda: FakeRuntimeService())

    response = client.get("/inference/history?limit=500")

    assert response.status_code == 200
    assert response.json()["data"]["items"][0]["limit"] == 100
