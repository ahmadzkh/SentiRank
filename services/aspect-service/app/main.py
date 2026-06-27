"""Aspect service entrypoint for SentiRank aspect APIs."""

from fastapi import FastAPI

from app.core.config import FINAL_ASPECT_CLASSIFIER, get_settings
from app.routers import aspect
from app.services.aspect_classifier_service import AspectClassifierService

SERVICE_NAME = "aspect-service"
SERVICE_PORT = 8003
SERVICE_ROLE = "SVM aspect classification and evaluation summaries"
SERVICE_VERSION = "0.1.0"

settings = get_settings()

app = FastAPI(
    title="SentiRank Aspect Service",
    version=SERVICE_VERSION,
    description="Independent FastAPI service for SentiRank aspect classification, summaries, and evaluation outputs.",
)

app.include_router(aspect.router)


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
        "SentiRank Aspect Service is running.",
        {
            "service": SERVICE_NAME,
            "role": SERVICE_ROLE,
            "status": "ready",
            "version": SERVICE_VERSION,
            "final_classifier": FINAL_ASPECT_CLASSIFIER,
            "data_paths": {
                "datasets_dir": str(settings.datasets_dir),
                "docs_dir": str(settings.docs_dir),
                "aspect_model_dir": str(settings.aspect_model_dir),
            },
            "available_endpoints": [
                "GET /",
                "GET /health",
                "POST /aspects/classify",
                "GET /aspects/summary",
                "GET /aspects/evaluation",
            ],
        },
    )


@app.get("/health")
def health() -> dict:
    """Return health status for Docker Compose checks."""
    runtime_metadata = AspectClassifierService(settings).runtime_metadata()
    return response(
        "Aspect service is healthy.",
        {
            "service": SERVICE_NAME,
            "status": "healthy",
            "version": SERVICE_VERSION,
            "port": SERVICE_PORT,
            "model_status": runtime_metadata["model_status"],
            "model_available": runtime_metadata["model_available"],
            "model_name": runtime_metadata["model_name"],
            "model_path_configured": runtime_metadata["model_path_configured"],
            "prediction_source": runtime_metadata["prediction_source"],
        },
    )
