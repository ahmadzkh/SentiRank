"""API Gateway service for SentiRank microservice routing."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.routers import ahp, health

settings = get_settings()

app = FastAPI(
    title="SentiRank API Gateway Service",
    version=settings.service_version,
    description="Frontend-facing API Gateway for SentiRank microservices.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
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
    """Return gateway metadata and frontend-facing route information."""
    return response(
        "SentiRank API Gateway is running.",
        {
            "service": settings.service_name,
            "role": "Single frontend-facing entry point for SentiRank services",
            "status": "ready",
            "version": settings.service_version,
            "gateway_routes": [
                "GET /",
                "GET /health",
                "GET /health/services",
                "GET /ahp/criteria",
                "POST /ahp/calculate",
                "POST /ahp/fuzzy-calculate",
                "POST /ahp/compare",
            ],
            "routing": {
                "decision-service": settings.decision_service_url,
            },
        },
    )
