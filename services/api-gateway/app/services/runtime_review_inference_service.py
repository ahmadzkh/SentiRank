"""Runtime review inference orchestration for the API Gateway."""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any
from uuid import uuid4

from app.clients.service_client import ServiceClient, ServiceClientError
from app.core.config import Settings
from app.repositories.inference_history_repository import (
    InferenceHistoryRepository,
    InferencePersistenceError,
    InferenceRecord,
)


class DownstreamInferenceError(Exception):
    def __init__(
        self,
        message: str,
        code: str,
        status_code: int = 502,
        details: dict[str, Any] | None = None,
    ) -> None:
        super().__init__(message)
        self.message = message
        self.code = code
        self.status_code = status_code
        self.details = details or {}


class RuntimeReviewInferenceService:
    """Calls sentiment/aspect services and persists combined runtime results."""

    def __init__(
        self,
        settings: Settings,
        client: ServiceClient | None = None,
        repository: InferenceHistoryRepository | None = None,
    ) -> None:
        self.settings = settings
        self.client = client or ServiceClient(timeout_seconds=settings.request_timeout_seconds)
        self.repository = repository or InferenceHistoryRepository(settings.database_url)

    async def infer_review(self, text: str) -> dict[str, Any]:
        sentiment_data = await self._call_prediction(
            service_name="sentiment-service",
            base_url=self.settings.sentiment_service_url,
            path="/sentiment/predict",
            body={"text": text, "run_label": "runtime_review_inference"},
        )
        aspect_data = await self._call_prediction(
            service_name="aspect-service",
            base_url=self.settings.aspect_service_url,
            path="/aspects/classify",
            body={"text": text, "run_label": "runtime_review_inference"},
        )

        record = self._record_from_predictions(text, sentiment_data, aspect_data)
        try:
            self.repository.save(record)
            return self._response_from_record(record, saved=True)
        except InferencePersistenceError as error:
            warning = "Hasil inference berhasil dibuat, tetapi tidak dapat disimpan ke database."
            record.warnings.append(warning)
            data = self._response_from_record(record, saved=False)
            data["warnings"] = [warning]
            data["persistence_error"] = {"code": "INFERENCE_PERSISTENCE_ERROR", "details": str(error)}
            return data

    def list_history(self, limit: int, page: int = 1) -> dict[str, Any]:
        offset = (page - 1) * limit
        items = self.repository.list_latest(limit, offset)
        total = self.repository.count()
        return {
            "items": items,
            "total": total,
            "page": page,
            "limit": limit,
            "total_pages": max(1, (total + limit - 1) // limit),
        }

    def persistence_health(self) -> dict[str, Any]:
        return self.repository.check_ready()

    async def downstream_health(self) -> dict[str, Any]:
        checks: dict[str, Any] = {}
        for service_name, base_url in {
            "sentiment-service": self.settings.sentiment_service_url,
            "aspect-service": self.settings.aspect_service_url,
        }.items():
            try:
                status_code, payload = await self.client.request_json(
                    "GET",
                    f"{base_url.rstrip('/')}/health",
                    service_name=service_name,
                )
                data = payload.get("data", {}) if isinstance(payload, dict) else {}
                checks[service_name] = {
                    "status": data.get("status", "healthy") if status_code < 500 else "unhealthy",
                    "status_code": status_code,
                    "url": base_url,
                }
            except ServiceClientError as error:
                checks[service_name] = {
                    "status": "unavailable",
                    "url": base_url,
                    "error": {
                        "code": error.code,
                        "message": error.message,
                    },
                }
        return checks

    async def _call_prediction(
        self,
        service_name: str,
        base_url: str,
        path: str,
        body: dict[str, Any],
    ) -> dict[str, Any]:
        url = f"{base_url.rstrip('/')}{path}"
        try:
            status_code, payload = await self.client.request_json(
                "POST",
                url,
                json_body=body,
                service_name=service_name,
            )
        except ServiceClientError as error:
            raise DownstreamInferenceError(
                message=error.message,
                code=error.code,
                status_code=error.status_code,
                details=error.details,
            ) from error

        if status_code >= 400 or payload.get("success") is not True:
            raise DownstreamInferenceError(
                message=payload.get("message", f"{service_name} inference failed."),
                code=f"{service_name.upper().replace('-', '_')}_INFERENCE_FAILED",
                status_code=status_code if status_code >= 400 else 502,
                details={"url": url, "upstream_payload": payload},
            )

        data = payload.get("data")
        if not isinstance(data, dict):
            raise DownstreamInferenceError(
                message=f"{service_name} returned an invalid inference payload.",
                code=f"{service_name.upper().replace('-', '_')}_INVALID_INFERENCE_PAYLOAD",
                details={"url": url},
            )
        return data

    def _record_from_predictions(
        self,
        text: str,
        sentiment: dict[str, Any],
        aspect: dict[str, Any],
    ) -> InferenceRecord:
        return InferenceRecord(
            id=str(uuid4()),
            input_text=text,
            sentiment_label=sentiment.get("label"),
            sentiment_confidence=sentiment.get("confidence"),
            sentiment_probabilities=sentiment.get("probabilities") or {},
            sentiment_model_name=sentiment.get("model_name"),
            sentiment_mode=sentiment.get("mode"),
            sentiment_prediction_source=sentiment.get("prediction_source"),
            sentiment_model_available=bool(sentiment.get("model_available", False)),
            sentiment_is_fallback=bool(sentiment.get("is_fallback", False)),
            aspect_label=aspect.get("label"),
            aspect_confidence=aspect.get("confidence"),
            aspect_scores=aspect.get("scores") or {},
            aspect_model_name=aspect.get("model_name") or aspect.get("classifier_name"),
            aspect_mode=aspect.get("mode"),
            aspect_prediction_source=aspect.get("prediction_source"),
            aspect_model_available=bool(aspect.get("model_available", False)),
            aspect_is_fallback=bool(aspect.get("is_fallback", False)),
            warnings=[*(sentiment.get("warnings") or []), *(aspect.get("warnings") or [])],
            created_at=datetime.now(timezone.utc).isoformat(),
        )

    def _response_from_record(self, record: InferenceRecord, saved: bool) -> dict[str, Any]:
        return {
            "id": record.id,
            "text": record.input_text,
            "sentiment": {
                "label": record.sentiment_label,
                "confidence": record.sentiment_confidence,
                "probabilities": record.sentiment_probabilities,
                "model_name": record.sentiment_model_name,
                "mode": record.sentiment_mode,
                "prediction_source": record.sentiment_prediction_source,
                "model_available": record.sentiment_model_available,
                "is_fallback": record.sentiment_is_fallback,
            },
            "aspect": {
                "label": record.aspect_label,
                "confidence": record.aspect_confidence,
                "scores": record.aspect_scores,
                "model_name": record.aspect_model_name,
                "mode": record.aspect_mode,
                "prediction_source": record.aspect_prediction_source,
                "model_available": record.aspect_model_available,
                "is_fallback": record.aspect_is_fallback,
            },
            "saved": saved,
            "created_at": record.created_at,
        }
