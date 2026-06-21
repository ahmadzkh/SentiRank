from typing import Any

from fastapi import APIRouter, Query
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from app.core.config import get_settings
from app.services.research_data_service import ResearchDataService

router = APIRouter(tags=["review-data"])


def _service() -> ResearchDataService:
    return ResearchDataService(get_settings())


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


@router.get("/dataset/summary", response_model=None)
def dataset_summary():
    try:
        data = _service().dataset_summary()
    except OSError:
        return error_response("Dataset summary could not be loaded.", "DATASET_SUMMARY_ERROR")
    return success_response("Dataset summary loaded.", data)


@router.get("/scraping/summary", response_model=None)
def scraping_summary():
    try:
        data = _service().scraping_summary()
    except OSError:
        return error_response("Scraping summary could not be loaded.", "SCRAPING_SUMMARY_ERROR")
    return success_response("Scraping summary loaded.", data)


@router.get("/preprocessing/summary", response_model=None)
def preprocessing_summary():
    try:
        data = _service().preprocessing_summary()
    except OSError:
        return error_response(
            "Preprocessing summary could not be loaded.",
            "PREPROCESSING_SUMMARY_ERROR",
        )
    return success_response("Preprocessing summary loaded.", data)


@router.get("/reviews/random", response_model=None)
def random_reviews(
    limit: int = Query(default=10, ge=1),
    sentiment: str | None = Query(default=None),
    rating: int | None = Query(default=None, ge=1, le=5),
    seed: int | None = Query(default=None),
):
    try:
        data = _service().random_reviews(limit=limit, sentiment=sentiment, rating=rating, seed=seed)
    except OSError:
        return error_response(
            "Random review samples could not be loaded.",
            "RANDOM_REVIEWS_ERROR",
        )
    return success_response("Random review samples loaded.", data)


@router.get("/reviews/latest-negative", response_model=None)
def latest_negative_reviews(
    limit: int = Query(default=5, ge=1),
    sort: str = Query(default="reviewed_at_desc", pattern="^(reviewed_at_desc|word_count_desc)$"),
):
    try:
        data = _service().latest_negative_reviews(limit=limit, sort=sort)
    except OSError:
        return error_response(
            "Latest negative reviews could not be loaded.",
            "LATEST_NEGATIVE_REVIEWS_ERROR",
        )
    return success_response("Latest negative reviews loaded.", data)
