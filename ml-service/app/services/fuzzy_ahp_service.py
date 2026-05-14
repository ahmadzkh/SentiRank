from app.core.constants import PLACEHOLDER_STATUS
from app.schemas.common import PlaceholderData


def get_fuzzy_ahp_status() -> PlaceholderData:
    return PlaceholderData(module="fuzzy-ahp", status=PLACEHOLDER_STATUS)
