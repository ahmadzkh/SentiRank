"""Google Play review acquisition pipeline for SentiRank.

The full 100,000-review job is opt-in: it runs only when this script is
explicitly executed without --dry-run.
"""

from __future__ import annotations

import argparse
import json
import time
from collections.abc import Callable, Mapping, Sequence
from dataclasses import dataclass
from datetime import date, datetime, timezone
from pathlib import Path

import pandas as pd
from google_play_scraper import Sort, app, reviews
from google_play_scraper.features.reviews import _ContinuationToken

DEFAULT_APP_ID = "com.spotify.music"
DEFAULT_SOURCE_NAME = "google_play_spotify_id"
DEFAULT_LANG = "id"
DEFAULT_COUNTRY = "id"
DEFAULT_OUTPUT_DIR = Path("../datasets/raw")
DEFAULT_BATCH_SIZE = 200
DEFAULT_SLEEP_SECONDS = 2.0

MAX_REVIEWS_PER_REQUEST = 200
MAX_RETRIES = 3
MAX_ZERO_NEW_BATCHES = 3
MAX_HIGH_DUPLICATE_BATCHES = 3
HIGH_DUPLICATE_RATE = 0.9

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
    1: Sort.NEWEST,
    2: Sort.NEWEST,
    3: Sort.MOST_RELEVANT,
    4: Sort.NEWEST,
    5: Sort.NEWEST,
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


@dataclass(frozen=True)
class RatingScrapeResult:
    rating: int
    target_count: int
    achieved_count: int
    new_count: int
    duplicate_count: int
    request_count: int
    retry_count: int
    stop_reason: str
    output_path: Path
    state_path: Path


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Scrape Google Play reviews for the SentiRank research corpus."
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
        batch_size=min(args.batch_size, MAX_REVIEWS_PER_REQUEST),
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
    app_info = run_with_retries(
        lambda: app(config.app_id, lang=config.lang, country=config.country),
        action_label="app info scraping",
    )
    output_path = get_app_info_output_path(config.output_dir)
    save_json(app_info, output_path)

    return app_info


def scrape_reviews_by_rating(
    config: ScrapingConfig,
    rating: int,
) -> RatingScrapeResult:
    output_path = get_rating_output_path(config.output_dir, rating)
    state_path = get_rating_state_path(config.output_dir, rating)
    target_count = config.quota_by_rating[rating]
    records = load_existing_reviews(output_path)
    seen_external_ids = {
        str(record["external_id"])
        for record in records
        if record.get("external_id") not in (None, "")
    }
    initial_count = len(records)
    duplicate_count = 0
    request_count = 0
    retry_count = 0
    zero_new_batches = 0
    high_duplicate_batches = 0
    continuation_token = load_continuation_token(config, rating, state_path)
    stop_reason = "quota_reached"

    while len(records) < target_count:
        remaining_count = target_count - len(records)
        batch_count = min(config.batch_size, remaining_count)
        continuation_token = resize_continuation_token(
            token=continuation_token,
            config=config,
            rating=rating,
            count=batch_count,
        )

        try:
            review_batch, continuation_token = reviews(
                config.app_id,
                lang=config.lang,
                country=config.country,
                sort=DEFAULT_SORT_STRATEGY[rating],
                count=batch_count,
                filter_score_with=rating,
                continuation_token=continuation_token,
            )
        except Exception as error:
            retry_count += 1
            if retry_count >= MAX_RETRIES:
                stop_reason = f"retry_limit_exceeded: {error}"
                break
            time.sleep(config.sleep_seconds)
            continue

        request_count += 1
        batch_duplicate_count = 0
        new_records = []

        for review in review_batch:
            external_id = review.get("reviewId")
            external_id_key = str(external_id) if external_id is not None else ""

            if external_id_key and external_id_key in seen_external_ids:
                batch_duplicate_count += 1
                continue

            normalized_record = normalize_review_record(review, config, rating)
            new_records.append(normalized_record)

            if external_id_key:
                seen_external_ids.add(external_id_key)

        duplicate_count += batch_duplicate_count
        duplicate_rate = (
            batch_duplicate_count / len(review_batch) if len(review_batch) > 0 else 0.0
        )

        if len(new_records) == 0:
            zero_new_batches += 1
        else:
            zero_new_batches = 0

        if len(review_batch) > 0 and duplicate_rate >= HIGH_DUPLICATE_RATE:
            high_duplicate_batches += 1
        else:
            high_duplicate_batches = 0

        records.extend(new_records)
        save_raw_reviews(records, output_path)
        save_continuation_state(
            config=config,
            rating=rating,
            target_count=target_count,
            achieved_count=len(records),
            continuation_token=continuation_token,
            stop_reason="in_progress",
            state_path=state_path,
        )

        if len(records) >= target_count:
            stop_reason = "quota_reached"
            break
        if is_token_exhausted(continuation_token):
            stop_reason = "continuation_token_exhausted"
            break
        if zero_new_batches >= MAX_ZERO_NEW_BATCHES:
            stop_reason = "no_significant_new_reviews"
            break
        if high_duplicate_batches >= MAX_HIGH_DUPLICATE_BATCHES:
            stop_reason = "duplicate_rate_too_high"
            break

        time.sleep(config.sleep_seconds)

    save_continuation_state(
        config=config,
        rating=rating,
        target_count=target_count,
        achieved_count=len(records),
        continuation_token=continuation_token,
        stop_reason=stop_reason,
        state_path=state_path,
    )

    return RatingScrapeResult(
        rating=rating,
        target_count=target_count,
        achieved_count=len(records),
        new_count=len(records) - initial_count,
        duplicate_count=duplicate_count,
        request_count=request_count,
        retry_count=retry_count,
        stop_reason=stop_reason,
        output_path=output_path,
        state_path=state_path,
    )


