from typing import Any

from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse

from app.clients.service_client import ServiceClient, ServiceClientError
from app.core.config import get_settings

router = APIRouter(prefix="/ahp", tags=["ahp"])


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


async def proxy_decision_request(
    method: str,
    path: str,
    json_body: dict[str, Any] | None = None,
) -> JSONResponse:
    settings = get_settings()
    client = ServiceClient(timeout_seconds=settings.request_timeout_seconds)
    url = f"{settings.decision_service_url.rstrip('/')}{path}"

    try:
        status_code, payload = await client.request_json(method, url, json_body=json_body)
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


@router.get("/criteria")
async def get_ahp_criteria() -> JSONResponse:
    return await proxy_decision_request("GET", "/ahp/criteria")


@router.post("/calculate")
async def calculate_ahp(request: Request) -> JSONResponse:
    payload = await _request_json_or_empty(request)
    return await proxy_decision_request("POST", "/ahp/calculate", json_body=payload)


@router.post("/fuzzy-calculate")
async def calculate_fuzzy_ahp(request: Request) -> JSONResponse:
    payload = await _request_json_or_empty(request)
    return await proxy_decision_request("POST", "/ahp/fuzzy-calculate", json_body=payload)


@router.post("/compare")
async def compare_ahp(request: Request) -> JSONResponse:
    payload = await _request_json_or_empty(request)
    return await proxy_decision_request("POST", "/ahp/compare", json_body=payload)
