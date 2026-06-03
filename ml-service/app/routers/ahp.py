import json
from pathlib import Path

from fastapi import APIRouter, HTTPException, status

from app.schemas.ahp import (
    AhpCalculateRequest,
    AhpCalculateResponse,
    Criterion,
    FuzzyAhpCalculateRequest,
    FuzzyAhpCalculateResponse,
    RankingComparisonRequest,
    RankingComparisonResponse,
)
from app.schemas.common import ApiResponse, PlaceholderData
from app.services.ahp_calculator import calculate_ahp
from app.services.ahp_service import get_ahp_status
from app.services.fuzzy_ahp_calculator import calculate_fuzzy_ahp
from app.services.ranking_comparison import compare_ahp_and_fuzzy_ahp
from app.utils.response import success_response

router = APIRouter(prefix="/ahp", tags=["ahp"])

FALLBACK_CRITERIA = [
    Criterion(
        id="C1",
        name="Features, Content & Audio Experience",
        description=(
            "Issues or improvement priorities related to music/content availability, "
            "playlist, lyrics, shuffle, download, podcast, recommendations, and "
            "audio listening experience."
        ),
    ),
    Criterion(
        id="C2",
        name="App Reliability & Usability",
        description=(
            "Issues or improvement priorities related to app performance, stability, "
            "loading, bugs, crashes, responsiveness, navigation, layout, and ease of use."
        ),
    ),
    Criterion(
        id="C3",
        name="Ads Experience",
        description=(
            "Issues or improvement priorities related to advertisement frequency, "
            "intrusiveness, interruption, and overall advertising experience."
        ),
    ),
    Criterion(
        id="C4",
        name="Subscription & Pricing",
        description=(
            "Issues or improvement priorities related to premium subscription, pricing, "
            "payment, package value, and perceived affordability."
        ),
    ),
    Criterion(
        id="C5",
        name="Account/Login",
        description=(
            "Issues or improvement priorities related to account access, login, "
            "registration, password, email verification, and account-related problems."
        ),
    ),
]


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


def _project_root() -> Path:
    return Path(__file__).resolve().parents[3]


def _criteria_template_path() -> Path:
    return _project_root() / "docs" / "templates" / "ahp" / "final_criteria_for_ahp.json"


def _load_phase_10a_criteria() -> list[Criterion]:
    template_path = _criteria_template_path()
    if not template_path.exists():
        return FALLBACK_CRITERIA

    try:
        payload = json.loads(template_path.read_text(encoding="utf-8"))
        criteria = payload.get("criteria", [])
        return [
            Criterion(
                id=item["criterion_id"],
                name=item["criterion_name"],
                description=item.get("description"),
            )
            for item in criteria
        ]
    except (KeyError, TypeError, ValueError, json.JSONDecodeError):
        return FALLBACK_CRITERIA


def _validation_error(error: ValueError) -> HTTPException:
    return HTTPException(status_code=422, detail=str(error))


@router.get(
    "/criteria",
    response_model=ApiResponse[list[Criterion]],
    status_code=status.HTTP_200_OK,
)
def get_ahp_criteria() -> ApiResponse[list[Criterion]]:
    return success_response(
        message="AHP/Fuzzy AHP criteria are ready.",
        data=_load_phase_10a_criteria(),
    )


@router.post(
    "/calculate",
    response_model=ApiResponse[AhpCalculateResponse],
    status_code=status.HTTP_200_OK,
)
def calculate_ahp_endpoint(
    request: AhpCalculateRequest,
) -> ApiResponse[AhpCalculateResponse]:
    try:
        result = calculate_ahp(request)
    except ValueError as error:
        raise _validation_error(error) from error

    return success_response(
        message="AHP calculation completed.",
        data=result,
    )


@router.post(
    "/fuzzy-calculate",
    response_model=ApiResponse[FuzzyAhpCalculateResponse],
    status_code=status.HTTP_200_OK,
)
def calculate_fuzzy_ahp_endpoint(
    request: FuzzyAhpCalculateRequest,
) -> ApiResponse[FuzzyAhpCalculateResponse]:
    try:
        result = calculate_fuzzy_ahp(request)
    except ValueError as error:
        raise _validation_error(error) from error

    return success_response(
        message="Fuzzy AHP calculation completed.",
        data=result,
    )


@router.post(
    "/compare",
    response_model=ApiResponse[RankingComparisonResponse],
    status_code=status.HTTP_200_OK,
)
def compare_ahp_endpoint(
    request: RankingComparisonRequest,
) -> ApiResponse[RankingComparisonResponse]:
    try:
        result = compare_ahp_and_fuzzy_ahp(request)
    except ValueError as error:
        raise _validation_error(error) from error

    return success_response(
        message="AHP and Fuzzy AHP comparison completed.",
        data=result,
    )
