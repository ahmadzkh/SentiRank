"""Sentiment service entrypoint for SentiRank sentiment APIs."""

from fastapi import FastAPI

from app.core.config import FINAL_SENTIMENT_MODEL, get_settings
from app.routers import sentiment
from app.services.sentiment_inference_service import SentimentInferenceService

SERVICE_NAME = "sentiment-service"
SERVICE_PORT = 8002
SERVICE_ROLE = "IndoBERT sentiment inference and evaluation summaries"
SERVICE_VERSION = "0.1.0"

app = FastAPI(
    title="SentiRank Sentiment Service",
    version=SERVICE_VERSION,
    description="Independent FastAPI service for SentiRank sentiment prediction, summaries, and evaluation outputs.",
)

app.include_router(sentiment.router)


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
    settings = get_settings()
    runtime_metadata = SentimentInferenceService(settings).runtime_metadata()
    return response(
        "SentiRank Sentiment Service is running.",
        {
            "service": SERVICE_NAME,
            "role": SERVICE_ROLE,
            "status": "ready",
            "version": SERVICE_VERSION,
            "final_candidate": FINAL_SENTIMENT_MODEL,
            "data_paths": {
                "datasets_dir": str(settings.datasets_dir),
                "docs_dir": str(settings.docs_dir),
                "sentiment_model_dir": str(settings.sentiment_model_dir),
                "indobert_model_path": str(settings.indobert_model_path),
            },
            "model_runtime": runtime_metadata,
            "available_endpoints": [
                "GET /",
                "GET /health",
                "POST /sentiment/predict",
                "GET /sentiment/summary",
                "GET /sentiment/evaluation",
            ],
        },
    )


@app.get("/health")
def health() -> dict:
    """Return health status for Docker Compose checks."""
    settings = get_settings()
    runtime_metadata = SentimentInferenceService(settings).runtime_metadata()
    return response(
        "Sentiment service is healthy.",
        {
            "service": SERVICE_NAME,
            "status": "healthy",
            "version": SERVICE_VERSION,
            "port": SERVICE_PORT,
            **runtime_metadata,
        },
    )
