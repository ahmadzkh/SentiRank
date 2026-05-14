"""Label, merge, validate, and summarize raw Google Play reviews."""

from __future__ import annotations

import argparse
import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import matplotlib
import matplotlib.dates as mdates
import pandas as pd

matplotlib.use("Agg")
import matplotlib.pyplot as plt

SENTIMENT_BY_RATING = {
    1: "Negative",
    2: "Negative",
    3: "Neutral",
    4: "Positive",
    5: "Positive",
}

TARGET_QUOTA_PER_RATING = {
    1: 20_000,
    2: 15_000,
    3: 30_000,
    4: 15_000,
    5: 20_000,
}

RAW_REVIEW_COLUMNS = [
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
    "initial_sentiment",
]

DEFAULT_FIGURES_DIR = Path("../docs/figures/01_data_acquisition")
DEFAULT_METRICS_DIR = Path("../datasets/outputs/eda/01_data_acquisition")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=(
            "Merge raw per-rating Google Play reviews, add initial sentiment "
            "labels, validate acquisition quality, and export Phase 6D EDA figures."
        )
    )
    parser.add_argument("--input-dir", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--summary-output", type=Path, default=None)
    parser.add_argument("--figures-dir", type=Path, default=DEFAULT_FIGURES_DIR)
    parser.add_argument("--metrics-dir", type=Path, default=DEFAULT_METRICS_DIR)
    parser.add_argument("--rating-column", default="rating")
    parser.add_argument("--label-column", default="initial_sentiment")

    return parser.parse_args()


def label_from_rating(rating: object) -> str:
    try:
        rating_value = int(rating)
    except (TypeError, ValueError) as error:
        raise ValueError(f"Invalid rating value: {rating!r}") from error

    if rating_value not in SENTIMENT_BY_RATING:
        raise ValueError(f"Rating must be between 1 and 5: {rating_value}")

    return SENTIMENT_BY_RATING[rating_value]


def load_raw_rating_files(input_dir: Path) -> pd.DataFrame:
    frames = []

    for rating in sorted(TARGET_QUOTA_PER_RATING):
        input_path = input_dir / f"reviews_rating_{rating}_raw.csv"

        if not input_path.is_file():
            raise FileNotFoundError(f"Missing raw rating file: {input_path}")

        frame = pd.read_csv(input_path)
        frames.append(frame)

    if not frames:
        raise ValueError(f"No raw rating files found in {input_dir}")

    return pd.concat(frames, ignore_index=True)


def apply_initial_labels(
    dataframe: pd.DataFrame,
    rating_column: str,
    label_column: str,
) -> pd.DataFrame:
    if rating_column not in dataframe.columns:
        raise ValueError(f"Missing required rating column: {rating_column}")

    labeled_dataframe = dataframe.copy()
    labeled_dataframe[label_column] = labeled_dataframe[rating_column].map(
        label_from_rating
    )

    return labeled_dataframe


def select_output_columns(dataframe: pd.DataFrame, label_column: str) -> pd.DataFrame:
    expected_columns = [
        column if column != "initial_sentiment" else label_column
        for column in RAW_REVIEW_COLUMNS
    ]
    ordered_columns = [column for column in expected_columns if column in dataframe]
    extra_columns = [
        column for column in dataframe.columns if column not in ordered_columns
    ]

    return dataframe[ordered_columns + extra_columns]


def build_summary(
    dataframe: pd.DataFrame,
    rating_column: str,
    label_column: str,
) -> dict[str, Any]:
    text_lengths = dataframe["content"].fillna("").astype(str).str.len()
    reviewed_at = pd.to_datetime(dataframe.get("reviewed_at"), errors="coerce")
    rating_counts = count_series_values(dataframe[rating_column])
    sentiment_counts = count_series_values(dataframe[label_column])
    rating_3_count = int(rating_counts.get("3", 0))

    return {
        "total_rows": int(len(dataframe)),
        "rows_per_rating": rating_counts,
        "rows_per_initial_sentiment": sentiment_counts,
        "duplicate_external_id_count": count_duplicate_external_ids(dataframe),
        "missing_content_count": int(dataframe["content"].isna().sum()),
        "missing_rating_count": int(dataframe[rating_column].isna().sum()),
        "text_length_min": int(text_lengths.min()),
        "text_length_median": float(text_lengths.median()),
        "text_length_mean": float(text_lengths.mean()),
        "text_length_max": int(text_lengths.max()),
        "reviewed_at_min": format_timestamp(reviewed_at.min()),
        "reviewed_at_max": format_timestamp(reviewed_at.max()),
        "rating_3_limitation_note": build_rating_3_limitation_note(rating_3_count),
        "generated_at": datetime.now(timezone.utc).isoformat(),
    }


def count_series_values(series: pd.Series) -> dict[str, int]:
    return {
        str(key): int(value)
        for key, value in series.value_counts().sort_index().items()
    }


def count_duplicate_external_ids(dataframe: pd.DataFrame) -> int:
    if "external_id" not in dataframe.columns:
        return 0

    return int(dataframe["external_id"].duplicated().sum())


def build_rating_3_limitation_note(rating_3_count: int) -> str | None:
    target_count = TARGET_QUOTA_PER_RATING[3]

    if rating_3_count >= target_count:
        return None

    return (
        f"Rating 3 target was {target_count:,} reviews, but only "
        f"{rating_3_count:,} were available. Dataset balancing is deferred to "
        "preprocessing and training."
    )


def format_timestamp(value: object) -> str | None:
    if pd.isna(value):
        return None

    if hasattr(value, "isoformat"):
        return value.isoformat()

    return str(value)


def save_labeled_dataset(dataframe: pd.DataFrame, output_path: Path) -> None:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    dataframe.to_csv(output_path, index=False)


def save_summary(summary: dict[str, Any], output_path: Path) -> None:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(
        json.dumps(summary, indent=2, sort_keys=True),
        encoding="utf-8",
    )


def generate_figures(
    dataframe: pd.DataFrame,
    summary: dict[str, Any],
    figures_dir: Path,
    rating_column: str,
    label_column: str,
) -> list[Path]:
    figures_dir.mkdir(parents=True, exist_ok=True)
    generated_paths = [
        plot_rating_distribution(dataframe, figures_dir, rating_column),
        plot_sentiment_distribution(dataframe, figures_dir, label_column),
        plot_text_length_histogram(dataframe, figures_dir),
        plot_text_length_boxplot(dataframe, figures_dir),
        plot_temporal_distribution(dataframe, figures_dir, rating_column),
        plot_temporal_distribution_by_rating(dataframe, figures_dir, rating_column),
        plot_scraping_quota_achievement(dataframe, figures_dir, rating_column),
        plot_missing_value_summary(summary, figures_dir),
    ]

    return generated_paths


def generate_metric_outputs(
    dataframe: pd.DataFrame,
    metrics_dir: Path,
    rating_column: str,
    label_column: str,
) -> list[Path]:
    metrics_dir.mkdir(parents=True, exist_ok=True)

    rating_distribution = build_rating_distribution(dataframe, rating_column)
    sentiment_distribution = build_sentiment_distribution(dataframe, label_column)
    text_length_histogram = build_text_length_histogram(dataframe)
    temporal_distribution = build_temporal_distribution_monthly(
        dataframe,
        rating_column,
    )
    temporal_distribution_by_rating = build_temporal_distribution_monthly_by_rating(
        dataframe,
        rating_column,
    )
    quota_achievement = build_scraping_quota_achievement(dataframe, rating_column)
    missing_value_summary = build_missing_value_summary(dataframe, rating_column)

    generated_paths = []
    generated_paths.extend(
        save_dataframe_metric(
            rating_distribution,
            metrics_dir / "rating_distribution_raw.csv",
            metrics_dir / "rating_distribution_raw.json",
        )
    )
    generated_paths.extend(
        save_dataframe_metric(
            sentiment_distribution,
            metrics_dir / "sentiment_distribution_raw.csv",
            metrics_dir / "sentiment_distribution_raw.json",
        )
    )
    generated_paths.append(
        save_json_metric(
            build_text_length_summary(dataframe),
            metrics_dir / "text_length_summary_raw.json",
        )
    )
    generated_paths.append(
        save_dataframe_csv(
            text_length_histogram,
            metrics_dir / "text_length_histogram_raw.csv",
        )
    )
    generated_paths.extend(
        save_dataframe_metric(
            temporal_distribution,
            metrics_dir / "temporal_distribution_monthly_raw.csv",
            metrics_dir / "temporal_distribution_monthly_raw.json",
        )
    )
    generated_paths.extend(
        save_dataframe_metric(
            temporal_distribution_by_rating,
            metrics_dir / "temporal_distribution_monthly_by_rating.csv",
            metrics_dir / "temporal_distribution_monthly_by_rating.json",
        )
    )
    generated_paths.extend(
        save_dataframe_metric(
            quota_achievement,
            metrics_dir / "scraping_quota_achievement.csv",
            metrics_dir / "scraping_quota_achievement.json",
        )
    )
    generated_paths.extend(
        save_dataframe_metric(
            missing_value_summary,
            metrics_dir / "missing_value_summary.csv",
            metrics_dir / "missing_value_summary.json",
        )
    )

    return generated_paths


def build_rating_distribution(
    dataframe: pd.DataFrame,
    rating_column: str,
) -> pd.DataFrame:
    counts = dataframe[rating_column].value_counts().sort_index()

    return pd.DataFrame(
        {
            "rating": [int(rating) for rating in counts.index],
            "count": [int(count) for count in counts.values],
        }
    )


def build_sentiment_distribution(
    dataframe: pd.DataFrame,
    label_column: str,
) -> pd.DataFrame:
    order = ["Negative", "Neutral", "Positive"]
    counts = dataframe[label_column].value_counts().reindex(order, fill_value=0)

    return pd.DataFrame(
        {
            "initial_sentiment": list(counts.index),
            "count": [int(count) for count in counts.values],
        }
    )


def build_text_length_summary(dataframe: pd.DataFrame) -> dict[str, int | float]:
    text_lengths = get_text_lengths(dataframe)

    return {
        "count": int(text_lengths.count()),
        "min": int(text_lengths.min()),
        "median": float(text_lengths.median()),
        "mean": float(text_lengths.mean()),
        "max": int(text_lengths.max()),
    }


def build_text_length_histogram(
    dataframe: pd.DataFrame,
    bins: int = 40,
) -> pd.DataFrame:
    text_lengths = get_text_lengths(dataframe)
    bucket_counts = pd.cut(
        text_lengths,
        bins=bins,
        include_lowest=True,
    ).value_counts(sort=False)

    return pd.DataFrame(
        {
            "bin_start": [
                float(interval.left) for interval in bucket_counts.index
            ],
            "bin_end": [float(interval.right) for interval in bucket_counts.index],
            "count": [int(count) for count in bucket_counts.values],
        }
    )


def build_temporal_distribution_monthly(
    dataframe: pd.DataFrame,
    rating_column: str,
) -> pd.DataFrame:
    by_rating = build_temporal_distribution_monthly_by_rating(
        dataframe,
        rating_column,
    )

    return by_rating[["review_month", "total"]].copy()


def build_temporal_distribution_monthly_by_rating(
    dataframe: pd.DataFrame,
    rating_column: str,
) -> pd.DataFrame:
    ratings = sorted(TARGET_QUOTA_PER_RATING)
    columns = ["review_month", *[f"rating_{rating}" for rating in ratings], "total"]

    if "reviewed_at" not in dataframe.columns or rating_column not in dataframe.columns:
        return pd.DataFrame(columns=columns)

    working = pd.DataFrame(
        {
            "reviewed_at": pd.to_datetime(
                dataframe["reviewed_at"],
                errors="coerce",
            ),
            "rating": pd.to_numeric(dataframe[rating_column], errors="coerce"),
        }
    )
    working = working.dropna(subset=["reviewed_at", "rating"])
    working["rating"] = working["rating"].astype(int)
    working = working[working["rating"].isin(ratings)]

    if working.empty:
        return pd.DataFrame(columns=columns)

    working["review_month"] = working["reviewed_at"].dt.to_period("M")
    counts = (
        working.groupby(["review_month", "rating"])
        .size()
        .unstack(fill_value=0)
        .sort_index()
    )

    full_index = pd.period_range(
        start=counts.index.min(),
        end=counts.index.max(),
        freq="M",
    )
    counts = counts.reindex(full_index, fill_value=0)

    for rating in ratings:
        if rating not in counts.columns:
            counts[rating] = 0

    counts = counts[ratings]
    result = counts.reset_index()
    result = result.rename(columns={"index": "review_month"})
    result["review_month"] = result["review_month"].astype(str)

    for rating in ratings:
        result[f"rating_{rating}"] = result[rating].astype(int)

    rating_columns = [f"rating_{rating}" for rating in ratings]
    result["total"] = result[rating_columns].sum(axis=1).astype(int)

    return result[columns]


def build_scraping_quota_achievement(
    dataframe: pd.DataFrame,
    rating_column: str,
) -> pd.DataFrame:
    actual_counts = dataframe[rating_column].value_counts().to_dict()
    rows = []

    for rating, target_count in sorted(TARGET_QUOTA_PER_RATING.items()):
        actual_count = int(actual_counts.get(rating, 0))
        rows.append(
            {
                "rating": rating,
                "target_count": target_count,
                "actual_count": actual_count,
                "achievement_rate": round(actual_count / target_count, 6),
            }
        )

    return pd.DataFrame(rows)


def build_missing_value_summary(
    dataframe: pd.DataFrame,
    rating_column: str,
) -> pd.DataFrame:
    candidate_fields = ["external_id", rating_column, "content", "reviewed_at"]
    fields = [field for field in candidate_fields if field in dataframe.columns]

    return pd.DataFrame(
        {
            "field": fields,
            "missing_count": [
                int(dataframe[field].isna().sum()) for field in fields
            ],
        }
    )


def get_text_lengths(dataframe: pd.DataFrame) -> pd.Series:
    return dataframe["content"].fillna("").astype(str).str.len()


def save_dataframe_metric(
    dataframe: pd.DataFrame,
    csv_path: Path,
    json_path: Path,
) -> list[Path]:
    save_dataframe_csv(dataframe, csv_path)
    json_path.write_text(
        json.dumps(
            json.loads(dataframe.to_json(orient="records")),
            indent=2,
        ),
        encoding="utf-8",
    )

    return [csv_path, json_path]


def save_dataframe_csv(dataframe: pd.DataFrame, output_path: Path) -> Path:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    dataframe.to_csv(output_path, index=False)

    return output_path


def save_json_metric(data: dict[str, int | float], output_path: Path) -> Path:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(
        json.dumps(data, indent=2, sort_keys=True),
        encoding="utf-8",
    )

    return output_path


def plot_rating_distribution(
    dataframe: pd.DataFrame,
    figures_dir: Path,
    rating_column: str,
) -> Path:
    counts = dataframe[rating_column].value_counts().sort_index()
    path = figures_dir / "rating_distribution_raw.png"
    create_bar_figure(
        labels=[str(label) for label in counts.index],
        values=[int(value) for value in counts.values],
        title="Raw Review Distribution by Rating",
        xlabel="Rating",
        ylabel="Review Count",
        output_path=path,
    )

    return path


def plot_sentiment_distribution(
    dataframe: pd.DataFrame,
    figures_dir: Path,
    label_column: str,
) -> Path:
    order = ["Negative", "Neutral", "Positive"]
    counts = dataframe[label_column].value_counts().reindex(order, fill_value=0)
    path = figures_dir / "sentiment_distribution_raw.png"
    create_bar_figure(
        labels=list(counts.index),
        values=[int(value) for value in counts.values],
        title="Initial Sentiment Distribution",
        xlabel="Initial Sentiment",
        ylabel="Review Count",
        output_path=path,
    )

    return path


def plot_text_length_histogram(dataframe: pd.DataFrame, figures_dir: Path) -> Path:
    text_lengths = get_text_lengths(dataframe)
    path = figures_dir / "text_length_histogram_raw.png"

    plt.figure(figsize=(8, 5))
    plt.hist(text_lengths, bins=40, color="#2f6f9f", edgecolor="white")
    plt.title("Raw Review Text Length Histogram")
    plt.xlabel("Character Count")
    plt.ylabel("Review Count")
    plt.tight_layout()
    plt.savefig(path)
    plt.close()

    return path


def plot_text_length_boxplot(dataframe: pd.DataFrame, figures_dir: Path) -> Path:
    text_lengths = get_text_lengths(dataframe)
    path = figures_dir / "text_length_boxplot_raw.png"

    plt.figure(figsize=(8, 4))
    plt.boxplot(text_lengths, vert=False, patch_artist=True)
    plt.title("Raw Review Text Length Boxplot")
    plt.xlabel("Character Count")
    plt.tight_layout()
    plt.savefig(path)
    plt.close()

    return path


def plot_temporal_distribution(
    dataframe: pd.DataFrame,
    figures_dir: Path,
    rating_column: str,
) -> Path:
    monthly_counts = build_temporal_distribution_monthly(dataframe, rating_column)
    path = figures_dir / "temporal_distribution_raw.png"
    month_dates = pd.to_datetime(
        monthly_counts["review_month"] + "-01",
        errors="coerce",
    )

    plt.figure(figsize=(10, 5))
    plt.plot(
        month_dates,
        monthly_counts["total"],
        color="#2f6f9f",
        linewidth=1.6,
    )
    plt.title("Raw Review Temporal Distribution")
    plt.xlabel("Review Month")
    plt.ylabel("Review Count")
    configure_yearly_date_axis()
    plt.tight_layout()
    plt.savefig(path)
    plt.close()

    return path


def plot_temporal_distribution_by_rating(
    dataframe: pd.DataFrame,
    figures_dir: Path,
    rating_column: str,
) -> Path:
    monthly_counts = build_temporal_distribution_monthly_by_rating(
        dataframe,
        rating_column,
    )
    path = figures_dir / "temporal_distribution_by_rating_raw.png"
    month_dates = pd.to_datetime(
        monthly_counts["review_month"] + "-01",
        errors="coerce",
    )

    plt.figure(figsize=(11, 6))

    for rating in sorted(TARGET_QUOTA_PER_RATING):
        plt.plot(
            month_dates,
            monthly_counts[f"rating_{rating}"],
            linewidth=1.4,
            label=f"Rating {rating}",
        )

    plt.title("Raw Review Temporal Distribution by Rating")
    plt.xlabel("Review Month")
    plt.ylabel("Review Count")
    plt.legend(ncol=3)
    configure_yearly_date_axis()
    plt.tight_layout()
    plt.savefig(path)
    plt.close()

    return path


def configure_yearly_date_axis() -> None:
    axis = plt.gca()
    axis.xaxis.set_major_locator(mdates.YearLocator())
    axis.xaxis.set_major_formatter(mdates.DateFormatter("%Y"))
    plt.xticks(rotation=0)


def plot_scraping_quota_achievement(
    dataframe: pd.DataFrame,
    figures_dir: Path,
    rating_column: str,
) -> Path:
    ratings = sorted(TARGET_QUOTA_PER_RATING)
    actual_counts = dataframe[rating_column].value_counts().to_dict()
    path = figures_dir / "scraping_quota_achievement.png"

    x_positions = range(len(ratings))
    width = 0.35
    plt.figure(figsize=(8, 5))
    plt.bar(
        [position - width / 2 for position in x_positions],
        [TARGET_QUOTA_PER_RATING[rating] for rating in ratings],
        width=width,
        label="Target",
        color="#8c8c8c",
    )
    plt.bar(
        [position + width / 2 for position in x_positions],
        [int(actual_counts.get(rating, 0)) for rating in ratings],
        width=width,
        label="Actual",
        color="#2f6f9f",
    )
    plt.title("Scraping Quota Achievement")
    plt.xlabel("Rating")
    plt.ylabel("Review Count")
    plt.xticks(list(x_positions), [str(rating) for rating in ratings])
    plt.legend()
    plt.tight_layout()
    plt.savefig(path)
    plt.close()

    return path


def plot_missing_value_summary(
    summary: dict[str, Any],
    figures_dir: Path,
) -> Path:
    path = figures_dir / "missing_value_summary.png"
    create_bar_figure(
        labels=["content", "rating"],
        values=[
            int(summary["missing_content_count"]),
            int(summary["missing_rating_count"]),
        ],
        title="Missing Value Summary",
        xlabel="Field",
        ylabel="Missing Count",
        output_path=path,
    )

    return path


def create_bar_figure(
    labels: list[str],
    values: list[int],
    title: str,
    xlabel: str,
    ylabel: str,
    output_path: Path,
) -> None:
    plt.figure(figsize=(8, 5))
    plt.bar(labels, values, color="#2f6f9f")
    plt.title(title)
    plt.xlabel(xlabel)
    plt.ylabel(ylabel)
    plt.tight_layout()
    plt.savefig(output_path)
    plt.close()


def main() -> None:
    args = parse_args()
    summary_output = args.summary_output

    if summary_output is None:
        summary_output = args.output.parent / "data_acquisition_summary.json"

    raw_dataframe = load_raw_rating_files(args.input_dir)
    labeled_dataframe = apply_initial_labels(
        dataframe=raw_dataframe,
        rating_column=args.rating_column,
        label_column=args.label_column,
    )
    labeled_dataframe = select_output_columns(
        dataframe=labeled_dataframe,
        label_column=args.label_column,
    )
    summary = build_summary(
        dataframe=labeled_dataframe,
        rating_column=args.rating_column,
        label_column=args.label_column,
    )
    figure_paths = generate_figures(
        dataframe=labeled_dataframe,
        summary=summary,
        figures_dir=args.figures_dir,
        rating_column=args.rating_column,
        label_column=args.label_column,
    )
    metric_paths = generate_metric_outputs(
        dataframe=labeled_dataframe,
        metrics_dir=args.metrics_dir,
        rating_column=args.rating_column,
        label_column=args.label_column,
    )

    save_labeled_dataset(labeled_dataframe, args.output)
    save_summary(summary, summary_output)

    print(
        json.dumps(
            {
                "output": str(args.output),
                "summary_output": str(summary_output),
                "figures": [str(path) for path in figure_paths],
                "metrics": [str(path) for path in metric_paths],
                "summary": summary,
            },
            indent=2,
            sort_keys=True,
        )
    )


if __name__ == "__main__":
    main()
