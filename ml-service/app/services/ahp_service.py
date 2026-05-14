from app.core.constants import PLACEHOLDER_STATUS
from app.schemas.common import PlaceholderData


def get_ahp_status() -> PlaceholderData:
    return PlaceholderData(module="ahp", status=PLACEHOLDER_STATUS)
