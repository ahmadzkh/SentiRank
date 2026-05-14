from fastapi import APIRouter, status

from app.schemas.common import ApiResponse, PlaceholderData
from app.services.evaluation_service import get_evaluation_status
from app.utils.response import success_response

router = APIRouter(prefix="/evaluation", tags=["evaluation"])


@router.get(
    "",
    response_model=ApiResponse[PlaceholderData],
    status_code=status.HTTP_200_OK,
)
def get_evaluation_boundary() -> ApiResponse[PlaceholderData]:
    return success_response(
        message="Evaluation service boundary is ready.",
        data=get_evaluation_status(),
    )
