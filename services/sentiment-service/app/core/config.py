"""Path and runtime settings for the SentiRank sentiment service."""

from functools import lru_cache
from os import getenv
from pathlib import Path
from typing import Literal

from pydantic import BaseModel

FINAL_SENTIMENT_MODEL = "run_3_weighted_loss_lr_1e-5"
DEFAULT_INDOBERT_MODEL_ID = "ahmadzkh/sentirank-indobert-run3"
DEFAULT_INDOBERT_MAX_LENGTH = 128
SENTIMENT_LABELS = ["Negative", "Neutral", "Positive"]
SentimentModelSource = Literal["auto", "local", "hf"]


def _unique_candidates(paths: list[Path]) -> list[Path]:
    seen = set()
    result = []
    for path in paths:
        resolved = path.resolve()
        if resolved not in seen:
            seen.add(resolved)
            result.append(resolved)
    return result


def _find_project_dir(folder_name: str) -> Path:
    starts = [Path.cwd(), Path(__file__).resolve()]
    candidates = []
    for start in starts:
        candidates.extend([start, *start.parents])

    for candidate in _unique_candidates(candidates):
        folder = candidate / folder_name
        if folder.exists() and folder.is_dir():
            return folder

    return Path(folder_name).resolve()


def _configured_dir(env_name: str, folder_name: str) -> Path:
    configured = getenv(env_name)
    if configured:
        return Path(configured).resolve()
    return _find_project_dir(folder_name)


def _configured_model_source() -> SentimentModelSource:
    raw_source = getenv("SENTIMENT_MODEL_SOURCE", "auto").strip().lower()
    if raw_source in {"auto", "local", "hf"}:
        return raw_source  # type: ignore[return-value]
    return "auto"


def _configured_max_length() -> int:
    raw_value = getenv("INDOBERT_MAX_LENGTH")
    if raw_value is None:
        return DEFAULT_INDOBERT_MAX_LENGTH
    try:
        max_length = int(raw_value)
    except ValueError:
        return DEFAULT_INDOBERT_MAX_LENGTH
    return max_length if max_length > 0 else DEFAULT_INDOBERT_MAX_LENGTH


def _default_indobert_model_path(sentiment_model_dir: Path) -> Path:
    configured = getenv("INDOBERT_MODEL_PATH")
    if configured:
        return Path(configured).resolve()

    legacy_model_dir = getenv("SENTIMENT_MODEL_DIR")
    if legacy_model_dir:
        legacy_path = Path(legacy_model_dir).resolve()
        if legacy_path.name == FINAL_SENTIMENT_MODEL:
            return legacy_path
        return legacy_path / FINAL_SENTIMENT_MODEL

    ml_service_dir = _find_project_dir("ml-service")
    return (
        ml_service_dir
        / "saved_models"
        / "indobert"
        / FINAL_SENTIMENT_MODEL
    ).resolve()


class Settings(BaseModel):
    service_name: str = "sentiment-service"
    service_version: str = "0.1.0"
    datasets_dir: Path
    docs_dir: Path
    sentiment_model_dir: Path
    sentiment_model_source: SentimentModelSource = "auto"
    indobert_model_path: Path
    indobert_model_id: str | None = DEFAULT_INDOBERT_MODEL_ID
    indobert_model_name: str = FINAL_SENTIMENT_MODEL
    indobert_max_length: int = DEFAULT_INDOBERT_MAX_LENGTH
    hf_token: str | None = None
    selected_model_name: str = FINAL_SENTIMENT_MODEL
    sentiment_labels: list[str] = SENTIMENT_LABELS


@lru_cache
def get_settings() -> Settings:
    sentiment_model_dir = Path(
        getenv("SENTIMENT_MODEL_DIR", "/app/models/indobert")
    ).resolve()
    indobert_model_id = getenv("INDOBERT_MODEL_ID", DEFAULT_INDOBERT_MODEL_ID).strip()

    return Settings(
        datasets_dir=_configured_dir("DATASETS_DIR", "datasets"),
        docs_dir=_configured_dir("DOCS_DIR", "docs"),
        sentiment_model_dir=sentiment_model_dir,
        sentiment_model_source=_configured_model_source(),
        indobert_model_path=_default_indobert_model_path(sentiment_model_dir),
        indobert_model_id=indobert_model_id or None,
        indobert_model_name=getenv("INDOBERT_MODEL_NAME", FINAL_SENTIMENT_MODEL),
        indobert_max_length=_configured_max_length(),
        hf_token=getenv("HF_TOKEN") or None,
    )
