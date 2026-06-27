from typing import Any

from fastapi import APIRouter

from app.clients.service_client import ServiceClient, ServiceClientError
from app.core.config import get_settings

router = APIRouter(tags=["health"])


def success_response(message: str, data: dict[str, Any]) -> dict[str, Any]:
    return {
        "success": True,
        "message": message,
        "data": data,
    }


@router.get("/health")
def health() -> dict[str, Any]:
    settings = get_settings()
    return success_response(
        message="API Gateway is healthy.",
        data={
            "service": settings.service_name,
            "status": "healthy",
            "version": settings.service_version,
        },
    )


async def _check_service_health(
    client: ServiceClient,
    service_name: str,
    base_url: str,
) -> dict[str, Any]:
    health_url = f"{base_url.rstrip('/')}/health"
    try:
        status_code, payload = await client.request_json("GET", health_url)
    except ServiceClientError as error:
        if service_name == "decision-service":
            error_code = error.code
            error_message = error.message
        else:
            error_code = "INTERNAL_SERVICE_UNAVAILABLE"
            error_message = f"{service_name} is unavailable."

        return {
            "status": "unavailable",
            "url": base_url,
            "error": {
                "code": error_code,
                "message": error_message,
            },
        }

    upstream_data = payload.get("data", {}) if isinstance(payload, dict) else {}
    return {
        "status": upstream_data.get("status", "healthy") if status_code < 500 else "unhealthy",
        "url": base_url,
        "status_code": status_code,
    }


@router.get("/health/services")
async def service_health() -> dict[str, Any]:
    settings = get_settings()
    client = ServiceClient(timeout_seconds=settings.request_timeout_seconds)
    service_urls = {
        "decision-service": settings.decision_service_url,
        "review-service": settings.review_service_url,
        "sentiment-service": settings.sentiment_service_url,
        "aspect-service": settings.aspect_service_url,
        "report-service": settings.report_service_url,
    }

    checks = {
        service_name: await _check_service_health(client, service_name, service_url)
        for service_name, service_url in service_urls.items()
    }

    return success_response(
        message="Service health check completed.",
        data={
            "api_gateway": "healthy",
            "services": checks,
        },
    )
