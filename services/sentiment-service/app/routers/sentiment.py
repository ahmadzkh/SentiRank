from typing import Any

from fastapi import APIRouter
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from app.core.config import get_settings
from app.schemas.sentiment import SentimentPredictRequest
from app.services.sentiment_inference_service import SentimentInferenceService
from app.services.sentiment_summary_service import SentimentSummaryService

router = APIRouter(tags=["sentiment"])


def _inference_service() -> SentimentInferenceService:
    return SentimentInferenceService(get_settings())


def _summary_service() -> SentimentSummaryService:
    return SentimentSummaryService(get_settings())


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


@router.post("/sentiment/predict", response_model=None)
def predict_sentiment(request: SentimentPredictRequest):
    try:
        data = _inference_service().predict(request.text)
    except OSError as error:
        return error_response(
            "Sentiment prediction could not be completed.",
            "SENTIMENT_PREDICTION_ERROR",
            {"reason": str(error)},
        )
    return success_response("Sentiment prediction completed.", data)


@router.get("/sentiment/summary", response_model=None)
def sentiment_summary():
    try:
        data = _summary_service().summary()
    except OSError as error:
        return error_response(
            "Sentiment summary could not be loaded.",
            "SENTIMENT_SUMMARY_ERROR",
            {"reason": str(error)},
        )
    return success_response("Sentiment summary loaded.", data)


@router.get("/sentiment/evaluation", response_model=None)
def sentiment_evaluation():
    try:
        data = _summary_service().evaluation()
    except OSError as error:
        return error_response(
            "Sentiment evaluation could not be loaded.",
            "SENTIMENT_EVALUATION_ERROR",
            {"reason": str(error)},
        )
    return success_response("Sentiment evaluation loaded.", data)