def normalize_review_record(
    review: Mapping[str, object],
    config: ScrapingConfig,
    rating: int,
) -> dict[str, object]:
    return {
        "source": config.source_name,
        "app_id": config.app_id,
        "external_id": review.get("reviewId"),
        "author_name": review.get("userName"),
        "rating": review.get("score", rating),
        "content": review.get("content"),
        "likes": review.get("thumbsUpCount"),
        "app_version": review.get("reviewCreatedVersion"),
        "reviewed_at": serialize_value(review.get("at")),
        "scraped_at": datetime.now(timezone.utc).isoformat(),
        "sort_method": format_sort(DEFAULT_SORT_STRATEGY[rating]),
    }


def save_raw_reviews(
    records: Sequence[Mapping[str, object]],
    output_path: Path,
) -> None:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    dataframe = pd.DataFrame(records)
    dataframe = dataframe.reindex(columns=RAW_REVIEW_SCHEMA)
    dataframe.to_csv(output_path, index=False)


def save_scraping_summary(
    summary: Mapping[str, object],
    output_path: Path,
) -> None:
    save_json(summary, output_path)


def get_planned_output_files(output_dir: Path) -> dict[str, str | list[str]]:
    return {
        "app_info": str(get_app_info_output_path(output_dir)),
        "per_rating_reviews": [
            str(get_rating_output_path(output_dir, rating)) for rating in QUOTA_PER_RATING
        ],
        "labeled_reviews": str(output_dir / "reviews_raw_labeled.csv"),
        "scraping_summary": str(get_scraping_summary_output_path(output_dir)),
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
            rating: format_sort(DEFAULT_SORT_STRATEGY[rating])
            for rating in config.ratings
        },
        "planned_output_files": get_planned_output_files(config.output_dir),
        "stopping_rules": STOPPING_RULES,
        "phase_6b_note": (
            "Dry run only. No Google Play scraping, downloads, or dataset files "
            "are created unless this script is explicitly run without --dry-run."
        ),
    }


def print_dry_run(config: ScrapingConfig) -> None:
    print(json.dumps(build_dry_run_payload(config), indent=2, sort_keys=True))


def load_existing_reviews(output_path: Path) -> list[dict[str, object]]:
    if not output_path.is_file():
        return []

    dataframe = pd.read_csv(output_path)
    dataframe = dataframe.where(pd.notna(dataframe), None)

    return list(dataframe.to_dict(orient="records"))


def load_continuation_token(
    config: ScrapingConfig,
    rating: int,
    state_path: Path,
) -> _ContinuationToken | None:
    if not state_path.is_file():
        return None

    state = json.loads(state_path.read_text(encoding="utf-8"))
    token_value = state.get("continuation_token")

    if token_value is None:
        return None

    return _ContinuationToken(
        token_value,
        config.lang,
        config.country,
        DEFAULT_SORT_STRATEGY[rating].value,
        config.batch_size,
        rating,
        None,
    )


def resize_continuation_token(
    token: _ContinuationToken | None,
    config: ScrapingConfig,
    rating: int,
    count: int,
) -> _ContinuationToken | None:
    if token is None or token.token is None:
        return token

    return _ContinuationToken(
        token.token,
        config.lang,
        config.country,
        DEFAULT_SORT_STRATEGY[rating].value,
        count,
        rating,
        None,
    )


