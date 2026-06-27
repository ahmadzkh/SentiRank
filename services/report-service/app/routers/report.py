from typing import Any

from fastapi import APIRouter
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from app.core.config import get_settings
from app.services.report_summary_service import ReportSummaryService

router = APIRouter(tags=["reports"])


def _report_service() -> ReportSummaryService:
    return ReportSummaryService(get_settings())


def success_response(message: str, data: BaseModel | dict[str, Any]) -> dict[str, Any]:
    payload = data.model_dump() if isinstance(data, BaseModel) else data
    return {
        "success": True,
        "message": message,
        "data": payload,
    }


def error_response(message: str, code: str, details: dict[str, Any] | None = None) -> JSONResponse:
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "message": message,
            "error": {
                "code": code,
                "details": details or {},
            },
        },
    )


@router.get("/reports/summary", response_model=None)
def report_summary():
    try:
        data = _report_service().report_summary()
    except OSError:
        return error_response(
            "Report summary could not be loaded.",
            "REPORT_SUMMARY_ERROR",
        )
    return success_response("Report summary loaded.", data)


@router.get("/evaluation/summary", response_model=None)
def evaluation_summary():
    try:
        data = _report_service().evaluation_summary()
    except OSError:
        return error_response(
            "Evaluation summary could not be loaded.",
            "EVALUATION_SUMMARY_ERROR",
        )
    return success_response("Evaluation summary loaded.", data)


@router.get("/reports/ranking-comparison", response_model=None)
def ranking_comparison():
    try:
        data = _report_service().ranking_comparison()
    except OSError:
        return error_response(
            "Ranking comparison could not be loaded.",
            "RANKING_COMPARISON_ERROR",
        )
    return success_response("Ranking comparison loaded.", data)
