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
        query_params: dict[str, Any] | None = None,
        service_name: str = "decision-service",
    ) -> tuple[int, dict[str, Any]]:
        code_prefix = service_name.upper().replace("-", "_")
        display_name = service_name.replace("-", " ")
        display_name = display_name[:1].upper() + display_name[1:]
        try:
            async with httpx.AsyncClient(timeout=self.timeout_seconds) as client:
                response = await client.request(
                    method=method,
                    url=url,
                    json=json_body,
                    params=query_params,
                )
        except httpx.TimeoutException as error:
            raise ServiceClientError(
                message=f"{display_name} request timed out.",
                code=f"{code_prefix}_TIMEOUT",
                status_code=504,
                details={"url": url},
            ) from error
        except httpx.RequestError as error:
            raise ServiceClientError(
                message=f"{display_name} is unavailable.",
                code=f"{code_prefix}_UNAVAILABLE",
                status_code=503,
                details={"url": url},
            ) from error

        try:
            payload = response.json()
        except ValueError as error:
            raise ServiceClientError(
                message=f"{display_name} returned an invalid JSON response.",
                code=f"{code_prefix}_INVALID_JSON",
                status_code=502,
                details={"url": url, "upstream_status_code": response.status_code},
            ) from error

        if not isinstance(payload, dict):
            raise ServiceClientError(
                message=f"{display_name} returned an unsupported response payload.",
                code=f"{code_prefix}_INVALID_RESPONSE",
                status_code=502,
                details={"url": url, "upstream_status_code": response.status_code},
            )

        return response.status_code, payload