def save_continuation_state(
    config: ScrapingConfig,
    rating: int,
    target_count: int,
    achieved_count: int,
    continuation_token: _ContinuationToken | None,
    stop_reason: str,
    state_path: Path,
) -> None:
    payload = {
        "app_id": config.app_id,
        "source_name": config.source_name,
        "rating": rating,
        "target_count": target_count,
        "achieved_count": achieved_count,
        "continuation_token": None
        if continuation_token is None
        else continuation_token.token,
        "sort_method": format_sort(DEFAULT_SORT_STRATEGY[rating]),
        "stop_reason": stop_reason,
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }
    save_json(payload, state_path)


def build_scraping_summary(
    config: ScrapingConfig,
    app_info: Mapping[str, object],
    results: Sequence[RatingScrapeResult],
) -> dict[str, object]:
    rating_results = {
        str(result.rating): {
            "target_count": result.target_count,
            "achieved_count": result.achieved_count,
            "new_count": result.new_count,
            "duplicate_count": result.duplicate_count,
            "request_count": result.request_count,
            "retry_count": result.retry_count,
            "stop_reason": result.stop_reason,
            "output_path": str(result.output_path),
            "state_path": str(result.state_path),
            "rating_3_limitation_note": build_rating_3_limitation_note(result),
        }
        for result in results
    }

    return {
        "source_name": config.source_name,
        "app_id": config.app_id,
        "app_title": app_info.get("title"),
        "lang": config.lang,
        "country": config.country,
        "batch_size": config.batch_size,
        "sleep_seconds": config.sleep_seconds,
        "limit": config.limit,
        "quota_per_rating": config.quota_by_rating,
        "rating_results": rating_results,
        "output_files": get_planned_output_files(config.output_dir),
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "full_scraping_note": (
            "Full 100,000-review scraping is not automatic. It only runs when "
            "this script is explicitly executed without --dry-run and without "
            "a small --limit."
        ),
    }


def build_rating_3_limitation_note(result: RatingScrapeResult) -> str | None:
    if result.rating != 3 or result.achieved_count >= result.target_count:
        return None

    return (
        "Rating 3 quota was not reached. Save the maximum available reviews and "
        "document this limitation because neutral reviews are harder to collect."
    )


def get_app_info_output_path(output_dir: Path) -> Path:
    return output_dir / "app_info_spotify.json"


def get_rating_output_path(output_dir: Path, rating: int) -> Path:
    return output_dir / f"reviews_rating_{rating}_raw.csv"


def get_rating_state_path(output_dir: Path, rating: int) -> Path:
    return output_dir / f"scraping_state_rating_{rating}.json"


def get_scraping_summary_output_path(output_dir: Path) -> Path:
    return output_dir / "scraping_summary.json"


def run_with_retries(
    action: Callable[[], Mapping[str, object]],
    action_label: str,
) -> Mapping[str, object]:
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            result = action()
        except Exception:
            if attempt >= MAX_RETRIES:
                raise
            time.sleep(DEFAULT_SLEEP_SECONDS)
            continue

        if not isinstance(result, Mapping):
            raise TypeError(f"{action_label} returned an unexpected result.")

        return result

    raise RuntimeError(f"{action_label} failed.")


def save_json(payload: Mapping[str, object], output_path: Path) -> None:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(
        json.dumps(payload, indent=2, sort_keys=True, default=serialize_value),
        encoding="utf-8",
    )


def serialize_value(value: object) -> object:
    if isinstance(value, datetime):
        return value.isoformat()
    if isinstance(value, date):
        return value.isoformat()
    if isinstance(value, Path):
        return str(value)
    return value


def format_sort(sort: Sort) -> str:
    return f"Sort.{sort.name}"


def is_token_exhausted(token: _ContinuationToken | None) -> bool:
    return token is None or token.token is None


def main() -> None:
    config = build_scraping_config(parse_args())

    if config.dry_run:
        print_dry_run(config)
        return

    config.output_dir.mkdir(parents=True, exist_ok=True)
    app_info = scrape_app_info(config)
    results = [
        scrape_reviews_by_rating(config=config, rating=rating)
        for rating in config.ratings
    ]
    summary = build_scraping_summary(config=config, app_info=app_info, results=results)
    summary_path = get_scraping_summary_output_path(config.output_dir)
    save_scraping_summary(summary, summary_path)
    print(json.dumps(summary, indent=2, sort_keys=True, default=serialize_value))


if __name__ == "__main__":
    main()
