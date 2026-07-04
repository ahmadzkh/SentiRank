from typing import Any

from pydantic import BaseModel, Field


class RuntimePredictionSummary(BaseModel):
    label: str | None
    confidence: float | None = None
    model_name: str | None = None
    mode: str | None = None
    prediction_source: str | None = None
    is_fallback: bool


class RuntimeInferenceHistoryItem(BaseModel):
    id: str
    text: str
    sentiment: RuntimePredictionSummary
    aspect: RuntimePredictionSummary
    created_at: str


class RuntimeInferenceHistoryData(BaseModel):
    items: list[RuntimeInferenceHistoryItem] = Field(default_factory=list)
    total: int
    page: int = 1
    limit: int = 20
    total_pages: int = 1


class RuntimeInferenceResult(BaseModel):
    id: str
    text: str
    sentiment: dict[str, Any]
    aspect: dict[str, Any]
    saved: bool
    created_at: str
