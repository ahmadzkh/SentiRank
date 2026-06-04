"""Minimal review service skeleton for MS-03."""

from fastapi import FastAPI

SERVICE_NAME = "review-service"
SERVICE_PORT = 8001
SERVICE_ROLE = "Dataset, scraping, preprocessing, random review, and EDA summaries"

app = FastAPI(
    title="SentiRank Review Service",
    version="0.1.0",
    description="MS-03 skeleton only. Review/data logic will be extracted in a later phase.",
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
    """Return a placeholder root response for the review service skeleton."""
    return response(
        "SentiRank Review Service skeleton is running.",
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
