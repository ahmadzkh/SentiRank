from __future__ import annotations

import re
from pathlib import Path

from app.core.config import (
    EXPECTED_PIPELINE_FILE,
    FINAL_ASPECT_CLASSIFIER,
    FINAL_ASPECT_LABELS,
    Settings,
)
from app.schemas.aspect import AspectClassificationData

MODEL_UNAVAILABLE_WARNING = (
    "SVM aspect model artifact is not available in this environment. "
    "Returning fallback demo classification."
)
MODEL_DETECTED_FALLBACK_WARNING = (
    "SVM aspect model artifact is detected, but MS-08 uses fallback demo classification only. "
    "Real SVM inference is not loaded in this service phase."
)

KEYWORD_RULES: tuple[tuple[str, tuple[str, ...]], ...] = (
    ("Ads Experience", ("ads", "iklan")),
    ("Subscription & Pricing", ("premium", "harga", "bayar", "langganan")),
    ("Account/Login", ("login", "akun", "password", "email")),
    ("App Reliability & Usability", ("error", "crash", "lemot", "lambat", "bug")),
    (
        "Features, Content & Audio Experience",
        ("lagu", "playlist", "audio", "lirik", "download", "podcast"),
    ),
)


class AspectClassifierService:
    def __init__(self, settings: Settings) -> None:
        self.settings = settings

    def model_status(self) -> str:
        if self._has_model_artifact(self.settings.aspect_model_dir):
            return "available"
        return "unavailable"

    def classify(self, text: str) -> AspectClassificationData:
        label = self._fallback_label(text)
        scores = self._fallback_scores(label)
        warnings = [MODEL_UNAVAILABLE_WARNING]
        if self.model_status() == "available":
            warnings = [MODEL_DETECTED_FALLBACK_WARNING]

        return AspectClassificationData(
            text=text,
            label=label,
            confidence=scores[label],
            scores=scores,
            classifier_name=FINAL_ASPECT_CLASSIFIER,
            mode="fallback",
            warnings=warnings,
        )

    @staticmethod
    def _has_model_artifact(model_dir: Path) -> bool:
        return (model_dir / EXPECTED_PIPELINE_FILE).exists()

    @staticmethod
    def _fallback_label(text: str) -> str:
        normalized = re.sub(r"\s+", " ", text.casefold()).strip()
        for label, keywords in KEYWORD_RULES:
            if any(keyword in normalized for keyword in keywords):
                return label
        return "Features, Content & Audio Experience"

    @staticmethod
    def _fallback_scores(label: str) -> dict[str, float]:
        high = 0.76
        remainder = round((1.0 - high) / (len(FINAL_ASPECT_LABELS) - 1), 2)
        scores = {aspect_label: remainder for aspect_label in FINAL_ASPECT_LABELS}
        scores[label] = high
        correction = round(1.0 - sum(scores.values()), 2)
        if correction:
            first_other = next(item for item in FINAL_ASPECT_LABELS if item != label)
            scores[first_other] = round(scores[first_other] + correction, 2)
        return scores
