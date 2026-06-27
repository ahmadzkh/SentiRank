from pydantic import BaseModel, Field


class ReviewSample(BaseModel):
    external_id: str | None = None
    user_id: str | None = None
    user_name: str | None = None
    rating: int | None = None
    content: str | None = None
    word_count: int | None = None
    initial_sentiment: str | None = None
    final_sentiment: str | None = None
    aspect_label: str | None = None
    aspect_label_confidence: str | None = None
    aspect_data_status: str | None = None
    cleaned_text: str | None = None
    text_indobert: str | None = None
    text_svm: str | None = None
    preprocessing_status: str | None = None
    drop_reason: str | None = None
    text_length_before: int | None = None
    text_length_after: int | None = None
    reviewed_at: str | None = None
    source: str | None = None


class RandomReviewFilters(BaseModel):
    limit: int
    applied_limit: int
    sentiment: str | None = None
    rating: int | None = None
    seed: int | None = None
    sort: str | None = None


class RandomReviewsData(BaseModel):
    reviews: list[ReviewSample] = Field(default_factory=list)
    count: int
    filters: RandomReviewFilters
    warnings: list[str] = Field(default_factory=list)
