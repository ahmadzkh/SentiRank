"""Path and runtime settings for the SentiRank aspect service."""

from functools import lru_cache
from os import getenv
from pathlib import Path

from pydantic import BaseModel

FINAL_ASPECT_CLASSIFIER = "merged_5class"
SVM_ASPECT_MODEL_NAME = "svm_merged_5class"
FINAL_ASPECT_LABELS = [
    "Features, Content & Audio Experience",
    "App Reliability & Usability",
    "Ads Experience",
    "Subscription & Pricing",
    "Account/Login",
]
EXPECTED_PIPELINE_FILE = "svm_merged_5class_pipeline.joblib"


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
    service_name: str = "aspect-service"
    service_version: str = "0.1.0"
    datasets_dir: Path
    docs_dir: Path
    aspect_model_dir: Path
    aspect_model_path: Path
    selected_classifier_name: str = FINAL_ASPECT_CLASSIFIER
    final_aspect_labels: list[str] = FINAL_ASPECT_LABELS


@lru_cache
def get_settings() -> Settings:
    aspect_model_dir = Path(getenv("ASPECT_MODEL_DIR", "/app/models/svm")).resolve()
    configured_model_path = getenv("SVM_ASPECT_MODEL_PATH")
    aspect_model_path = (
        Path(configured_model_path).resolve()
        if configured_model_path
        else aspect_model_dir / EXPECTED_PIPELINE_FILE
    )

    return Settings(
        datasets_dir=_configured_dir("DATASETS_DIR", "datasets"),
        docs_dir=_configured_dir("DOCS_DIR", "docs"),
        aspect_model_dir=aspect_model_dir,
        aspect_model_path=aspect_model_path,
    )
