from __future__ import annotations

import json
import math
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Callable, ClassVar, Literal

from app.core.config import FINAL_SENTIMENT_MODEL, SENTIMENT_LABELS, Settings
from app.schemas.sentiment import SentimentLabel, SentimentPredictionData

MODEL_UNAVAILABLE_WARNING = (
    "Model artifact is not available. Returning explicit fallback prediction."
)
MODEL_LOAD_ERROR_WARNING = (
    "IndoBERT sentiment model could not be loaded. Returning explicit fallback prediction."
)
MODEL_INFERENCE_ERROR_WARNING = (
    "IndoBERT sentiment model inference failed. Returning explicit fallback prediction."
)
SAFE_LABEL_MAPPING_WARNING = (
    "Model label mapping was unavailable. Using safe default sentiment label mapping."
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

ModelSource = Literal["local", "hf", "fallback"]


@dataclass(frozen=True)
class ModelCandidate:
    source: Literal["local", "hf"]
    location: str


@dataclass(frozen=True)
class ModelPrediction:
    label: str
    confidence: float
    probabilities: dict[str, float]
    warnings: tuple[str, ...] = ()


@dataclass(frozen=True)
class ModelState:
    available: bool
    model_source: ModelSource
    prediction_source: str
    model_name: str
    configured_model_path: str
    configured_model_id: str | None
    max_length: int
    load_warnings: tuple[str, ...] = ()
    predict: Callable[[str], ModelPrediction] | None = None


@dataclass(frozen=True)
class ModelCacheKey:
    source: str
    model_path: Path
    model_path_exists: bool
    model_path_mtime_ns: int | None
    model_id: str | None
    has_hf_token: bool
    max_length: int


class SentimentInferenceService:
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
            "model_name": state.model_name,
            "model_source": state.model_source if model_available else "fallback",
            "configured_model_path": state.configured_model_path,
            "configured_model_id": state.configured_model_id,
            "max_length": state.max_length,
            "prediction_source": state.prediction_source,
            "is_fallback": not model_available,
            "warnings": list(state.load_warnings),
        }

    def predict(self, text: str) -> SentimentPredictionData:
        state = self._model_state()
        if state.available and state.predict is not None:
            try:
                prediction = state.predict(text)
                label = self._normalize_prediction_label(prediction.label)
                return SentimentPredictionData(
                    text=text,
                    label=label,
                    confidence=prediction.confidence,
                    probabilities=prediction.probabilities,
                    model_name=state.model_name,
                    mode="model",
                    prediction_source="model",
                    model_available=True,
                    is_fallback=False,
                    warnings=list(prediction.warnings),
                )
            except Exception:
                return self._fallback_result(text, [MODEL_INFERENCE_ERROR_WARNING])

        warnings = [MODEL_UNAVAILABLE_WARNING]
        if state.load_warnings:
            warnings.extend(state.load_warnings)
        return self._fallback_result(text, warnings)

    def _model_state(self) -> ModelState:
        cache_key = self._cache_key()
        cached = self._model_cache.get(cache_key)
        if cached is not None:
            return cached

        state = self._load_model_state()
        self._model_cache[cache_key] = state
        return state

    def _cache_key(self) -> ModelCacheKey:
        model_path = self.settings.indobert_model_path
        path_exists = model_path.exists()
        mtime_ns = None
        if path_exists:
            try:
                mtime_ns = model_path.stat().st_mtime_ns
            except OSError:
                mtime_ns = None
        return ModelCacheKey(
            source=self.settings.sentiment_model_source,
            model_path=model_path.resolve(),
            model_path_exists=path_exists,
            model_path_mtime_ns=mtime_ns,
            model_id=self.settings.indobert_model_id,
            has_hf_token=bool(self.settings.hf_token),
            max_length=self.settings.indobert_max_length,
        )

    def _load_model_state(self) -> ModelState:
        warnings: list[str] = []
        for candidate in self._model_candidates():
            state = self._load_candidate(candidate)
            if state.available:
                return state
            warnings.extend(state.load_warnings)

        return self._unavailable_state(tuple(self._dedupe_warnings(warnings)))

    def _model_candidates(self) -> list[ModelCandidate]:
        source = self.settings.sentiment_model_source
        local_candidate = ModelCandidate(
            source="local",
            location=str(self.settings.indobert_model_path),
        )
        hf_candidate = (
            ModelCandidate(source="hf", location=self.settings.indobert_model_id)
            if self.settings.indobert_model_id
            else None
        )

        if source == "local":
            return [local_candidate]
        if source == "hf":
            return [hf_candidate] if hf_candidate is not None else []

        candidates = []
        if self.settings.indobert_model_path.exists():
            candidates.append(local_candidate)
        if hf_candidate is not None:
            candidates.append(hf_candidate)
        if not candidates:
            candidates.append(local_candidate)
        return candidates

    def _load_candidate(self, candidate: ModelCandidate) -> ModelState:
        if candidate.source == "local":
            local_path = Path(candidate.location)
            if not local_path.exists() or not local_path.is_dir():
                return self._unavailable_state(
                    (
                        f"Configured local IndoBERT model path is unavailable: {local_path}",
                    )
                )

        try:
            return self._load_transformers_model(candidate)
        except ImportError:
            return self._unavailable_state(
                (
                    "IndoBERT inference dependencies are not installed in this environment.",
                )
            )
        except Exception:
            return self._unavailable_state((MODEL_LOAD_ERROR_WARNING,))

    def _load_transformers_model(self, candidate: ModelCandidate) -> ModelState:
        import torch
        from transformers import AutoModelForSequenceClassification, AutoTokenizer

        token = self.settings.hf_token if candidate.source == "hf" else None
        tokenizer = self._from_pretrained(
            AutoTokenizer,
            candidate.location,
            token=token,
        )
        model = self._from_pretrained(
            AutoModelForSequenceClassification,
            candidate.location,
            token=token,
        )
        device = "cuda" if torch.cuda.is_available() else "cpu"
        model.to(device)
        model.eval()

        id_to_label, mapping_warnings = self._resolve_id_to_label(
            model_config=getattr(model, "config", None),
            model_dir=Path(candidate.location) if candidate.source == "local" else None,
        )

        def predict_with_model(text: str) -> ModelPrediction:
            encoded = tokenizer(
                text,
                return_tensors="pt",
                truncation=True,
                padding=True,
                max_length=self.settings.indobert_max_length,
            )
            encoded = {
                key: value.to(device) if hasattr(value, "to") else value
                for key, value in encoded.items()
            }
            with torch.no_grad():
                output = model(**encoded)

            probabilities = torch.softmax(output.logits, dim=-1)[0].detach().cpu().tolist()
            return self._prediction_from_probabilities(
                probabilities=probabilities,
                id_to_label=id_to_label,
                warnings=mapping_warnings,
            )

        return ModelState(
            available=True,
            model_source=candidate.source,
            prediction_source="model",
            model_name=self.settings.indobert_model_name,
            configured_model_path=str(self.settings.indobert_model_path),
            configured_model_id=self.settings.indobert_model_id,
            max_length=self.settings.indobert_max_length,
            load_warnings=(),
            predict=predict_with_model,
        )

    @staticmethod
    def _from_pretrained(factory: object, location: str, token: str | None = None) -> object:
        if not token:
            return factory.from_pretrained(location)
        try:
            return factory.from_pretrained(location, token=token)
        except TypeError:
            return factory.from_pretrained(location, use_auth_token=token)

    def _resolve_id_to_label(
        self,
        model_config: object | None,
        model_dir: Path | None,
    ) -> tuple[dict[int, str], tuple[str, ...]]:
        config_mapping = self._id_to_label_from_config(model_config)
        if config_mapping:
            return config_mapping, ()

        artifact_mapping = self._id_to_label_from_artifact(model_dir)
        if artifact_mapping:
            return artifact_mapping, ()

        return self._safe_default_id_to_label(), (SAFE_LABEL_MAPPING_WARNING,)

    @staticmethod
    def _id_to_label_from_config(model_config: object | None) -> dict[int, str] | None:
        if model_config is None:
            return None

        raw_id_to_label = getattr(model_config, "id2label", None)
        id_to_label = SentimentInferenceService._normalize_id_to_label(raw_id_to_label)
        if id_to_label:
            return id_to_label

        raw_label_to_id = getattr(model_config, "label2id", None)
        label_to_id = SentimentInferenceService._normalize_label_to_id(raw_label_to_id)
        if label_to_id:
            return {label_id: label for label, label_id in label_to_id.items()}

        return None

    @staticmethod
    def _id_to_label_from_artifact(model_dir: Path | None) -> dict[int, str] | None:
        if model_dir is None:
            return None

        mapping_path = model_dir / "label_mapping.json"
        if not mapping_path.is_file():
            return None

        try:
            raw_mapping = json.loads(mapping_path.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError):
            return None

        label_to_id = SentimentInferenceService._normalize_label_to_id(raw_mapping)
        if not label_to_id:
            return None
        return {label_id: label for label, label_id in label_to_id.items()}

    @staticmethod
    def _normalize_id_to_label(raw_mapping: object) -> dict[int, str] | None:
        if not isinstance(raw_mapping, dict):
            return None

        normalized: dict[int, str] = {}
        for raw_id, raw_label in raw_mapping.items():
            try:
                label_id = int(raw_id)
            except (TypeError, ValueError):
                continue
            label = str(raw_label)
            if label in SENTIMENT_LABELS:
                normalized[label_id] = label

        return normalized if set(normalized.values()) == set(SENTIMENT_LABELS) else None

    @staticmethod
    def _normalize_label_to_id(raw_mapping: object) -> dict[str, int] | None:
        if not isinstance(raw_mapping, dict):
            return None

        normalized: dict[str, int] = {}
        for raw_label, raw_id in raw_mapping.items():
            label = str(raw_label)
            if label not in SENTIMENT_LABELS:
                continue
            try:
                normalized[label] = int(raw_id)
            except (TypeError, ValueError):
                continue

        return normalized if set(normalized.keys()) == set(SENTIMENT_LABELS) else None

    @staticmethod
    def _safe_default_id_to_label() -> dict[int, str]:
        return {index: label for index, label in enumerate(SENTIMENT_LABELS)}

    def _prediction_from_probabilities(
        self,
        probabilities: list[float],
        id_to_label: dict[int, str],
        warnings: tuple[str, ...],
    ) -> ModelPrediction:
        if len(probabilities) < len(SENTIMENT_LABELS):
            raise ValueError("model returned fewer sentiment probabilities than expected")

        prediction_index = max(range(len(probabilities)), key=lambda index: probabilities[index])
        predicted_label = id_to_label.get(prediction_index)
        if predicted_label not in SENTIMENT_LABELS:
            raise ValueError("model returned an unsupported sentiment label")

        readable_probabilities: dict[str, float] = {}
        for label_id, label in sorted(id_to_label.items()):
            if label not in SENTIMENT_LABELS or label_id >= len(probabilities):
                continue
            probability = self._safe_probability(probabilities[label_id])
            if probability is not None:
                readable_probabilities[label] = probability

        if set(readable_probabilities.keys()) != set(SENTIMENT_LABELS):
            raise ValueError("model probabilities could not be mapped to sentiment labels")

        return ModelPrediction(
            label=predicted_label,
            confidence=readable_probabilities[predicted_label],
            probabilities={
                label: readable_probabilities[label] for label in SENTIMENT_LABELS
            },
            warnings=warnings,
        )

    def _unavailable_state(self, warnings: tuple[str, ...]) -> ModelState:
        return ModelState(
            available=False,
            model_source="fallback",
            prediction_source="fallback_rule",
            model_name=self.settings.indobert_model_name,
            configured_model_path=str(self.settings.indobert_model_path),
            configured_model_id=self.settings.indobert_model_id,
            max_length=self.settings.indobert_max_length,
            load_warnings=warnings,
            predict=None,
        )

    def _fallback_result(self, text: str, warnings: list[str]) -> SentimentPredictionData:
        label = self._fallback_label(text)
        probabilities = self._fallback_probabilities(label)

        return SentimentPredictionData(
            text=text,
            label=label,
            confidence=probabilities[label],
            probabilities=probabilities,
            model_name=self.settings.indobert_model_name,
            mode="fallback",
            prediction_source="fallback_rule",
            model_available=False,
            is_fallback=True,
            warnings=self._dedupe_warnings(warnings),
        )

    @staticmethod
    def _normalize_prediction_label(label: str) -> SentimentLabel:
        if label not in SENTIMENT_LABELS:
            raise ValueError("prediction label is not a supported sentiment label")
        return label  # type: ignore[return-value]

    @staticmethod
    def _dedupe_warnings(warnings: list[str] | tuple[str, ...]) -> list[str]:
        result = []
        for warning in warnings:
            if warning and warning not in result:
                result.append(warning)
        return result

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
