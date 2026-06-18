from typing import Literal

from pydantic import BaseModel, Field, field_validator

AspectLabel = Literal[
    "Features, Content & Audio Experience",
    "App Reliability & Usability",
    "Ads Experience",
    "Subscription & Pricing",
    "Account/Login",
]
ClassificationMode = Literal["model", "fallback"]
PredictionSource = Literal["model", "fallback_keyword"]


class AspectClassifyRequest(BaseModel):
    text: str = Field(min_length=1)
    run_label: str = "demo"

    @field_validator("text")
    @classmethod
    def text_must_not_be_blank(cls, value: str) -> str:
        stripped = value.strip()
        if not stripped:
            raise ValueError("text must not be blank")
        return stripped


class AspectClassificationData(BaseModel):
    text: str
    label: AspectLabel
    confidence: float | None = Field(default=None, ge=0.0, le=1.0)
    scores: dict[str, float] = Field(default_factory=dict)
    classifier_name: str
    mode: ClassificationMode
    prediction_source: PredictionSource
    model_name: str | None = None
    model_available: bool
    is_fallback: bool
    warnings: list[str] = Field(default_factory=list)


class AspectSummaryData(BaseModel):
    selected_classifier: str
    final_aspect_labels: list[str]
    model_status: str
    model_available: bool
    model_name: str | None = None
    model_path_configured: bool
    prediction_source: PredictionSource
    original_7class_baseline: dict
    merged_5class_taxonomy: list[dict]
    aspect_distribution: dict[str, int]
    negative_aspect_distribution: dict[str, int]
    weak_label_limitation: str
    output_source_availability: dict[str, bool]
    warnings: list[str] = Field(default_factory=list)


class AspectEvaluationData(BaseModel):
    selected_candidate: str
    scenario_comparison: list[dict]
    selected_metrics: dict
    classification_report: dict
    limitations: list[str]
    output_source_availability: dict[str, bool]
    warnings: list[str] = Field(default_factory=list)
