from __future__ import annotations

import re
from pathlib import Path

from app.core.config import FINAL_SENTIMENT_MODEL, SENTIMENT_LABELS, Settings
from app.schemas.sentiment import SentimentPredictionData

MODEL_UNAVAILABLE_WARNING = (
    "Model artifact is not available in this environment. "
    "Returning fallback demo prediction."
)
MODEL_DETECTED_FALLBACK_WARNING = (
    "Model artifact is detected, but MS-07 uses fallback demo prediction only. "
    "Real IndoBERT inference is not loaded in this service phase."
)

NEGATIVE_KEYWORDS = (
    "error",
    "lambat",
    "lemot",
    "crash",
    "gagal",
    "tidak bisa",
    "mahal",
    "iklan",
    "bug",
)
POSITIVE_KEYWORDS = (
    "bagus",
    "suka",
    "lancar",
    "mantap",
    "puas",
    "nyaman",
    "terbaik",
)


class SentimentInferenceService:
    def __init__(self, settings: Settings) -> None:
        self.settings = settings

    def model_status(self) -> str:
        if self._has_model_artifacts(self.settings.sentiment_model_dir):
            return "available"
        return "unavailable"

    def predict(self, text: str) -> SentimentPredictionData:
        label = self._fallback_label(text)
        probabilities = self._fallback_probabilities(label)
        warnings = [MODEL_UNAVAILABLE_WARNING]
        if self.model_status() == "available":
            warnings = [MODEL_DETECTED_FALLBACK_WARNING]

        return SentimentPredictionData(
            text=text,
            label=label,
            confidence=probabilities[label],
            probabilities=probabilities,
            model_name=FINAL_SENTIMENT_MODEL,
            mode="fallback",
            warnings=warnings,
        )

    @staticmethod
    def _has_model_artifacts(model_dir: Path) -> bool:
        if not model_dir.exists() or not model_dir.is_dir():
            return False
        for item in model_dir.iterdir():
            if item.name == ".gitkeep":
                continue
            if item.is_file() or item.is_dir():
                return True
        return False

    @staticmethod
    def _fallback_label(text: str) -> str:
        normalized = re.sub(r"\s+", " ", text.casefold()).strip()
        has_negative = any(keyword in normalized for keyword in NEGATIVE_KEYWORDS)
        has_positive = any(keyword in normalized for keyword in POSITIVE_KEYWORDS)

        if has_negative:
            return "Negative"
        if has_positive:
            return "Positive"
        return "Neutral"

    @staticmethod
    def _fallback_probabilities(label: str) -> dict[str, float]:
        if label == "Negative":
            values = {"Negative": 0.78, "Neutral": 0.12, "Positive": 0.10}
        elif label == "Positive":
            values = {"Negative": 0.10, "Neutral": 0.12, "Positive": 0.78}
        else:
            values = {"Negative": 0.20, "Neutral": 0.60, "Positive": 0.20}

        return {sentiment: values[sentiment] for sentiment in SENTIMENT_LABELS}
