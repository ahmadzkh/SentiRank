from fastapi import APIRouter, status

from app.schemas.common import ApiResponse, PlaceholderData
from app.services.preprocessing_service import get_preprocessing_status
from app.utils.response import success_response

router = APIRouter(prefix="/preprocessing", tags=["preprocessing"])


@router.get(
    "",
    response_model=ApiResponse[PlaceholderData],
    status_code=status.HTTP_200_OK,
)
def get_preprocessing_boundary() -> ApiResponse[PlaceholderData]:
    return success_response(
        message="Preprocessing service boundary is ready.",
        data=get_preprocessing_status(),
    )
