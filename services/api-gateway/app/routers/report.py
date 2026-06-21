from fastapi import APIRouter
from fastapi.responses import JSONResponse

from app.clients.service_client import ServiceClient, ServiceClientError
from app.core.config import get_settings

router = APIRouter(tags=["reports"])


def error_response(error: ServiceClientError) -> JSONResponse:
    return JSONResponse(
        status_code=error.status_code,
        content={
            "success": False,
            "message": error.message,
            "error": {
                "code": error.code,
                "details": {},
            },
        },
    )


async def proxy_report_request(path: str) -> JSONResponse:
    settings = get_settings()
    client = ServiceClient(timeout_seconds=settings.request_timeout_seconds)
    url = f"{settings.report_service_url.rstrip('/')}{path}"

    try:
        status_code, payload = await client.request_json(
            "GET",
            url,
            service_name="report-service",
        )
    except ServiceClientError as error:
        return error_response(error)

    return JSONResponse(status_code=status_code, content=payload)


@router.get("/reports/summary")
async def report_summary() -> JSONResponse:
    return await proxy_report_request("/reports/summary")


@router.get("/evaluation/summary")
async def evaluation_summary() -> JSONResponse:
    return await proxy_report_request("/evaluation/summary")


@router.get("/reports/ranking-comparison")
async def ranking_comparison() -> JSONResponse:
    return await proxy_report_request("/reports/ranking-comparison")
