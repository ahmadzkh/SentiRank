from app.core.constants import PLACEHOLDER_STATUS
from app.schemas.common import PlaceholderData


def get_sentiment_status() -> PlaceholderData:
    return PlaceholderData(module="sentiment", status=PLACEHOLDER_STATUS)
