"""Minimal API Gateway service skeleton for MS-03."""

from fastapi import FastAPI

SERVICE_NAME = "api-gateway-service"
SERVICE_PORT = 8000
SERVICE_ROLE = "Public entry point for frontend requests"

app = FastAPI(
    title="SentiRank API Gateway Service",
    version="0.1.0",
    description="MS-03 skeleton only. Routing will be implemented in MS-05.",
)


def response(message: str, data: dict | None = None) -> dict:
    """Return the standard SentiRank API response envelope."""
    return {
        "success": True,
        "message": message,
        "data": data or {},
    }


@app.get("/")
def root() -> dict:
    """Return a placeholder root response for the gateway skeleton."""
    return response(
        "SentiRank API Gateway skeleton is running.",
        {
            "service": SERVICE_NAME,
            "role": SERVICE_ROLE,
            "business_logic": "not_implemented_in_ms_03",
        },
    )


@app.get("/health")
def health() -> dict:
    """Return health status for Docker Compose checks."""
    return response(
        "Service is healthy.",
        {
            "service": SERVICE_NAME,
            "status": "healthy",
            "port": SERVICE_PORT,
            "stage": "ms_03_skeleton",
        },
    )
