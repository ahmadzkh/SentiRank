from typing import Any

from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse

from app.clients.service_client import ServiceClient, ServiceClientError
from app.core.config import get_settings

router = APIRouter(tags=["review-data"])


def error_response(error: ServiceClientError) -> JSONResponse:
    return JSONResponse(
        status_code=error.status_code,
        content={
            "success": False,
            "message": error.message,
            "error": {
                "code": error.code,
                "details": error.details,
            },
        },
    )


async def proxy_review_request(
    path: str,
    query_params: dict[str, Any] | None = None,
) -> JSONResponse:
    settings = get_settings()
    client = ServiceClient(timeout_seconds=settings.request_timeout_seconds)
    url = f"{settings.review_service_url.rstrip('/')}{path}"

    try:
        status_code, payload = await client.request_json(
            "GET",
            url,
            query_params=query_params,
            service_name="review-service",
        )
    except ServiceClientError as error:
        return error_response(error)

    return JSONResponse(status_code=status_code, content=payload)


@router.get("/reviews/random")
async def random_reviews(request: Request) -> JSONResponse:
    return await proxy_review_request(
        "/reviews/random",
        query_params=dict(request.query_params),
    )


@router.get("/reviews/latest-negative")
async def latest_negative_reviews(request: Request) -> JSONResponse:
    return await proxy_review_request(
        "/reviews/latest-negative",
        query_params=dict(request.query_params),
    )


@router.get("/dataset/summary")
async def dataset_summary() -> JSONResponse:
    return await proxy_review_request("/dataset/summary")


@router.get("/scraping/summary")
async def scraping_summary() -> JSONResponse:
    return await proxy_review_request("/scraping/summary")


@router.get("/preprocessing/summary")
async def preprocessing_summary() -> JSONResponse:
    return await proxy_review_request("/preprocessing/summary")
