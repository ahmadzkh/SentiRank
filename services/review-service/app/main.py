"""Review service entrypoint for SentiRank research data APIs."""

from fastapi import FastAPI

from app.core.config import get_settings
from app.routers import review

SERVICE_NAME = "review-service"
SERVICE_ROLE = "Dataset, scraping, preprocessing, review, and EDA summaries"
SERVICE_VERSION = "0.1.0"

settings = get_settings()

app = FastAPI(
    title="SentiRank Review Service",
    version=SERVICE_VERSION,
    description="Independent FastAPI service for SentiRank review and research-output summaries.",
)

app.include_router(review.router)


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
        "SentiRank Review Service is running.",
        {
            "service": SERVICE_NAME,
            "role": SERVICE_ROLE,
            "status": "ready",
            "version": SERVICE_VERSION,
            "data_paths": {
                "datasets_dir": str(settings.datasets_dir),
                "docs_dir": str(settings.docs_dir),
            },
            "available_endpoints": [
                "GET /",
                "GET /health",
                "GET /reviews/random",
                "GET /reviews/latest-negative",
                "GET /dataset/summary",
                "GET /scraping/summary",
                "GET /preprocessing/summary",
            ],
        },
    )


@app.get("/health")
def health() -> dict:
    """Return health status for Docker Compose checks."""
    return response(
        "Review service is healthy.",
        {
            "service": SERVICE_NAME,
            "status": "healthy",
            "version": SERVICE_VERSION,
        },
    )
