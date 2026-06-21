from typing import Literal

from pydantic import BaseModel, Field, field_validator

SentimentLabel = Literal["Negative", "Neutral", "Positive"]
PredictionMode = Literal["model", "fallback"]


class SentimentPredictRequest(BaseModel):
    text: str = Field(min_length=1)
    run_label: str = "demo"

    @field_validator("text")
    @classmethod
    def text_must_not_be_blank(cls, value: str) -> str:
        stripped = value.strip()
        if not stripped:
            raise ValueError("text must not be blank")
        return stripped


class SentimentPredictionData(BaseModel):
    text: str
    label: SentimentLabel
    confidence: float = Field(ge=0.0, le=1.0)
    probabilities: dict[str, float]
    model_name: str
    mode: PredictionMode
    prediction_source: str
    model_available: bool
    is_fallback: bool
    warnings: list[str] = Field(default_factory=list)


class SentimentSummaryData(BaseModel):
    data_status: str
    selected_model: str
    sentiment_labels: list[str]
    model_status: str
    model_available: bool
    model_source: str
    configured_model_id: str | None = None
    prediction_source: str
    is_fallback: bool
    final_sentiment_distribution: dict[str, int]
    raw_sentiment_distribution: dict[str, int]
    warnings: list[str] = Field(default_factory=list)


class SentimentEvaluationData(BaseModel):
    data_status: str
    selected_candidate: str
    run_comparison: list[dict]
    selected_metrics: dict
    limitations: list[str]
    warnings: list[str] = Field(default_factory=list)
