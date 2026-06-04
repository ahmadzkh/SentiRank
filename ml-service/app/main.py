from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.routers import (
    ahp,
    aspects,
    evaluation,
    fuzzy_ahp,
    health,
    preprocessing,
    ranking,
    ranking_comparison,
    reviews,
    sentiment,
)

app = FastAPI(
    title=settings.service_name,
    version=settings.service_version,
    description="Independent FastAPI boundary for SentiRank ML workflows.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
    ],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(preprocessing.router)
app.include_router(sentiment.router)
app.include_router(aspects.router)
app.include_router(evaluation.router)
app.include_router(ahp.router)
app.include_router(fuzzy_ahp.router)
app.include_router(ranking.router)
app.include_router(ranking_comparison.router)
app.include_router(reviews.router)
