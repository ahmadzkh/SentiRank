from fastapi import APIRouter, status

from app.schemas.common import ApiResponse, PlaceholderData
from app.services.fuzzy_ahp_service import get_fuzzy_ahp_status
from app.utils.response import success_response

router = APIRouter(prefix="/fuzzy-ahp", tags=["fuzzy-ahp"])


@router.get(
    "",
    response_model=ApiResponse[PlaceholderData],
    status_code=status.HTTP_200_OK,
)
def get_fuzzy_ahp_boundary() -> ApiResponse[PlaceholderData]:
    return success_response(
        message="Fuzzy AHP service boundary is ready.",
        data=get_fuzzy_ahp_status(),
    )
