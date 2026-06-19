"""Environment-driven settings for the SentiRank API Gateway."""

from functools import lru_cache
from os import getenv

from pydantic import BaseModel


class Settings(BaseModel):
    service_name: str = "api-gateway-service"
    service_version: str = "0.1.0"
    request_timeout_seconds: float = 10.0
    decision_service_url: str = "http://127.0.0.1:8004"
    review_service_url: str = "http://review-service:8001"
    sentiment_service_url: str = "http://sentiment-service:8002"
    aspect_service_url: str = "http://aspect-service:8003"
    report_service_url: str = "http://report-service:8005"
    database_url: str = "sqlite:///./runtime_inference_history.db"
    cors_origins: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]


@lru_cache
def get_settings() -> Settings:
    return Settings(
        request_timeout_seconds=float(getenv("GATEWAY_TIMEOUT_SECONDS", "10")),
        decision_service_url=getenv("DECISION_SERVICE_URL", "http://127.0.0.1:8004"),
        review_service_url=getenv("REVIEW_SERVICE_URL", "http://review-service:8001"),
        sentiment_service_url=getenv("SENTIMENT_SERVICE_URL", "http://sentiment-service:8002"),
        aspect_service_url=getenv("ASPECT_SERVICE_URL", "http://aspect-service:8003"),
        report_service_url=getenv("REPORT_SERVICE_URL", "http://report-service:8005"),
        database_url=getenv(
            "API_GATEWAY_DATABASE_URL",
            getenv("DATABASE_URL", "sqlite:///./runtime_inference_history.db"),
        ),
    )
