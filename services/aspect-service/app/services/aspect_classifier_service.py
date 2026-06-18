from __future__ import annotations

import math
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Any, ClassVar

from app.core.config import (
    FINAL_ASPECT_CLASSIFIER,
    FINAL_ASPECT_LABELS,
    SVM_ASPECT_MODEL_NAME,
    Settings,
)
from app.schemas.aspect import AspectClassificationData

MODEL_UNAVAILABLE_WARNING = (
    "SVM aspect model artifact is not available in this environment. "
    "Returning fallback keyword classification."
)
MODEL_LOAD_ERROR_WARNING = (
    "SVM aspect model could not be loaded. Returning fallback keyword classification."
)
MODEL_INFERENCE_ERROR_WARNING = (
    "SVM aspect model inference failed. Returning fallback keyword classification."
)
MODEL_UNSUPPORTED_WARNING = (
    "SVM aspect model object does not expose a valid predict method. "
    "Returning fallback keyword classification."
)
MODEL_CONFIDENCE_UNAVAILABLE_WARNING = (
    "SVM aspect model does not expose predict_proba; confidence is not available."
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


@dataclass(frozen=True)
class ModelCacheKey:
    path: Path
    exists: bool
    size: int | None
    mtime_ns: int | None


@dataclass(frozen=True)
class ModelState:
    model: Any | None
    available: bool
    load_error: str | None = None


class AspectClassifierService:
    _model_cache: ClassVar[dict[ModelCacheKey, ModelState]] = {}

    def __init__(self, settings: Settings) -> None:
        self.settings = settings

    @classmethod
    def clear_model_cache(cls) -> None:
        cls._model_cache.clear()

    def model_status(self) -> str:
        return "available" if self._model_state().available else "unavailable"

    def runtime_metadata(self) -> dict[str, object]:
        state = self._model_state()
        model_available = state.available
        return {
            "model_status": "available" if model_available else "unavailable",
            "model_available": model_available,
            "model_name": SVM_ASPECT_MODEL_NAME if model_available else None,
            "model_path_configured": bool(self.settings.aspect_model_path),
            "prediction_source": "model" if model_available else "fallback_keyword",
            "is_fallback": not model_available,
        }

    def classify(self, text: str) -> AspectClassificationData:
        state = self._model_state()
        if state.available and state.model is not None:
            try:
                return self._classify_with_model(text, state.model)
            except Exception:
                return self._fallback_result(text, [MODEL_INFERENCE_ERROR_WARNING])

        warning = MODEL_UNAVAILABLE_WARNING
        if state.load_error == "unsupported_model":
            warning = MODEL_UNSUPPORTED_WARNING
        elif state.load_error:
            warning = MODEL_LOAD_ERROR_WARNING

        return self._fallback_result(text, [warning])

    def _classify_with_model(self, text: str, model: Any) -> AspectClassificationData:
        predict = getattr(model, "predict", None)
        if not callable(predict):
            raise TypeError("model predict method is unavailable")

        raw_predictions = predict([text])
        label = self._normalize_label(self._first_prediction(raw_predictions))
        scores, confidence, warning = self._prediction_scores(model, text)
        warnings = [warning] if warning else []

        return AspectClassificationData(
            text=text,
            label=label,
            confidence=confidence,
            scores=scores,
            classifier_name=FINAL_ASPECT_CLASSIFIER,
            mode="model",
            prediction_source="model",
            model_name=SVM_ASPECT_MODEL_NAME,
            model_available=True,
            is_fallback=False,
            warnings=warnings,
        )

    def _fallback_result(self, text: str, warnings: list[str]) -> AspectClassificationData:
        label = self._fallback_label(text)
        scores = self._fallback_scores(label)

        return AspectClassificationData(
            text=text,
            label=label,
            confidence=scores[label],
            scores=scores,
            classifier_name=FINAL_ASPECT_CLASSIFIER,
            mode="fallback",
            prediction_source="fallback_keyword",
            model_name=None,
            model_available=False,
            is_fallback=True,
            warnings=warnings,
        )

    def _model_state(self) -> ModelState:
        model_path = self.settings.aspect_model_path
        cache_key = self._cache_key(model_path)
        cached = self._model_cache.get(cache_key)
        if cached is not None:
            return cached

        state = self._load_model(model_path)
        self._model_cache[cache_key] = state
        return state

    @staticmethod
    def _cache_key(model_path: Path) -> ModelCacheKey:
        try:
            stat = model_path.stat()
            return ModelCacheKey(
                path=model_path.resolve(),
                exists=True,
                size=stat.st_size,
                mtime_ns=stat.st_mtime_ns,
            )
        except OSError:
            return ModelCacheKey(
                path=model_path.resolve(),
                exists=False,
                size=None,
                mtime_ns=None,
            )

    @staticmethod
    def _load_model(model_path: Path) -> ModelState:
        if not model_path.exists():
            return ModelState(model=None, available=False, load_error="missing_artifact")

        try:
            from joblib import load
        except ImportError:
            return ModelState(model=None, available=False, load_error="joblib_unavailable")

        try:
            model = load(model_path)
        except Exception:
            return ModelState(model=None, available=False, load_error="load_failed")

        if not callable(getattr(model, "predict", None)):
            return ModelState(model=None, available=False, load_error="unsupported_model")

        return ModelState(model=model, available=True)

    @staticmethod
    def _first_prediction(raw_predictions: Any) -> Any:
        if isinstance(raw_predictions, (str, bytes)):
            return raw_predictions
        return list(raw_predictions)[0]

    @staticmethod
    def _normalize_label(raw_label: Any) -> str:
        label = str(raw_label)
        if label in FINAL_ASPECT_LABELS:
            return label
        raise ValueError("model returned an unsupported aspect label")

    def _prediction_scores(self, model: Any, text: str) -> tuple[dict[str, float], float | None, str | None]:
        predict_proba = getattr(model, "predict_proba", None)
        if not callable(predict_proba):
            return {}, None, MODEL_CONFIDENCE_UNAVAILABLE_WARNING

        probabilities = list(self._first_prediction(predict_proba([text])))
        raw_classes = getattr(model, "classes_", FINAL_ASPECT_LABELS)
        classes = [str(item) for item in list(raw_classes)]

        scores: dict[str, float] = {}
        for class_label, raw_probability in zip(classes, probabilities, strict=False):
            if class_label not in FINAL_ASPECT_LABELS:
                continue
            probability = self._safe_probability(raw_probability)
            if probability is not None:
                scores[class_label] = probability

        confidence = max(scores.values()) if scores else None
        return scores, confidence, None

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

    @staticmethod
    def _safe_probability(value: Any) -> float | None:
        try:
            probability = float(value)
        except (TypeError, ValueError):
            return None
        if not math.isfinite(probability):
            return None
        if probability < 0 or probability > 1:
            return None
        return probability
