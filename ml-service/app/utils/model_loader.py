from dataclasses import dataclass

from app.core.constants import PLACEHOLDER_STATUS


@dataclass(frozen=True)
class ModelLoadStatus:
    model_name: str
    status: str


def get_model_load_status(model_name: str) -> ModelLoadStatus:
    return ModelLoadStatus(model_name=model_name, status=PLACEHOLDER_STATUS)
