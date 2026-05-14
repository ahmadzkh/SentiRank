from app.core.constants import PLACEHOLDER_STATUS
from app.schemas.common import PlaceholderData


def get_preprocessing_status() -> PlaceholderData:
    return PlaceholderData(module="preprocessing", status=PLACEHOLDER_STATUS)
