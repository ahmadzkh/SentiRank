from fastapi import APIRouter, status

from app.core.config import settings
from app.schemas.common import ApiResponse
from app.schemas.health import HealthData
from app.utils.response import success_response

router = APIRouter(tags=["health"])


@router.get(
    "/health",
    response_model=ApiResponse[HealthData],
    status_code=status.HTTP_200_OK,
)
def get_health() -> ApiResponse[HealthData]:
    health_data = HealthData(
        service=settings.service_name,
        status="healthy",
        version=settings.service_version,
    )

    return success_response(
        message="SentiRank ML service is healthy.",
        data=health_data,
    )
