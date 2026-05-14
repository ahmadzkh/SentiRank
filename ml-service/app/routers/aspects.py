from fastapi import APIRouter, status

from app.schemas.common import ApiResponse, PlaceholderData
from app.services.aspect_service import get_aspect_status
from app.utils.response import success_response

router = APIRouter(prefix="/aspects", tags=["aspects"])


@router.get(
    "",
    response_model=ApiResponse[PlaceholderData],
    status_code=status.HTTP_200_OK,
)
def get_aspects_boundary() -> ApiResponse[PlaceholderData]:
    return success_response(
        message="Aspect classification service boundary is ready.",
        data=get_aspect_status(),
    )
