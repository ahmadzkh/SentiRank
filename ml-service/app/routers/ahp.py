from fastapi import APIRouter, status

from app.schemas.common import ApiResponse, PlaceholderData
from app.services.ahp_service import get_ahp_status
from app.utils.response import success_response

router = APIRouter(prefix="/ahp", tags=["ahp"])


@router.get(
    "",
    response_model=ApiResponse[PlaceholderData],
    status_code=status.HTTP_200_OK,
)
def get_ahp_boundary() -> ApiResponse[PlaceholderData]:
    return success_response(
        message="AHP service boundary is ready.",
        data=get_ahp_status(),
    )
