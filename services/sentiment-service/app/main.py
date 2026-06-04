"""Minimal sentiment service skeleton for MS-03."""

from fastapi import FastAPI

SERVICE_NAME = "sentiment-service"
SERVICE_PORT = 8002
SERVICE_ROLE = "IndoBERT sentiment inference and evaluation summaries"

app = FastAPI(
    title="SentiRank Sentiment Service",
    version="0.1.0",
    description="MS-03 placeholder only. IndoBERT logic remains in ml-service.",
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
    """Return a placeholder root response for the sentiment service skeleton."""
    return response(
        "SentiRank Sentiment Service placeholder is running.",
        {
            "service": SERVICE_NAME,
            "role": SERVICE_ROLE,
            "business_logic": "not_implemented_in_ms_03",
            "final_candidate": "run_3_weighted_loss_lr_1e-5",
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
