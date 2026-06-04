"""HTTP proxy client used by the API Gateway."""

from typing import Any

import httpx


class ServiceClientError(Exception):
    def __init__(
        self,
        message: str,
        code: str,
        status_code: int,
        details: dict[str, Any] | None = None,
    ) -> None:
        super().__init__(message)
        self.message = message
        self.code = code
        self.status_code = status_code
        self.details = details or {}


class ServiceClient:
    def __init__(self, timeout_seconds: float = 10.0) -> None:
        self.timeout_seconds = timeout_seconds

    async def request_json(
        self,
        method: str,
        url: str,
        json_body: dict[str, Any] | None = None,
    ) -> tuple[int, dict[str, Any]]:
        try:
            async with httpx.AsyncClient(timeout=self.timeout_seconds) as client:
                response = await client.request(method=method, url=url, json=json_body)
        except httpx.TimeoutException as error:
            raise ServiceClientError(
                message="Decision service request timed out.",
                code="DECISION_SERVICE_TIMEOUT",
                status_code=504,
                details={"url": url},
            ) from error
        except httpx.RequestError as error:
            raise ServiceClientError(
                message="Decision service is unavailable.",
                code="DECISION_SERVICE_UNAVAILABLE",
                status_code=503,
                details={"url": url},
            ) from error

        try:
            payload = response.json()
        except ValueError as error:
            raise ServiceClientError(
                message="Decision service returned an invalid JSON response.",
                code="DECISION_SERVICE_INVALID_JSON",
                status_code=502,
                details={"url": url, "upstream_status_code": response.status_code},
            ) from error

        if not isinstance(payload, dict):
            raise ServiceClientError(
                message="Decision service returned an unsupported response payload.",
                code="DECISION_SERVICE_INVALID_RESPONSE",
                status_code=502,
                details={"url": url, "upstream_status_code": response.status_code},
            )

        return response.status_code, payload
