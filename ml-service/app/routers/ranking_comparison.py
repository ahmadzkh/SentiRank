from fastapi import APIRouter, status

from app.schemas.common import ApiResponse, PlaceholderData
from app.services.ranking_comparison_service import get_ranking_comparison_status
from app.utils.response import success_response

router = APIRouter(prefix="/ranking-comparison", tags=["ranking-comparison"])


@router.get(
    "",
    response_model=ApiResponse[PlaceholderData],
    status_code=status.HTTP_200_OK,
)
def get_ranking_comparison_boundary() -> ApiResponse[PlaceholderData]:
    return success_response(
        message="Ranking comparison service boundary is ready.",
        data=get_ranking_comparison_status(),
    )
