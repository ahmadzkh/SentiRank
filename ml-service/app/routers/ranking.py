from fastapi import APIRouter, status

from app.schemas.common import ApiResponse, PlaceholderData
from app.services.ranking_service import get_ranking_status
from app.utils.response import success_response

router = APIRouter(prefix="/ranking", tags=["ranking"])


@router.get(
    "",
    response_model=ApiResponse[PlaceholderData],
    status_code=status.HTTP_200_OK,
)
def get_ranking_boundary() -> ApiResponse[PlaceholderData]:
    return success_response(
        message="Ranking service boundary is ready.",
        data=get_ranking_status(),
    )
