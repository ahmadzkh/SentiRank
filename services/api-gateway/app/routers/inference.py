from typing import Any

from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse

from app.core.config import get_settings
from app.repositories.inference_history_repository import (
    InferenceHistoryRepository,
    InferencePersistenceError,
)
from app.services.runtime_review_inference_service import (
    DownstreamInferenceError,
    RuntimeReviewInferenceService,
)

router = APIRouter(prefix="/inference", tags=["inference"])

MAX_REVIEW_TEXT_LENGTH = 2000
DEFAULT_HISTORY_LIMIT = 20
MAX_HISTORY_LIMIT = 100


def success_response(message: str, data: dict[str, Any]) -> dict[str, Any]:
    return {
        "success": True,
        "message": message,
        "data": data,
    }


def validation_error(message: str) -> JSONResponse:
    return JSONResponse(
        status_code=422,
        content={
            "success": False,
            "message": message,
            "data": None,
        },
    )


def error_response(
    message: str,
    code: str,
    status_code: int,
    details: dict[str, Any] | None = None,
) -> JSONResponse:
    return JSONResponse(
        status_code=status_code,
        content={
            "success": False,
            "message": message,
            "data": None,
            "error": {
                "code": code,
                "details": details or {},
            },
        },
    )


def get_runtime_service() -> RuntimeReviewInferenceService:
    settings = get_settings()
    repository = InferenceHistoryRepository(settings.database_url)
    return RuntimeReviewInferenceService(settings=settings, repository=repository)


async def _request_json_or_empty(request: Request) -> dict[str, Any]:
    body = await request.body()
    if not body:
        return {}
    try:
        payload = await request.json()
    except ValueError:
        return {}
    if not isinstance(payload, dict):
        return {}
    return payload


def _validate_review_text(payload: dict[str, Any]) -> str | JSONResponse:
    text = payload.get("text")
    if not isinstance(text, str):
        return validation_error("Teks ulasan wajib diisi.")

    stripped = text.strip()
    if not stripped:
        return validation_error("Teks ulasan wajib diisi.")

    if len(stripped) > MAX_REVIEW_TEXT_LENGTH:
        return validation_error("Teks ulasan terlalu panjang.")

    return stripped


@router.post("/review", response_model=None)
async def infer_review(request: Request) -> JSONResponse | dict[str, Any]:
    payload = await _request_json_or_empty(request)
    text_or_error = _validate_review_text(payload)
    if isinstance(text_or_error, JSONResponse):
        return text_or_error

    try:
        data = await get_runtime_service().infer_review(text_or_error)
    except DownstreamInferenceError as error:
        return error_response(
            message=error.message,
            code=error.code,
            status_code=error.status_code,
            details=error.details,
        )

    message = "Inference completed and saved." if data.get("saved") else "Inference completed but could not be saved."
    return success_response(message=message, data=data)


@router.get("/history", response_model=None)
def inference_history(limit: int = DEFAULT_HISTORY_LIMIT) -> JSONResponse | dict[str, Any]:
    normalized_limit = max(1, min(limit, MAX_HISTORY_LIMIT))
    try:
        data = get_runtime_service().list_history(normalized_limit)
    except InferencePersistenceError as error:
        return error_response(
            message="Riwayat inference tidak dapat dimuat.",
            code="INFERENCE_HISTORY_UNAVAILABLE",
            status_code=503,
            details={"reason": str(error)},
        )

    return success_response(message="Inference history loaded.", data=data)


@router.get("/health")
async def inference_health() -> dict[str, Any]:
    service = get_runtime_service()
    return success_response(
        message="Inference runtime health check completed.",
        data={
            "persistence": service.persistence_health(),
            "downstream_services": await service.downstream_health(),
        },
    )
