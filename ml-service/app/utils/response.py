from typing import TypeVar

from app.schemas.common import ApiResponse

DataT = TypeVar("DataT")


def success_response(message: str, data: DataT | None = None) -> ApiResponse[DataT]:
    return ApiResponse(success=True, message=message, data=data)


def error_response(message: str, data: DataT | None = None) -> ApiResponse[DataT]:
    return ApiResponse(success=False, message=message, data=data)
