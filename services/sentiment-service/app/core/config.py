"""Path and runtime settings for the SentiRank sentiment service."""

from functools import lru_cache
from os import getenv
from pathlib import Path

from pydantic import BaseModel

FINAL_SENTIMENT_MODEL = "run_3_weighted_loss_lr_1e-5"
SENTIMENT_LABELS = ["Negative", "Neutral", "Positive"]


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


class Settings(BaseModel):
    service_name: str = "sentiment-service"
    service_version: str = "0.1.0"
    datasets_dir: Path
    docs_dir: Path
    sentiment_model_dir: Path
    selected_model_name: str = FINAL_SENTIMENT_MODEL
    sentiment_labels: list[str] = SENTIMENT_LABELS


@lru_cache
def get_settings() -> Settings:
    return Settings(
        datasets_dir=_configured_dir("DATASETS_DIR", "datasets"),
        docs_dir=_configured_dir("DOCS_DIR", "docs"),
        sentiment_model_dir=Path(
            getenv("SENTIMENT_MODEL_DIR", "/app/models/indobert")
        ).resolve(),
    )
