"""Fail-safe Google Play review acquisition skeleton for SentiRank.

This script defines the Spotify Indonesia Google Play scraping configuration and
planned output contract. Phase 6A intentionally disables live scraping.
"""

from __future__ import annotations

import argparse
import json
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Mapping, Sequence

DEFAULT_APP_ID = "com.spotify.music"
DEFAULT_SOURCE_NAME = "google_play_spotify_id"
DEFAULT_LANG = "id"
DEFAULT_COUNTRY = "id"
DEFAULT_OUTPUT_DIR = Path("../datasets/raw")
DEFAULT_BATCH_SIZE = 200
DEFAULT_SLEEP_SECONDS = 2.0

QUOTA_PER_RATING = {
    1: 20_000,
    2: 15_000,
    3: 30_000,
    4: 15_000,
    5: 20_000,
}

# Rating 3 uses Sort.MOST_RELEVANT because neutral reviews are harder to
# collect. This can introduce sampling bias and must be documented in the
# methodology.
DEFAULT_SORT_STRATEGY = {
    1: "Sort.NEWEST",
    2: "Sort.NEWEST",
    3: "Sort.MOST_RELEVANT",
    4: "Sort.NEWEST",
    5: "Sort.NEWEST",
}

RAW_REVIEW_SCHEMA = (
    "source",
    "app_id",
    "external_id",
    "author_name",
    "rating",
    "content",
    "likes",
    "app_version",
    "reviewed_at",
    "scraped_at",
    "sort_method",
)

GOOGLE_PLAY_FIELD_MAPPING = {
    "reviewId": "external_id",
    "userName": "author_name",
    "content": "content",
    "score": "rating",
    "thumbsUpCount": "likes",
    "reviewCreatedVersion": "app_version",
    "at": "reviewed_at",
}

STOPPING_RULES = (
    "continuation token is exhausted",
    "duplicate rate becomes too high",
    "no significant new reviews are found after repeated batches",
    "retry limit is exceeded",
)


@dataclass(frozen=True)
class ScrapingConfig:
    app_id: str
    source_name: str
    lang: str
    country: str
    output_dir: Path
    min_rating: int
    max_rating: int
    limit: int | None
    batch_size: int
    sleep_seconds: float
    dry_run: bool

    @property
    def ratings(self) -> tuple[int, ...]:
        return tuple(range(self.min_rating, self.max_rating + 1))

    @property
    def quota_by_rating(self) -> dict[int, int]:
        return {
            rating: min(QUOTA_PER_RATING[rating], self.limit)
            if self.limit is not None
            else QUOTA_PER_RATING[rating]
            for rating in self.ratings
        }


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=(
            "Configure the SentiRank Google Play review acquisition pipeline. "
            "Live scraping is disabled in Phase 6A."
        )
    )
    parser.add_argument("--app-id", default=DEFAULT_APP_ID)
    parser.add_argument("--source-name", default=DEFAULT_SOURCE_NAME)
    parser.add_argument("--lang", default=DEFAULT_LANG)
    parser.add_argument("--country", default=DEFAULT_COUNTRY)
    parser.add_argument("--output-dir", type=Path, default=DEFAULT_OUTPUT_DIR)
    parser.add_argument("--min-rating", type=int, default=1)
    parser.add_argument("--max-rating", type=int, default=5)
    parser.add_argument("--limit", type=int, default=None)
    parser.add_argument("--batch-size", type=int, default=DEFAULT_BATCH_SIZE)
    parser.add_argument("--sleep-seconds", type=float, default=DEFAULT_SLEEP_SECONDS)
    parser.add_argument("--dry-run", action="store_true")

    return parser.parse_args()


def build_scraping_config(args: argparse.Namespace) -> ScrapingConfig:
    config = ScrapingConfig(
        app_id=args.app_id,
        source_name=args.source_name,
        lang=args.lang,
        country=args.country,
        output_dir=args.output_dir,
        min_rating=args.min_rating,
        max_rating=args.max_rating,
        limit=args.limit,
        batch_size=args.batch_size,
        sleep_seconds=args.sleep_seconds,
        dry_run=args.dry_run,
    )
    validate_scraping_config(config)

    return config


