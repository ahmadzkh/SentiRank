from pydantic import BaseModel, Field


class ResearchReviewSample(BaseModel):
    id: str
    reviewText: str
    rating: int | None = None
    sentiment: str | None = None
    aspect: str | None = None
    reviewedAt: str | None = None
    source: str | None = None
    aspectConfidence: str | None = None
    keywords: list[str] = Field(default_factory=list)


class RandomReviewResponse(BaseModel):
    items: list[ResearchReviewSample]
    source: str
    limit: int
    count: int
