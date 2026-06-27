"""Decision service entrypoint for SentiRank AHP and Fuzzy AHP APIs."""

from fastapi import FastAPI

from app.routers import ahp

SERVICE_NAME = "decision-service"
SERVICE_PORT = 8004
SERVICE_ROLE = "AHP and Fuzzy AHP decision-support calculations"
SERVICE_VERSION = "0.1.0"

app = FastAPI(
    title="SentiRank Decision Service",
    version=SERVICE_VERSION,
    description="Independent FastAPI service for SentiRank decision-support calculations.",
)

app.include_router(ahp.router)


def response(message: str, data: dict | None = None) -> dict:
    """Return the standard SentiRank API response envelope."""
    return {
        "success": True,
        "message": message,
        "data": data or {},
    }


@app.get("/")
def root() -> dict:
    """Return service metadata and available endpoint information."""
    return response(
        "SentiRank Decision Service is running.",
        {
            "service": SERVICE_NAME,
            "role": SERVICE_ROLE,
            "status": "ready",
            "version": SERVICE_VERSION,
            "available_endpoints": [
                "GET /",
                "GET /health",
                "GET /ahp/criteria",
                "POST /ahp/calculate",
                "POST /ahp/fuzzy-calculate",
                "POST /ahp/compare",
            ],
        },
    )


@app.get("/health")
def health() -> dict:
    """Return health status for Docker Compose checks."""
    return response(
        "Decision service is healthy.",
        {
            "service": SERVICE_NAME,
            "status": "healthy",
            "version": SERVICE_VERSION,
        },
    )
