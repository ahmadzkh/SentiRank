"""Minimal decision service skeleton for MS-03."""

from fastapi import FastAPI

SERVICE_NAME = "decision-service"
SERVICE_PORT = 8004
SERVICE_ROLE = "AHP and Fuzzy AHP decision-support calculations"

app = FastAPI(
    title="SentiRank Decision Service",
    version="0.1.0",
    description="MS-03 skeleton only. AHP/Fuzzy AHP logic will be extracted in MS-04.",
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
    """Return a placeholder root response for the decision service skeleton."""
    return response(
        "SentiRank Decision Service skeleton is running.",
        {
            "service": SERVICE_NAME,
            "role": SERVICE_ROLE,
            "business_logic": "not_extracted_in_ms_03",
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
