from __future__ import annotations

import csv
import json
import random
from pathlib import Path
from typing import Any

from app.core.config import Settings
from app.schemas.review import RandomReviewFilters, RandomReviewsData, ReviewSample


class ResearchDataService:
    def __init__(self, settings: Settings) -> None:
        self.settings = settings
        self.datasets_dir = settings.datasets_dir
        self.docs_dir = settings.docs_dir

    def dataset_summary(self) -> dict[str, Any]:
        warnings: list[str] = []
        raw_dir = self.datasets_dir / "raw"
        eda_dir = self.datasets_dir / "outputs" / "eda"
        acquisition_dir = eda_dir / "01_data_acquisition"
        evaluation_summary_path = eda_dir / "05_evaluation" / "model_evaluation_summary.json"

        acquisition_summary = self._read_json(raw_dir / "data_acquisition_summary.json", warnings)
        scraping_summary = self._read_json(raw_dir / "scraping_summary.json", warnings)
        app_info = self._read_json(raw_dir / "app_info_spotify.json", warnings)
        rating_distribution = self._read_json(acquisition_dir / "rating_distribution_raw.json", warnings)
        sentiment_distribution = self._read_json(acquisition_dir / "sentiment_distribution_raw.json", warnings)
        missing_values = self._read_json(acquisition_dir / "missing_value_summary.json", warnings)
        text_length_summary = self._read_json(acquisition_dir / "text_length_summary_raw.json", warnings)
        evaluation_summary = self._read_json(evaluation_summary_path, warnings)

        return {
            "dataset_availability": self._dataset_availability(),
            "total_review_count": self._first_value(
                acquisition_summary,
                "total_rows",
                self._sum_distribution_counts(rating_distribution),
            ),
            "rating_distribution": self._normalise_distribution(
                acquisition_summary.get("rows_per_rating")
                if isinstance(acquisition_summary, dict)
                else None,
                rating_distribution,
                key_field="rating",
            ),
            "sentiment_distribution": self._normalise_distribution(
                acquisition_summary.get("rows_per_initial_sentiment")
                if isinstance(acquisition_summary, dict)
                else None,
                sentiment_distribution,
                key_field="sentiment",
            ),
            "source_application": self._app_metadata(app_info, scraping_summary),
            "review_period": {
                "reviewed_at_min": acquisition_summary.get("reviewed_at_min")
                if isinstance(acquisition_summary, dict)
                else None,
                "reviewed_at_max": acquisition_summary.get("reviewed_at_max")
                if isinstance(acquisition_summary, dict)
                else None,
            },
            "missing_value_summary": missing_values,
            "text_length_summary": text_length_summary,
            "evaluation_summary_available": bool(evaluation_summary),
            "warnings": warnings,
        }

    def scraping_summary(self) -> dict[str, Any]:
        warnings: list[str] = []
        raw_dir = self.datasets_dir / "raw"
        acquisition_dir = self.datasets_dir / "outputs" / "eda" / "01_data_acquisition"

        scraping_summary = self._read_json(raw_dir / "scraping_summary.json", warnings)
        acquisition_summary = self._read_json(raw_dir / "data_acquisition_summary.json", warnings)
        quota_achievement = self._read_json(acquisition_dir / "scraping_quota_achievement.json", warnings)

        rating_results = scraping_summary.get("rating_results", {}) if isinstance(scraping_summary, dict) else {}
        achieved_by_rating = {
            str(item.get("rating")): item.get("actual_count")
            for item in quota_achievement
            if isinstance(item, dict)
        } if isinstance(quota_achievement, list) else {}

        if not achieved_by_rating and isinstance(acquisition_summary, dict):
            achieved_by_rating = acquisition_summary.get("rows_per_rating", {})

        return {
            "app_id": self._first_value(scraping_summary, "app_id", "com.spotify.music"),
            "source_name": self._first_value(scraping_summary, "source_name", "google_play_spotify_id"),
            "app_title": scraping_summary.get("app_title") if isinstance(scraping_summary, dict) else None,
            "country": scraping_summary.get("country") if isinstance(scraping_summary, dict) else None,
            "lang": scraping_summary.get("lang") if isinstance(scraping_summary, dict) else None,
            "target_quota_per_rating": self._target_quota(scraping_summary, quota_achievement),
            "achieved_count_per_rating": achieved_by_rating,
            "total_achieved_rows": self._first_value(
                acquisition_summary,
                "total_rows",
                sum(value for value in achieved_by_rating.values() if isinstance(value, int)),
            ),
            "rating_results": rating_results,
            "rating_3_limitation_note": acquisition_summary.get("rating_3_limitation_note")
            if isinstance(acquisition_summary, dict)
            else None,
            "generated_at": self._first_value(scraping_summary, "generated_at", None),
            "warnings": warnings,
        }

    def preprocessing_summary(self) -> dict[str, Any]:
        warnings: list[str] = []
        preprocessing_dir = self.datasets_dir / "outputs" / "eda" / "02_preprocessing"

        preprocessing_summary = self._read_json(preprocessing_dir / "preprocessing_summary.json", warnings)
        relabeling_summary = self._read_json(preprocessing_dir / "relabeling_summary.json", warnings)
        before_distribution = self._read_json(
            preprocessing_dir / "label_distribution_before_relabeling.json",
            warnings,
        )
        after_distribution = self._read_json(
            preprocessing_dir / "label_distribution_after_relabeling.json",
            warnings,
        )
        aspect_summary = self._read_json(preprocessing_dir / "aspect_labeling_summary.json", warnings)
        refined_aspect_summary = self._read_json(
            preprocessing_dir / "aspect_labeling_refined_summary.json",
            warnings,
        )
        taxonomy_summary = self._read_json(
            preprocessing_dir / "aspect_taxonomy_derivation_summary.json",
            warnings,
        )
        general_fallback = self._read_json(
            preprocessing_dir / "general_fallback_analysis.json",
            warnings,
        )
        text_cleaning = self._read_json(
            preprocessing_dir / "text_length_before_after_cleaning.json",
            warnings,
        )

        return {
            "total_rows": self._first_value(preprocessing_summary, "total_rows", None),
            "relabeling_changes": {
                "changed_label_count": relabeling_summary.get("changed_label_count")
                if isinstance(relabeling_summary, dict)
                else None,
                "changed_label_percentage": relabeling_summary.get("changed_label_percentage")
                if isinstance(relabeling_summary, dict)
                else None,
                "rating_3_changed_count": relabeling_summary.get("rating_3_changed_count")
                if isinstance(relabeling_summary, dict)
                else None,
            },
            "sentiment_distribution_before": self._normalise_distribution(
                relabeling_summary.get("label_distribution_before")
                if isinstance(relabeling_summary, dict)
                else None,
                before_distribution,
                key_field="label",
            ),
            "sentiment_distribution_after": self._normalise_distribution(
                relabeling_summary.get("label_distribution_after")
                if isinstance(relabeling_summary, dict)
                else None,
                after_distribution,
                key_field="label",
            ),
            "text_cleaning_summary": text_cleaning,
            "aspect_weak_label_summary": refined_aspect_summary or aspect_summary,
            "aspect_taxonomy_summary_available": bool(taxonomy_summary),
            "general_fallback_limitation": self._general_fallback_limitation(general_fallback),
            "warnings": warnings,
        }

    def random_reviews(
        self,
        limit: int,
        sentiment: str | None = None,
        rating: int | None = None,
        seed: int | None = None,
    ) -> RandomReviewsData:
        warnings: list[str] = []
        clamped_limit = max(1, min(limit, self.settings.max_random_review_limit))
        if clamped_limit != limit:
            warnings.append(
                f"Requested limit {limit} was clamped to {clamped_limit}."
            )

        dataset_path = self._random_reviews_path(warnings)
        filters = RandomReviewFilters(
            limit=limit,
            applied_limit=clamped_limit,
            sentiment=sentiment,
            rating=rating,
            seed=seed,
        )

        if dataset_path is None:
            warnings.append("No random review source CSV is available.")
            return RandomReviewsData(reviews=[], count=0, filters=filters, warnings=warnings)

        rows = self._read_review_rows(dataset_path, sentiment=sentiment, rating=rating)
        if not rows:
            warnings.append("No reviews matched the requested filters.")
            return RandomReviewsData(reviews=[], count=0, filters=filters, warnings=warnings)

        rng = random.Random(seed)
        selected = rows if len(rows) <= clamped_limit else rng.sample(rows, clamped_limit)
        reviews = [self._review_sample(row) for row in selected]

        return RandomReviewsData(
            reviews=reviews,
            count=len(reviews),
            filters=filters,
            warnings=warnings,
        )

    def latest_negative_reviews(
        self,
        limit: int,
        sort: str = "reviewed_at_desc",
    ) -> RandomReviewsData:
        warnings: list[str] = []
        clamped_limit = max(1, min(limit, self.settings.max_random_review_limit))
        if clamped_limit != limit:
            warnings.append(f"Requested limit {limit} was clamped to {clamped_limit}.")
        if sort not in {"reviewed_at_desc", "word_count_desc"}:
            warnings.append(f"Unsupported sort '{sort}' was replaced with reviewed_at_desc.")
            sort = "reviewed_at_desc"

        dataset_path = self._latest_negative_reviews_path(warnings)
        filters = RandomReviewFilters(
            limit=limit,
            applied_limit=clamped_limit,
            sentiment="Negative",
            rating=None,
            seed=None,
            sort=sort,
        )

        if dataset_path is None:
            warnings.append("No latest negative review source CSV is available.")
            return RandomReviewsData(reviews=[], count=0, filters=filters, warnings=warnings)

        rows = self._read_review_rows(dataset_path, sentiment="Negative", rating=None)
        if sort == "word_count_desc":
            rows.sort(
                key=lambda row: (
                    self._word_count(row),
                    row.get("reviewed_at") or "",
                ),
                reverse=True,
            )
        else:
            rows.sort(key=lambda row: row.get("reviewed_at") or "", reverse=True)

        author_names = self._author_names_by_external_id()
        selected_rows = [
            self._with_author_name(row, author_names)
            for row in rows[:clamped_limit]
        ]
        reviews = [self._review_sample(row) for row in selected_rows]

        return RandomReviewsData(
            reviews=reviews,
            count=len(reviews),
            filters=filters,
            warnings=warnings,
        )

    def _read_json(self, path: Path, warnings: list[str]) -> Any:
        if not path.exists():
            warnings.append(f"Missing file: {self._display_path(path)}")
            return {} if path.suffix.lower() == ".json" else None
        try:
            return json.loads(path.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError) as error:
            warnings.append(f"Could not read JSON file {self._display_path(path)}: {error}")
            return {}

    def _dataset_availability(self) -> dict[str, bool]:
        raw_dir = self.datasets_dir / "raw"
        processed_dir = self.datasets_dir / "processed"
        return {
            "datasets_dir_exists": self.datasets_dir.exists(),
            "docs_dir_exists": self.docs_dir.exists(),
            "raw_dir_exists": raw_dir.exists(),
            "processed_dir_exists": processed_dir.exists(),
            "data_acquisition_summary": (raw_dir / "data_acquisition_summary.json").exists(),
            "scraping_summary": (raw_dir / "scraping_summary.json").exists(),
            "reviews_final": (processed_dir / "reviews_final.csv").exists(),
            "reviews_with_aspect_labels": (
                processed_dir / "reviews_with_aspect_labels.csv"
            ).exists(),
            "reviews_with_aspect_labels_refined": (
                processed_dir / "reviews_with_aspect_labels_refined.csv"
            ).exists(),
            "reviews_raw_labeled": (raw_dir / "reviews_raw_labeled.csv").exists(),
        }

    def _random_reviews_path(self, warnings: list[str]) -> Path | None:
        preferred = self.datasets_dir / "processed" / "reviews_final.csv"
        fallback = self.datasets_dir / "raw" / "reviews_raw_labeled.csv"
        if preferred.exists():
            return preferred
        warnings.append(f"Preferred random review source missing: {self._display_path(preferred)}")
        if fallback.exists():
            return fallback
        warnings.append(f"Fallback random review source missing: {self._display_path(fallback)}")
        return None

    def _latest_negative_reviews_path(self, warnings: list[str]) -> Path | None:
        candidates = [
            self.datasets_dir / "processed" / "reviews_with_aspect_labels_refined.csv",
            self.datasets_dir / "processed" / "reviews_with_aspect_labels.csv",
            self.datasets_dir / "processed" / "reviews_final.csv",
            self.datasets_dir / "raw" / "reviews_raw_labeled.csv",
        ]
        for path in candidates:
            if path.exists():
                return path
        warnings.append("No review CSV source is available for latest negative reviews.")
        return None

    def _read_review_rows(
        self,
        path: Path,
        sentiment: str | None,
        rating: int | None,
    ) -> list[dict[str, str]]:
        rows: list[dict[str, str]] = []
        sentiment_filter = sentiment.lower() if sentiment else None

        with path.open("r", encoding="utf-8-sig", newline="") as handle:
            reader = csv.DictReader(handle)
            for row in reader:
                if rating is not None and self._safe_int(row.get("rating")) != rating:
                    continue
                if sentiment_filter is not None:
                    row_sentiment = (row.get("final_sentiment") or row.get("initial_sentiment") or "").lower()
                    if row_sentiment != sentiment_filter:
                        continue
                rows.append(row)
        return rows

    def _review_sample(self, row: dict[str, str]) -> ReviewSample:
        external_id = row.get("external_id") or None
        user_name = self._first_non_empty(
            row,
            ("author_name", "user_name", "username", "reviewer_name"),
        )
        user_id = self._first_non_empty(
            row,
            ("user_id", "reviewer_id", "author_id"),
        ) or external_id

        return ReviewSample(
            external_id=external_id,
            user_id=user_id,
            user_name=user_name,
            rating=self._safe_int(row.get("rating")),
            content=row.get("content") or None,
            word_count=self._word_count(row),
            initial_sentiment=row.get("initial_sentiment") or None,
            final_sentiment=row.get("final_sentiment") or row.get("initial_sentiment") or None,
            aspect_label=row.get("aspect_label") or None,
            reviewed_at=row.get("reviewed_at") or None,
            source=row.get("source") or None,
        )

    def _author_names_by_external_id(self) -> dict[str, str]:
        raw_path = self.datasets_dir / "raw" / "reviews_raw_labeled.csv"
        if not raw_path.exists():
            return {}

        author_names: dict[str, str] = {}
        with raw_path.open("r", encoding="utf-8-sig", newline="") as handle:
            reader = csv.DictReader(handle)
            for row in reader:
                external_id = row.get("external_id")
                author_name = row.get("author_name")
                if external_id and author_name:
                    author_names[external_id] = author_name
        return author_names

    @staticmethod
    def _with_author_name(
        row: dict[str, str],
        author_names: dict[str, str],
    ) -> dict[str, str]:
        if row.get("author_name") or not row.get("external_id"):
            return row
        author_name = author_names.get(str(row["external_id"]))
        if not author_name:
            return row
        return {**row, "author_name": author_name}

    def _display_path(self, path: Path) -> str:
        try:
            return str(path.relative_to(self.datasets_dir.parent))
        except ValueError:
            return str(path)

    @staticmethod
    def _safe_int(value: Any) -> int | None:
        try:
            return int(value)
        except (TypeError, ValueError):
            return None

    @classmethod
    def _word_count(cls, row: dict[str, str]) -> int:
        existing = cls._safe_int(row.get("word_count") or row.get("content_word_count"))
        if existing is not None:
            return existing
        content = row.get("content") or row.get("text") or ""
        return len([word for word in content.split() if word.strip()])

    @staticmethod
    def _first_non_empty(row: dict[str, str], keys: tuple[str, ...]) -> str | None:
        for key in keys:
            value = row.get(key)
            if value:
                return value
        return None

    @staticmethod
    def _first_value(payload: Any, key: str, fallback: Any) -> Any:
        if isinstance(payload, dict) and payload.get(key) is not None:
            return payload[key]
        return fallback

    @staticmethod
    def _sum_distribution_counts(payload: Any) -> int | None:
        if not isinstance(payload, list):
            return None
        total = 0
        for item in payload:
            if isinstance(item, dict) and isinstance(item.get("count"), int):
                total += item["count"]
        return total or None

    @staticmethod
    def _normalise_distribution(primary: Any, fallback: Any, key_field: str) -> dict[str, int]:
        if isinstance(primary, dict):
            return {str(key): value for key, value in primary.items()}
        if isinstance(fallback, dict):
            return {str(key): value for key, value in fallback.items()}
        if isinstance(fallback, list):
            result = {}
            for item in fallback:
                if not isinstance(item, dict):
                    continue
                label = item.get(key_field) or item.get("rating") or item.get("sentiment") or item.get("label")
                count = item.get("count")
                if label is not None and count is not None:
                    result[str(label)] = count
            return result
        return {}

    @staticmethod
    def _app_metadata(app_info: Any, scraping_summary: Any) -> dict[str, Any]:
        app_info = app_info if isinstance(app_info, dict) else {}
        scraping_summary = scraping_summary if isinstance(scraping_summary, dict) else {}
        return {
            "app_id": app_info.get("appId") or scraping_summary.get("app_id"),
            "title": app_info.get("title") or scraping_summary.get("app_title"),
            "developer": app_info.get("developer"),
            "genre": app_info.get("genre"),
            "score": app_info.get("score"),
            "ratings": app_info.get("ratings"),
            "installs": app_info.get("installs"),
            "source_name": scraping_summary.get("source_name"),
        }

    @staticmethod
    def _target_quota(scraping_summary: Any, quota_achievement: Any) -> dict[str, int]:
        if isinstance(quota_achievement, list):
            return {
                str(item.get("rating")): item.get("target_count")
                for item in quota_achievement
                if isinstance(item, dict) and item.get("target_count") is not None
            }
        if isinstance(scraping_summary, dict):
            return scraping_summary.get("quota_per_rating", {})
        return {}

    @staticmethod
    def _general_fallback_limitation(payload: Any) -> dict[str, Any]:
        if not isinstance(payload, dict):
            return {
                "note": "General fallback labels are weak-label coverage gaps and are not final AHP/Fuzzy AHP criteria.",
            }
        return {
            "general_rows": payload.get("general_rows"),
            "general_percentage": payload.get("general_percentage"),
            "methodology_note": payload.get("methodology_note"),
            "note": "General fallback labels are weak-label coverage gaps and are not final AHP/Fuzzy AHP criteria.",
        }
