from app.core.constants import PLACEHOLDER_STATUS
from app.schemas.common import PlaceholderData


def get_ranking_status() -> PlaceholderData:
    return PlaceholderData(module="ranking", status=PLACEHOLDER_STATUS)
