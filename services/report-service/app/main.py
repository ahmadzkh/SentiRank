"""Report service entrypoint for SentiRank report and evaluation APIs."""

from fastapi import FastAPI

from app.core.config import FINAL_ASPECT_CLASSIFIER, FINAL_SENTIMENT_MODEL, get_settings
from app.routers import report

SERVICE_NAME = "report-service"
SERVICE_PORT = 8005
SERVICE_ROLE = "Report and consolidated evaluation summary aggregation"
SERVICE_VERSION = "0.1.0"

settings = get_settings()

app = FastAPI(
    title="SentiRank Report Service",
    version=SERVICE_VERSION,
    description="Independent FastAPI service for SentiRank report and consolidated evaluation summaries.",
)

app.include_router(report.router)


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
        "SentiRank Report Service is running.",
        {
            "service": SERVICE_NAME,
            "role": SERVICE_ROLE,
            "status": "ready",
            "version": SERVICE_VERSION,
            "selected_models": {
                "sentiment": FINAL_SENTIMENT_MODEL,
                "aspect": FINAL_ASPECT_CLASSIFIER,
            },
            "data_paths": {
                "datasets_dir": str(settings.datasets_dir),
                "docs_dir": str(settings.docs_dir),
            },
            "available_endpoints": [
                "GET /",
                "GET /health",
                "GET /reports/summary",
                "GET /evaluation/summary",
                "GET /reports/ranking-comparison",
            ],
        },
    )


@app.get("/health")
def health() -> dict:
    """Return health status for Docker Compose checks."""
    return response(
        "Report service is healthy.",
        {
            "service": SERVICE_NAME,
            "status": "healthy",
            "version": SERVICE_VERSION,
            "port": SERVICE_PORT,
        },
    )
