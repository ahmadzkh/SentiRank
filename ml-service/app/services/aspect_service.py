from app.core.constants import PLACEHOLDER_STATUS
from app.schemas.common import PlaceholderData


def get_aspect_status() -> PlaceholderData:
    return PlaceholderData(module="aspects", status=PLACEHOLDER_STATUS)
