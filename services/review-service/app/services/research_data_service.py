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
        canonical = self._canonical_dataset_stats(warnings)
        noise = self._noise_report_stats(warnings)

        acquisition_summary = self._read_json(raw_dir / "data_acquisition_summary.json", warnings)
        scraping_summary = self._read_json(raw_dir / "scraping_summary.json", warnings)
        app_info = self._read_json(raw_dir / "app_info_spotify.json", warnings)
        missing_values = self._read_json(acquisition_dir / "missing_value_summary.json", warnings)
        text_length_summary = self._read_json(
            eda_dir / "03_indobert" / "indobert_text_length_summary.json",
            warnings,
        )

        return {
            "data_status": "canonical_processed" if canonical["available"] else "unavailable",
            "total_review_count": canonical["row_count"],
            "raw_review_count": self._first_value(acquisition_summary, "total_rows", None),
            "dropped_review_count": noise["row_count"],
            "rating_distribution": canonical["rating_distribution"],
            "sentiment_distribution": canonical["sentiment_distribution"],
            "source_application": self._app_metadata(app_info, scraping_summary),
            "review_period": {
                "reviewed_at_min": canonical["reviewed_at_min"],
                "reviewed_at_max": canonical["reviewed_at_max"],
            },
            "yearly_counts": canonical["yearly_counts"],
            "yearly_sentiment_counts": canonical["yearly_sentiment_counts"],
            "missing_value_summary": missing_values,
            "text_length_summary": text_length_summary,
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
            "app_id": self._first_value(scraping_summary, "app_id", None),
            "source_name": self._first_value(scraping_summary, "source_name", None),
            "app_title": scraping_summary.get("app_title") if isinstance(scraping_summary, dict) else None,
            "country": scraping_summary.get("country") if isinstance(scraping_summary, dict) else None,
            "lang": scraping_summary.get("lang") if isinstance(scraping_summary, dict) else None,
            "target_quota_per_rating": self._target_quota(scraping_summary, quota_achievement),
            "achieved_count_per_rating": achieved_by_rating,
            "total_achieved_rows": self._first_value(
                acquisition_summary,
                "total_rows",
                (
                    sum(value for value in achieved_by_rating.values() if isinstance(value, int))
                    if achieved_by_rating
                    else None
                ),
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
        canonical = self._canonical_dataset_stats(warnings)
        noise = self._noise_report_stats(warnings)

        relabeling_summary = self._read_json(preprocessing_dir / "relabeling_summary.json", warnings)
        before_distribution = self._read_json(
            preprocessing_dir / "label_distribution_before_relabeling.json",
            warnings,
        )
        aspect_summary = self._read_json(preprocessing_dir / "aspect_labeling_summary.json", warnings)
        refined_aspect_summary = self._read_json(
            preprocessing_dir / "aspect_labeling_refined_summary.json",
            warnings,
        )
        general_fallback = self._read_json(
            preprocessing_dir / "general_fallback_analysis.json",
            warnings,
        )
        text_cleaning = self._read_json(
            self.datasets_dir
            / "outputs"
            / "eda"
            / "03_indobert"
            / "indobert_text_length_summary.json",
            warnings,
        )

        input_review_count = None
        if canonical["row_count"] is not None and noise["row_count"] is not None:
            input_review_count = canonical["row_count"] + noise["row_count"]

        rating_after = canonical["rating_distribution"]
        rating_before = self._merge_distributions(
            rating_after,
            noise.get("rating_distribution", {}),
        )

        return {
            "data_status": "canonical_processed" if canonical["available"] else "unavailable",
            "total_rows": canonical["row_count"],
            "input_review_count": input_review_count,
            "valid_review_count": canonical["row_count"],
            "dropped_review_count": noise["row_count"],
            "drop_reason_distribution": noise["drop_reason_distribution"],
            "quality_stage_distribution": noise["quality_stage_distribution"],
            "rating_distribution_before": rating_before,
            "rating_distribution_after": rating_after,
            "preprocessing_samples": self._preprocessing_samples(warnings),
            "model_split_summary": self._model_split_summary(warnings),
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
            "sentiment_distribution_after": canonical["sentiment_distribution"],
            "text_cleaning_summary": text_cleaning,
            "aspect_weak_label_summary": refined_aspect_summary or aspect_summary,
            "aspect_data_status": "needs_verification",
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

        aspect_labels = self._aspect_labels_by_external_id(warnings)
        rows = [
            {**row, **aspect_labels.get(str(row.get("external_id") or ""), {})}
            for row in rows
        ]

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

        dataset_path = self._random_reviews_path(warnings)
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
        aspect_labels = self._aspect_labels_by_external_id(warnings)
        rows = [
            {**row, **aspect_labels.get(str(row.get("external_id") or ""), {})}
            for row in rows
        ]
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
            self._append_warning(warnings, "Some research summary data is unavailable.")
            return {} if path.suffix.lower() == ".json" else None
        try:
            return json.loads(path.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError):
            self._append_warning(warnings, "Some research summary data could not be read.")
            return {}

    def _random_reviews_path(self, warnings: list[str]) -> Path | None:
        preferred = self.datasets_dir / "processed" / "dataset_spotify_processed.csv"
        fallback = self.datasets_dir / "raw" / "reviews_raw_labeled.csv"
        if preferred.exists():
            return preferred
        if fallback.exists():
            self._append_warning(
                warnings,
                "Canonical processed reviews are unavailable; raw review fallback is used.",
            )
            return fallback
        self._append_warning(warnings, "Review samples are unavailable.")
        return None

    def _aspect_labels_by_external_id(
        self,
        warnings: list[str],
    ) -> dict[str, dict[str, str]]:
        candidates = [
            self.datasets_dir / "processed" / "reviews_with_aspect_labels_refined.csv",
            self.datasets_dir / "processed" / "reviews_with_aspect_labels.csv",
        ]
        for path in candidates:
            if not path.exists():
                continue
            labels: dict[str, dict[str, str]] = {}
            with path.open("r", encoding="utf-8-sig", newline="") as handle:
                for row in csv.DictReader(handle):
                    external_id = row.get("external_id")
                    aspect_label = row.get("aspect_label")
                    if not external_id or not aspect_label:
                        continue
                    labels[external_id] = {
                        "aspect_label": aspect_label,
                        "aspect_label_confidence": row.get("aspect_label_confidence") or "",
                    }
            if labels:
                self._append_warning(
                    warnings,
                    "Aspect labels use historical weak-label data and need verification.",
                )
            return labels
        self._append_warning(warnings, "Aspect labels are unavailable for review samples.")
        return {}

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
            aspect_label_confidence=row.get("aspect_label_confidence") or None,
            aspect_data_status="needs_verification" if row.get("aspect_label") else None,
            cleaned_text=row.get("cleaned_text") or None,
            text_indobert=row.get("text_indobert") or None,
            text_svm=row.get("text_svm") or None,
            preprocessing_status=row.get("preprocessing_status") or None,
            drop_reason=row.get("drop_reason") or None,
            text_length_before=self._safe_int(row.get("text_length_before")),
            text_length_after=self._safe_int(row.get("text_length_after")),
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

    def _canonical_dataset_stats(self, warnings: list[str]) -> dict[str, Any]:
        path = self.datasets_dir / "processed" / "dataset_spotify_processed.csv"
        empty = {
            "available": False,
            "row_count": None,
            "rating_distribution": {},
            "sentiment_distribution": {},
            "reviewed_at_min": None,
            "reviewed_at_max": None,
            "yearly_counts": {},
            "yearly_sentiment_counts": {},
        }
        if not path.exists():
            self._append_warning(warnings, "Canonical processed dataset is unavailable.")
            return empty

        row_count = 0
        rating_distribution: dict[str, int] = {}
        sentiment_distribution: dict[str, int] = {}
        yearly_counts: dict[str, int] = {}
        yearly_sentiment_counts: dict[str, dict[str, int]] = {}
        reviewed_at_min: str | None = None
        reviewed_at_max: str | None = None
        try:
            with path.open("r", encoding="utf-8-sig", newline="") as handle:
                for row in csv.DictReader(handle):
                    row_count += 1
                    rating = str(row.get("rating") or "").strip()
                    sentiment = str(
                        row.get("final_sentiment") or row.get("initial_sentiment") or ""
                    ).strip()
                    reviewed_at = str(row.get("reviewed_at") or "").strip()
                    if rating:
                        rating_distribution[rating] = rating_distribution.get(rating, 0) + 1
                    if sentiment:
                        sentiment_distribution[sentiment] = (
                            sentiment_distribution.get(sentiment, 0) + 1
                        )
                    if reviewed_at:
                        reviewed_at_min = min(reviewed_at_min, reviewed_at) if reviewed_at_min else reviewed_at
                        reviewed_at_max = max(reviewed_at_max, reviewed_at) if reviewed_at_max else reviewed_at
                        year = reviewed_at[:4]
                        if year.isdigit():
                            yearly_counts[year] = yearly_counts.get(year, 0) + 1
                            if sentiment:
                                year_sent = yearly_sentiment_counts.setdefault(year, {})
                                year_sent[sentiment] = year_sent.get(sentiment, 0) + 1
        except OSError:
            self._append_warning(warnings, "Canonical processed dataset could not be read.")
            return empty

        return {
            "available": True,
            "row_count": row_count,
            "rating_distribution": rating_distribution,
            "sentiment_distribution": sentiment_distribution,
            "reviewed_at_min": reviewed_at_min,
            "reviewed_at_max": reviewed_at_max,
            "yearly_counts": yearly_counts,
            "yearly_sentiment_counts": yearly_sentiment_counts,
        }

    def _noise_report_stats(self, warnings: list[str]) -> dict[str, Any]:
        path = self.datasets_dir / "processed" / "dataset_spotify_noise_report.csv"
        empty = {
            "row_count": None,
            "drop_reason_distribution": {},
            "quality_stage_distribution": {},
            "rating_distribution": {},
        }
        if not path.exists():
            self._append_warning(warnings, "Dataset quality report is unavailable.")
            return empty

        row_count = 0
        drop_reasons: dict[str, int] = {}
        quality_stages: dict[str, int] = {}
        rating_distribution: dict[str, int] = {}
        try:
            with path.open("r", encoding="utf-8-sig", newline="") as handle:
                for row in csv.DictReader(handle):
                    row_count += 1
                    drop_reason = str(row.get("drop_reason") or "unknown").strip()
                    quality_stage = str(row.get("quality_stage") or "unknown").strip()
                    rating = str(row.get("rating") or "").strip()
                    drop_reasons[drop_reason] = drop_reasons.get(drop_reason, 0) + 1
                    quality_stages[quality_stage] = quality_stages.get(quality_stage, 0) + 1
                    if rating:
                        rating_distribution[rating] = rating_distribution.get(rating, 0) + 1
        except OSError:
            self._append_warning(warnings, "Dataset quality report could not be read.")
            return empty

        return {
            "row_count": row_count,
            "drop_reason_distribution": drop_reasons,
            "quality_stage_distribution": quality_stages,
            "rating_distribution": rating_distribution,
        }

    def _preprocessing_samples(self, warnings: list[str], limit_per_status: int = 5) -> list[dict[str, Any]]:
        processed_path = self.datasets_dir / "processed" / "dataset_spotify_processed.csv"
        noise_path = self.datasets_dir / "processed" / "dataset_spotify_noise_report.csv"
        samples: list[dict[str, Any]] = []

        samples.extend(self._sample_preprocessing_rows(processed_path, "valid", limit_per_status, warnings))
        samples.extend(self._sample_preprocessing_rows(noise_path, "dropped", limit_per_status, warnings))
        return samples

    def _sample_preprocessing_rows(
        self,
        path: Path,
        status: str,
        limit: int,
        warnings: list[str],
    ) -> list[dict[str, Any]]:
        if not path.exists():
            self._append_warning(warnings, "Preprocessing sample data is unavailable.")
            return []

        rows: list[dict[str, Any]] = []
        try:
            with path.open("r", encoding="utf-8-sig", newline="") as handle:
                for row in csv.DictReader(handle):
                    rows.append(
                        {
                            "external_id": row.get("external_id") or None,
                            "rating": self._safe_int(row.get("rating")),
                            "original_text": self._first_non_empty(
                                row,
                                ("original_text", "content", "text", "text_indobert", "text_svm"),
                            ),
                            "cleaned_text": self._first_non_empty(
                                row,
                                ("cleaned_text", "text_indobert", "text_svm"),
                            ),
                            "status": status,
                            "drop_reason": None if status == "valid" else row.get("drop_reason") or None,
                        }
                    )
                    if len(rows) >= limit:
                        break
        except OSError:
            self._append_warning(warnings, "Preprocessing sample data could not be read.")
        return rows

    def _model_split_summary(self, warnings: list[str]) -> dict[str, Any]:
        return {
            "indobert": self._indobert_split_summary(warnings),
            "svm": self._svm_split_summary(warnings),
        }

    def _indobert_split_summary(self, warnings: list[str]) -> dict[str, Any]:
        split_dir = self.datasets_dir / "processed" / "indobert"
        splits = {
            "train": self._csv_row_count(split_dir / "train.csv", warnings),
            "validation": self._csv_row_count(split_dir / "validation.csv", warnings),
            "test": self._csv_row_count(split_dir / "test.csv", warnings),
        }
        return {"splits": splits, "total": sum(value for value in splits.values() if value is not None)}

    def _svm_split_summary(self, warnings: list[str]) -> dict[str, Any]:
        path = self.datasets_dir / "outputs" / "eda" / "04_svm" / "svm_merged_5class_split_distribution.json"
        payload = self._read_json(path, warnings)
        splits = {"train": 0, "validation": 0, "test": 0}
        labels: dict[str, dict[str, int]] = {}
        if isinstance(payload, list):
            for item in payload:
                if not isinstance(item, dict):
                    continue
                split = str(item.get("split") or "")
                label = str(item.get("label") or "")
                count = self._safe_int(item.get("count")) or 0
                if split in splits:
                    splits[split] += count
                    if label:
                        label_counts = labels.setdefault(label, {})
                        label_counts[split] = label_counts.get(split, 0) + count
        return {"scenario": "merged_5class", "splits": splits, "total": sum(splits.values()), "labels": labels}

    def _csv_row_count(self, path: Path, warnings: list[str]) -> int | None:
        if not path.exists():
            self._append_warning(warnings, "Model split data is unavailable.")
            return None
        try:
            with path.open("r", encoding="utf-8-sig", newline="") as handle:
                return max(sum(1 for _ in handle) - 1, 0)
        except OSError:
            self._append_warning(warnings, "Model split data could not be read.")
            return None

    @staticmethod
    def _merge_distributions(
        first: dict[str, int],
        second: dict[str, int],
    ) -> dict[str, int]:
        merged = {str(key): value for key, value in first.items()}
        for key, value in second.items():
            merged[str(key)] = merged.get(str(key), 0) + value
        return merged

    @staticmethod
    def _append_warning(warnings: list[str], message: str) -> None:
        if message not in warnings:
            warnings.append(message)

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
