"""Minimal report service skeleton for MS-03."""

from fastapi import FastAPI

SERVICE_NAME = "report-service"
SERVICE_PORT = 8005
SERVICE_ROLE = "Report and consolidated evaluation summary aggregation"

app = FastAPI(
    title="SentiRank Report Service",
    version="0.1.0",
    description="MS-03 placeholder only. Report aggregation will be implemented later.",
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
    """Return a placeholder root response for the report service skeleton."""
    return response(
        "SentiRank Report Service placeholder is running.",
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
            "stage": "ms_03_placeholder",
        },
    )
