from app.core.constants import PLACEHOLDER_STATUS
from app.schemas.common import PlaceholderData


def get_ranking_comparison_status() -> PlaceholderData:
    return PlaceholderData(module="ranking-comparison", status=PLACEHOLDER_STATUS)
