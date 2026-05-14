from app.core.constants import PLACEHOLDER_STATUS
from app.schemas.common import PlaceholderData


def get_evaluation_status() -> PlaceholderData:
    return PlaceholderData(module="evaluation", status=PLACEHOLDER_STATUS)
