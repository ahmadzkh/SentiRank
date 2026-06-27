from typing import Any

from fastapi import APIRouter
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from app.core.config import get_settings
from app.schemas.aspect import AspectClassifyRequest
from app.services.aspect_classifier_service import AspectClassifierService
from app.services.aspect_summary_service import AspectSummaryService

router = APIRouter(tags=["aspects"])


def _classifier_service() -> AspectClassifierService:
    return AspectClassifierService(get_settings())


def _summary_service() -> AspectSummaryService:
    return AspectSummaryService(get_settings())


def success_response(message: str, data: BaseModel | dict[str, Any]) -> dict[str, Any]:
    payload = data.model_dump() if isinstance(data, BaseModel) else data
    return {
        "success": True,
        "message": message,
        "data": payload,
    }


def error_response(message: str, code: str, details: dict[str, Any] | None = None) -> JSONResponse:
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "message": message,
            "error": {
                "code": code,
                "details": details or {},
            },
        },
    )


@router.post("/aspects/classify", response_model=None)
def classify_aspect(request: AspectClassifyRequest):
    try:
        data = _classifier_service().classify(request.text)
    except OSError:
        return error_response(
            "Aspect classification could not be completed.",
            "ASPECT_CLASSIFICATION_ERROR",
        )
    return success_response("Aspect classification completed.", data)


@router.get("/aspects/summary", response_model=None)
def aspect_summary():
    try:
        data = _summary_service().summary()
    except OSError:
        return error_response(
            "Aspect summary could not be loaded.",
            "ASPECT_SUMMARY_ERROR",
        )
    return success_response("Aspect summary loaded.", data)


@router.get("/aspects/evaluation", response_model=None)
def aspect_evaluation():
    try:
        data = _summary_service().evaluation()
    except OSError:
        return error_response(
            "Aspect evaluation could not be loaded.",
            "ASPECT_EVALUATION_ERROR",
        )
    return success_response("Aspect evaluation loaded.", data)
