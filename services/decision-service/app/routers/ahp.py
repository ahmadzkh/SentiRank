from fastapi import APIRouter
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from app.schemas.ahp import (
    AhpCalculateRequest,
    Criterion,
    FuzzyAhpCalculateRequest,
    RankingComparisonRequest,
)
from app.services.ahp_calculator import calculate_ahp
from app.services.fuzzy_ahp_calculator import calculate_fuzzy_ahp
from app.services.ranking_comparison import compare_ahp_and_fuzzy_ahp

router = APIRouter(prefix="/ahp", tags=["ahp"])

FINAL_CRITERIA = [
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


def success_response(message: str, data: BaseModel | list[BaseModel] | dict) -> dict:
    if isinstance(data, BaseModel):
        payload = data.model_dump()
    elif isinstance(data, list):
        payload = [
            item.model_dump() if isinstance(item, BaseModel) else item
            for item in data
        ]
    else:
        payload = data

    return {
        "success": True,
        "message": message,
        "data": payload,
    }


def validation_error_response(error: ValueError) -> JSONResponse:
    return JSONResponse(
        status_code=422,
        content={
            "success": False,
            "message": str(error),
            "error": {
                "code": "VALIDATION_ERROR",
                "details": {
                    "reason": str(error),
                },
            },
        },
    )


@router.get("/criteria", response_model=None)
def get_ahp_criteria():
    return success_response(
        message="AHP/Fuzzy AHP criteria are ready.",
        data=FINAL_CRITERIA,
    )


@router.post("/calculate", response_model=None)
def calculate_ahp_endpoint(request: AhpCalculateRequest):
    try:
        result = calculate_ahp(request)
    except ValueError as error:
        return validation_error_response(error)

    return success_response(
        message="AHP calculation completed.",
        data=result,
    )


@router.post("/fuzzy-calculate", response_model=None)
def calculate_fuzzy_ahp_endpoint(
    request: FuzzyAhpCalculateRequest,
):
    try:
        result = calculate_fuzzy_ahp(request)
    except ValueError as error:
        return validation_error_response(error)

    return success_response(
        message="Fuzzy AHP calculation completed.",
        data=result,
    )


@router.post("/compare", response_model=None)
def compare_ahp_endpoint(request: RankingComparisonRequest):
    try:
        result = compare_ahp_and_fuzzy_ahp(request)
    except ValueError as error:
        return validation_error_response(error)

    return success_response(
        message="AHP and Fuzzy AHP comparison completed.",
        data=result,
    )
