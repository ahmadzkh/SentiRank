"""Minimal aspect service skeleton for MS-03."""

from fastapi import FastAPI

SERVICE_NAME = "aspect-service"
SERVICE_PORT = 8003
SERVICE_ROLE = "SVM aspect classification and evaluation summaries"

app = FastAPI(
    title="SentiRank Aspect Service",
    version="0.1.0",
    description="MS-03 placeholder only. SVM logic remains in ml-service.",
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
    """Return a placeholder root response for the aspect service skeleton."""
    return response(
        "SentiRank Aspect Service placeholder is running.",
        {
            "service": SERVICE_NAME,
            "role": SERVICE_ROLE,
            "business_logic": "not_implemented_in_ms_03",
            "final_classifier": "merged_5class",
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
