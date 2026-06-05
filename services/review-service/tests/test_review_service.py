import csv
import json
from pathlib import Path

from app.core.config import Settings
from app.services.research_data_service import ResearchDataService


def make_service(tmp_path: Path) -> ResearchDataService:
    datasets_dir = tmp_path / "datasets"
    docs_dir = tmp_path / "docs"
    datasets_dir.mkdir()
    docs_dir.mkdir()
    return ResearchDataService(Settings(datasets_dir=datasets_dir, docs_dir=docs_dir))


def write_json(path: Path, payload) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload), encoding="utf-8")


def write_reviews(path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(
            handle,
            fieldnames=[
                "external_id",
                "rating",
                "content",
                "initial_sentiment",
                "final_sentiment",
                "reviewed_at",
                "source",
                "author_name",
            ],
        )
        writer.writeheader()
        for index in range(1, 7):
            writer.writerow(
                {
                    "external_id": f"review-{index}",
                    "rating": 5 if index % 2 == 0 else 1,
                    "content": f"review content {index}",
                    "initial_sentiment": "Positive" if index % 2 == 0 else "Negative",
                    "final_sentiment": "Positive" if index % 2 == 0 else "Negative",
                    "reviewed_at": "2026-05-01T00:00:00",
                    "source": "fixture",
                    "author_name": "should not be returned",
                }
            )


def test_dataset_summary_should_handle_missing_files_gracefully(tmp_path: Path) -> None:
    service = make_service(tmp_path)

    summary = service.dataset_summary()

    assert summary["dataset_availability"]["datasets_dir_exists"] is True
    assert summary["total_review_count"] is None
    assert summary["warnings"]


def test_scraping_summary_should_read_fixture_files(tmp_path: Path) -> None:
    service = make_service(tmp_path)
    write_json(
        service.datasets_dir / "raw" / "data_acquisition_summary.json",
        {
            "total_rows": 10,
            "rows_per_rating": {"1": 5, "5": 5},
            "rating_3_limitation_note": "limited",
        },
    )
    write_json(
        service.datasets_dir / "outputs" / "eda" / "01_data_acquisition" / "scraping_quota_achievement.json",
        [
            {"rating": 1, "target_count": 5, "actual_count": 5},
            {"rating": 5, "target_count": 5, "actual_count": 5},
        ],
    )

    summary = service.scraping_summary()

    assert summary["total_achieved_rows"] == 10
    assert summary["target_quota_per_rating"] == {"1": 5, "5": 5}
    assert summary["rating_3_limitation_note"] == "limited"


def test_preprocessing_summary_should_read_fixture_files(tmp_path: Path) -> None:
    service = make_service(tmp_path)
    preprocessing_dir = service.datasets_dir / "outputs" / "eda" / "02_preprocessing"
    write_json(preprocessing_dir / "preprocessing_summary.json", {"total_rows": 10})
    write_json(
        preprocessing_dir / "relabeling_summary.json",
        {
            "changed_label_count": 2,
            "changed_label_percentage": 20.0,
            "label_distribution_before": {"Neutral": 10},
            "label_distribution_after": {"Positive": 2, "Neutral": 8},
        },
    )

    summary = service.preprocessing_summary()

    assert summary["total_rows"] == 10
    assert summary["relabeling_changes"]["changed_label_count"] == 2
    assert summary["sentiment_distribution_after"] == {"Positive": 2, "Neutral": 8}


def test_random_reviews_should_filter_and_sample_deterministically(tmp_path: Path) -> None:
    service = make_service(tmp_path)
    write_reviews(service.datasets_dir / "processed" / "reviews_final.csv")

    first = service.random_reviews(limit=2, sentiment="Positive", rating=5, seed=42)
    second = service.random_reviews(limit=2, sentiment="Positive", rating=5, seed=42)

    assert first.count == 2
    assert [review.external_id for review in first.reviews] == [
        review.external_id for review in second.reviews
    ]
    assert all(review.rating == 5 for review in first.reviews)
    assert all(review.final_sentiment == "Positive" for review in first.reviews)


def test_random_reviews_should_clamp_limit_and_not_expose_author(tmp_path: Path) -> None:
    service = make_service(tmp_path)
    write_reviews(service.datasets_dir / "processed" / "reviews_final.csv")

    result = service.random_reviews(limit=100, seed=1)
    dumped_review = result.reviews[0].model_dump()

    assert result.filters.applied_limit == 50
    assert result.count == 6
    assert "author_name" not in dumped_review
    assert result.warnings
