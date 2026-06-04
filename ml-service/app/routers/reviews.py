from fastapi import APIRouter, HTTPException, Query, status

from app.schemas.common import ApiResponse
from app.schemas.reviews import RandomReviewResponse
from app.services.review_service import get_random_review_samples
from app.utils.response import success_response

router = APIRouter(prefix="/reviews", tags=["reviews"])


@router.get(
    "/random",
    response_model=ApiResponse[RandomReviewResponse],
    status_code=status.HTTP_200_OK,
)
def get_random_reviews(
    limit: int = Query(default=10, ge=1, le=50),
    sentiment: str | None = Query(default=None),
    aspect: str | None = Query(default=None),
    with_aspect: bool = Query(default=False),
) -> ApiResponse[RandomReviewResponse]:
    try:
        data = get_random_review_samples(
            limit=limit,
            sentiment=sentiment,
            aspect=aspect,
            with_aspect=with_aspect,
        )
    except FileNotFoundError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(error),
        ) from error

    return success_response(
        message="Random research review samples loaded.",
        data=data,
    )
