from typing import Any

from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse

from app.clients.service_client import ServiceClient, ServiceClientError
from app.core.config import get_settings

router = APIRouter(prefix="/sentiment", tags=["sentiment"])


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


async def proxy_sentiment_request(
    method: str,
    path: str,
    json_body: dict[str, Any] | None = None,
) -> JSONResponse:
    settings = get_settings()
    client = ServiceClient(timeout_seconds=settings.request_timeout_seconds)
    url = f"{settings.sentiment_service_url.rstrip('/')}{path}"

    try:
        status_code, payload = await client.request_json(
            method,
            url,
            json_body=json_body,
            service_name="sentiment-service",
        )
    except ServiceClientError as error:
        return error_response(error)

    return JSONResponse(status_code=status_code, content=payload)


async def _request_json_or_empty(request: Request) -> dict[str, Any]:
    body = await request.body()
    if not body:
        return {}
    payload = await request.json()
    if not isinstance(payload, dict):
        return {}
    return payload


@router.post("/predict")
async def predict_sentiment(request: Request) -> JSONResponse:
    payload = await _request_json_or_empty(request)
    return await proxy_sentiment_request(
        "POST",
        "/sentiment/predict",
        json_body=payload,
    )


@router.get("/summary")
async def sentiment_summary() -> JSONResponse:
    return await proxy_sentiment_request("GET", "/sentiment/summary")


@router.get("/evaluation")
async def sentiment_evaluation() -> JSONResponse:
    return await proxy_sentiment_request("GET", "/sentiment/evaluation")
