from fastapi import APIRouter, status

from app.schemas.common import ApiResponse, PlaceholderData
from app.services.sentiment_service import get_sentiment_status
from app.utils.response import success_response

router = APIRouter(prefix="/sentiment", tags=["sentiment"])


@router.get(
    "",
    response_model=ApiResponse[PlaceholderData],
    status_code=status.HTTP_200_OK,
)
def get_sentiment_boundary() -> ApiResponse[PlaceholderData]:
    return success_response(
        message="Sentiment service boundary is ready.",
        data=get_sentiment_status(),
    )
