from __future__ import annotations

import csv
import hashlib
import random
from functools import lru_cache
from pathlib import Path

from app.schemas.reviews import RandomReviewResponse, ResearchReviewSample

RESEARCH_REVIEW_SOURCE = Path(
    "datasets/processed/reviews_with_aspect_labels_refined.csv"
)


def _repo_root() -> Path:
    return Path(__file__).resolve().parents[3]


def _dataset_path() -> Path:
    return _repo_root() / RESEARCH_REVIEW_SOURCE


def _normalize_text(value: str | None) -> str:
    return (value or "").strip()


def _normalize_sentiment(value: str | None) -> str | None:
    normalized = _normalize_text(value).lower()
    if normalized in {"negative", "neutral", "positive"}:
        return normalized
    return normalized or None


def _safe_int(value: str | None) -> int | None:
    try:
        return int(float(value or ""))
    except ValueError:
        return None


def _safe_review_id(row: dict[str, str]) -> str:
    source_value = (
        _normalize_text(row.get("external_id"))
        or _normalize_text(row.get("content"))
        or _normalize_text(row.get("reviewed_at"))
    )
    digest = hashlib.sha256(source_value.encode("utf-8")).hexdigest()[:12]
    return f"research-review-{digest}"


def _split_keywords(value: str | None) -> list[str]:
    raw = _normalize_text(value)
    if not raw:
        return []
    return [item.strip() for item in raw.split("|") if item.strip()]


def _map_review_sample(row: dict[str, str]) -> ResearchReviewSample:
    review_text = (
        _normalize_text(row.get("content"))
        or _normalize_text(row.get("text_indobert"))
        or _normalize_text(row.get("text_svm"))
        or "Belum tersedia"
    )

    return ResearchReviewSample(
        id=_safe_review_id(row),
        reviewText=review_text,
        rating=_safe_int(row.get("rating")),
        sentiment=_normalize_sentiment(
            row.get("final_sentiment") or row.get("initial_sentiment")
        ),
        aspect=_normalize_text(row.get("aspect_label")) or None,
        reviewedAt=_normalize_text(row.get("reviewed_at")) or None,
        source=_normalize_text(row.get("source"))
        or _normalize_text(row.get("app_id"))
        or str(RESEARCH_REVIEW_SOURCE),
        aspectConfidence=_normalize_text(row.get("aspect_label_confidence"))
        or None,
        keywords=_split_keywords(row.get("aspect_keywords_matched")),
    )


@lru_cache(maxsize=1)
def _load_review_samples() -> tuple[ResearchReviewSample, ...]:
    path = _dataset_path()

    if not path.exists():
        raise FileNotFoundError(f"Dataset riset tidak ditemukan: {path}")

    with path.open("r", encoding="utf-8-sig", newline="") as file:
        reader = csv.DictReader(file)
        return tuple(_map_review_sample(row) for row in reader)


def get_random_review_samples(
    *,
    limit: int = 10,
    sentiment: str | None = None,
    aspect: str | None = None,
    with_aspect: bool = False,
) -> RandomReviewResponse:
    samples = list(_load_review_samples())
    normalized_sentiment = _normalize_sentiment(sentiment)
    normalized_aspect = _normalize_text(aspect).lower()

    if normalized_sentiment:
        samples = [
            sample
            for sample in samples
            if _normalize_sentiment(sample.sentiment) == normalized_sentiment
        ]

    if normalized_aspect:
        samples = [
            sample
            for sample in samples
            if sample.aspect and normalized_aspect in sample.aspect.lower()
        ]

    if with_aspect:
        samples = [
            sample
            for sample in samples
            if sample.aspect and sample.aspect.lower() != "general"
        ]

    sample_count = min(limit, len(samples))
    items = random.sample(samples, sample_count) if sample_count > 0 else []

    return RandomReviewResponse(
        items=items,
        source=str(RESEARCH_REVIEW_SOURCE),
        limit=limit,
        count=len(items),
    )