def validate_scraping_config(config: ScrapingConfig) -> None:
    if not config.app_id.strip():
        raise ValueError("--app-id must not be empty.")
    if not config.source_name.strip():
        raise ValueError("--source-name must not be empty.")
    if config.min_rating < 1 or config.max_rating > 5:
        raise ValueError("--min-rating and --max-rating must be between 1 and 5.")
    if config.min_rating > config.max_rating:
        raise ValueError("--min-rating must be less than or equal to --max-rating.")
    if config.limit is not None and config.limit <= 0:
        raise ValueError("--limit must be greater than zero when provided.")
    if config.batch_size <= 0:
        raise ValueError("--batch-size must be greater than zero.")
    if config.sleep_seconds < 0:
        raise ValueError("--sleep-seconds must be zero or greater.")


def scrape_app_info(config: ScrapingConfig) -> Mapping[str, object]:
    # TODO: Use google-play-scraper app() in a later phase.
    # TODO: Save app metadata to datasets/raw/app_info_spotify.json.
    raise NotImplementedError("Live app info scraping is disabled in Phase 6A.")


def scrape_reviews_by_rating(
    config: ScrapingConfig,
    rating: int,
) -> Sequence[Mapping[str, object]]:
    # TODO: Use google-play-scraper reviews() with rating filters later.
    # TODO: Respect continuation tokens, quota, duplicate checks, and retries.
    raise NotImplementedError("Live review scraping is disabled in Phase 6A.")


def normalize_review_record(
    review: Mapping[str, object],
    config: ScrapingConfig,
    rating: int,
) -> dict[str, object]:
    # TODO: Revisit field normalization after live google-play-scraper output is
    # validated against the current package version.
    return {
        "source": config.source_name,
        "app_id": config.app_id,
        "external_id": review.get("reviewId"),
        "author_name": review.get("userName"),
        "rating": review.get("score", rating),
        "content": review.get("content"),
        "likes": review.get("thumbsUpCount"),
        "app_version": review.get("reviewCreatedVersion"),
        "reviewed_at": review.get("at"),
        "scraped_at": datetime.now(timezone.utc).isoformat(),
        "sort_method": DEFAULT_SORT_STRATEGY[rating],
    }


def save_raw_reviews(
    records: Sequence[Mapping[str, object]],
    output_path: Path,
) -> None:
    # TODO: Save normalized raw review records as CSV in a later phase.
    # TODO: Validate that output_path is inside datasets/raw/ before writing.
    raise NotImplementedError("Saving raw review files is disabled in Phase 6A.")


def save_scraping_summary(
    summary: Mapping[str, object],
    output_path: Path,
) -> None:
    # TODO: Save quota achievement and limitation notes as JSON in a later phase.
    # TODO: Include rating-3 availability limitations when quota is not reached.
    raise NotImplementedError("Saving scraping summary is disabled in Phase 6A.")


def get_planned_output_files(output_dir: Path) -> dict[str, str | list[str]]:
    return {
        "app_info": str(output_dir / "app_info_spotify.json"),
        "per_rating_reviews": [
            str(output_dir / f"reviews_rating_{rating}_raw.csv")
            for rating in QUOTA_PER_RATING
        ],
        "labeled_reviews": str(output_dir / "reviews_raw_labeled.csv"),
        "scraping_summary": str(output_dir / "scraping_summary.json"),
    }


def build_dry_run_payload(config: ScrapingConfig) -> dict[str, object]:
    return {
        "configuration": {
            "app_id": config.app_id,
            "source_name": config.source_name,
            "lang": config.lang,
            "country": config.country,
            "output_dir": str(config.output_dir),
            "min_rating": config.min_rating,
            "max_rating": config.max_rating,
            "limit": config.limit,
            "batch_size": config.batch_size,
            "sleep_seconds": config.sleep_seconds,
            "dry_run": config.dry_run,
        },
        "quota_per_rating": config.quota_by_rating,
        "raw_review_schema": RAW_REVIEW_SCHEMA,
        "google_play_field_mapping": GOOGLE_PLAY_FIELD_MAPPING,
        "sort_strategy": {
            rating: DEFAULT_SORT_STRATEGY[rating] for rating in config.ratings
        },
        "planned_output_files": get_planned_output_files(config.output_dir),
        "stopping_rules": STOPPING_RULES,
        "phase_6a_note": (
            "Dry run only. No Google Play scraping, downloads, or dataset files "
            "are created in Phase 6A."
        ),
    }


def print_dry_run(config: ScrapingConfig) -> None:
    print(json.dumps(build_dry_run_payload(config), indent=2, sort_keys=True))


def main() -> None:
    config = build_scraping_config(parse_args())

    if config.dry_run:
        print_dry_run(config)
        return

    print(
        "Live scraping is intentionally disabled in Phase 6A. "
        "Run with --dry-run to inspect the planned Google Play acquisition "
        "configuration without creating dataset files."
    )


if __name__ == "__main__":
    main()
