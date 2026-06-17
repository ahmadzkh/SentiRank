"""Prepare the candidate dataset for SVM aspect classification."""

from __future__ import annotations

import argparse
import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Final

import matplotlib
import pandas as pd

matplotlib.use("Agg")
import matplotlib.pyplot as plt


DEFAULT_INPUT = Path("../datasets/processed/reviews_with_aspect_labels_refined.csv")
DEFAULT_OUTPUT = Path("../datasets/processed/svm/svm_aspect_dataset.csv")
DEFAULT_SUMMARY_OUTPUT = Path(
    "../datasets/outputs/eda/04_svm/svm_aspect_dataset_summary.json"
)
DEFAULT_METRICS_DIR = Path("../datasets/outputs/eda/04_svm")
DEFAULT_FIGURES_DIR = Path("../docs/figures/04_svm")
METHODOLOGY_NOTE: Final[str] = (
    "The SVM aspect classifier uses weak labels derived from keyword-based "
    "aspect labeling. General fallback labels and low-confidence labels are "
    "excluded to reduce label noise. These labels are not treated as "
    "expert-validated ground truth."
)
ACTIONABLE_ASPECT_LABELS: Final[tuple[str, ...]] = (
    "Performance & Stability",
    "Ads Experience",
    "Subscription & Pricing",
    "Features & Content",
    "Audio Quality",
    "UI/UX",
    "Account/Login",
)


def parse_csv_argument(value: str) -> list[str]:
    return [item.strip() for item in value.split(",") if item.strip()]


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=(
            "Prepare a filtered weak-label dataset for SVM aspect classification "
            "without fitting TF-IDF, training SVM, or creating model artifacts."
        )
    )
    parser.add_argument("--input", type=Path, default=DEFAULT_INPUT)
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    parser.add_argument("--text-column", default="text_svm")
    parser.add_argument("--label-column", default="aspect_label")
    parser.add_argument("--confidence-column", default="aspect_label_confidence")
    parser.add_argument("--allowed-confidence", default="medium,high")
    parser.add_argument("--exclude-labels", default="General")
    parser.add_argument("--summary-output", type=Path, default=DEFAULT_SUMMARY_OUTPUT)
    parser.add_argument("--metrics-dir", type=Path, default=DEFAULT_METRICS_DIR)
    parser.add_argument("--figures-dir", type=Path, default=DEFAULT_FIGURES_DIR)

    return parser.parse_args()


def validate_columns(dataframe: pd.DataFrame, columns: list[str]) -> None:
    missing_columns = [column for column in columns if column not in dataframe.columns]
    if missing_columns:
        raise ValueError(f"Missing required columns: {', '.join(missing_columns)}")


def distribution_as_records(
    dataframe: pd.DataFrame,
    column: str,
    count_column: str = "count",
) -> pd.DataFrame:
    if column not in dataframe.columns:
        return pd.DataFrame(columns=[column, count_column, "percentage"])

    counts = dataframe[column].fillna("Missing").astype(str).value_counts()
    result = counts.rename_axis(column).reset_index(name=count_column)
    total = int(result[count_column].sum())
    result["percentage"] = (
        result[count_column] / total * 100 if total else pd.Series(dtype=float)
    )

    return result


def crosstab_as_records(
    dataframe: pd.DataFrame,
    row_column: str,
    column_column: str,
) -> pd.DataFrame:
    if row_column not in dataframe.columns or column_column not in dataframe.columns:
        return pd.DataFrame(columns=[row_column, column_column, "count"])

    table = pd.crosstab(dataframe[row_column], dataframe[column_column])
    return table.reset_index().melt(
        id_vars=row_column,
        var_name=column_column,
        value_name="count",
    )


def save_json(payload: object, output_path: Path) -> Path:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(
        json.dumps(payload, indent=2, sort_keys=True),
        encoding="utf-8",
    )

    return output_path


def save_dataframe_metric(
    dataframe: pd.DataFrame,
    csv_path: Path,
    json_path: Path,
) -> list[Path]:
    csv_path.parent.mkdir(parents=True, exist_ok=True)
    dataframe.to_csv(csv_path, index=False)
    json_payload = json.loads(dataframe.to_json(orient="records"))
    save_json(json_payload, json_path)

    return [csv_path, json_path]


def prepare_svm_dataset(
    dataframe: pd.DataFrame,
    text_column: str,
    label_column: str,
    confidence_column: str,
    allowed_confidence: list[str],
    excluded_labels: list[str],
) -> tuple[pd.DataFrame, dict[str, int]]:
    validate_columns(dataframe, [text_column, label_column, confidence_column])

    working = dataframe.copy()
    total_input_rows = int(len(working))
    preprocessing_status_rows_removed = 0

    if "preprocessing_status" in working.columns:
        valid_preprocessing_mask = (
            working["preprocessing_status"].fillna("").astype(str).eq("valid")
        )
        preprocessing_status_rows_removed = int((~valid_preprocessing_mask).sum())
        working = working.loc[valid_preprocessing_mask].copy()

    non_empty_text_mask = working[text_column].fillna("").astype(str).str.strip().ne("")
    after_text = working.loc[non_empty_text_mask].copy()
    removed_empty_text_count = int(len(working) - len(after_text))

    excluded_label_set = set(excluded_labels)
    after_excluded = after_text.loc[
        ~after_text[label_column].fillna("").astype(str).isin(excluded_label_set)
    ].copy()
    removed_excluded_count = int(len(after_text) - len(after_excluded))
    removed_general_count = int(
        after_text[label_column].fillna("").astype(str).eq("General").sum()
    )

    after_actionable = after_excluded.loc[
        after_excluded[label_column].fillna("").astype(str).isin(ACTIONABLE_ASPECT_LABELS)
    ].copy()
    removed_non_actionable_count = int(len(after_excluded) - len(after_actionable))

    allowed_confidence_set = set(allowed_confidence)
    after_confidence = after_actionable.loc[
        after_actionable[confidence_column]
        .fillna("")
        .astype(str)
        .isin(allowed_confidence_set)
    ].copy()
    removed_low_confidence_count = int(len(after_actionable) - len(after_confidence))

    counts = {
        "total_input_rows": total_input_rows,
        "preprocessing_status_rows_removed": preprocessing_status_rows_removed,
        "rows_after_preprocessing_status_filter": int(len(working)),
        "removed_empty_text_count": removed_empty_text_count,
        "rows_after_text_filter": int(len(after_text)),
        "removed_excluded_label_count": removed_excluded_count,
        "removed_general_count": removed_general_count,
        "rows_after_excluding_general": int(len(after_excluded)),
        "removed_non_actionable_count": removed_non_actionable_count,
        "rows_after_actionable_filter": int(len(after_actionable)),
        "removed_low_confidence_count": removed_low_confidence_count,
        "rows_after_confidence_filter": int(len(after_confidence)),
        "final_dataset_rows": int(len(after_confidence)),
    }

    return after_confidence, counts


def build_summary(
    prepared_dataframe: pd.DataFrame,
    counts: dict[str, int],
    text_column: str,
    label_column: str,
    confidence_column: str,
    allowed_confidence: list[str],
    excluded_labels: list[str],
) -> dict[str, object]:
    label_distribution = distribution_as_records(
        prepared_dataframe,
        label_column,
    )
    confidence_distribution = distribution_as_records(
        prepared_dataframe,
        confidence_column,
    )
    sentiment_distribution = distribution_as_records(
        prepared_dataframe,
        "final_sentiment",
    )

    return {
        **counts,
        "text_column": text_column,
        "label_column": label_column,
        "confidence_column": confidence_column,
        "allowed_confidence": allowed_confidence,
        "excluded_labels": excluded_labels,
        "actionable_aspect_labels": list(ACTIONABLE_ASPECT_LABELS),
        "aspect_distribution": {
            str(row[label_column]): int(row["count"])
            for _, row in label_distribution.iterrows()
        },
        "confidence_distribution": {
            str(row[confidence_column]): int(row["count"])
            for _, row in confidence_distribution.iterrows()
        },
        "sentiment_distribution": {
            str(row["final_sentiment"]): int(row["count"])
            for _, row in sentiment_distribution.iterrows()
        },
        "methodology_note": METHODOLOGY_NOTE,
        "generated_at": datetime.now(timezone.utc).isoformat(),
    }


def save_bar_figure(
    dataframe: pd.DataFrame,
    category_column: str,
    value_column: str,
    output_path: Path,
    title: str,
    xlabel: str,
    ylabel: str,
) -> Path:
    output_path.parent.mkdir(parents=True, exist_ok=True)

    plt.figure(figsize=(10, 5))
    plt.bar(dataframe[category_column].astype(str), dataframe[value_column], color="#2f6f9f")
    plt.title(title)
    plt.xlabel(xlabel)
    plt.ylabel(ylabel)
    plt.xticks(rotation=30, ha="right")
    plt.tight_layout()
    plt.savefig(output_path)
    plt.close()

    return output_path


def save_aspect_by_sentiment_figure(
    dataframe: pd.DataFrame,
    output_path: Path,
) -> Path:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    if dataframe.empty:
        plt.figure(figsize=(8, 4))
        plt.title("SVM Aspect by Sentiment Distribution")
        plt.text(0.5, 0.5, "No data available", ha="center", va="center")
        plt.axis("off")
        plt.tight_layout()
        plt.savefig(output_path)
        plt.close()
        return output_path

    pivot = dataframe.pivot_table(
        index="aspect_label",
        columns="final_sentiment",
        values="count",
        aggfunc="sum",
        fill_value=0,
    )
    pivot = pivot.sort_index()

    plt.figure(figsize=(11, 6))
    bottom = None
    colors = ["#2f6f9f", "#d89c2b", "#5f8f3f", "#8f4f6f"]
    for index, sentiment in enumerate(pivot.columns):
        values = pivot[sentiment]
        plt.bar(
            pivot.index,
            values,
            bottom=bottom,
            label=str(sentiment),
            color=colors[index % len(colors)],
        )
        bottom = values if bottom is None else bottom + values

    plt.title("SVM Aspect Distribution by Sentiment")
    plt.xlabel("Aspect Label")
    plt.ylabel("Review Count")
    plt.xticks(rotation=30, ha="right")
    plt.legend(title="Sentiment")
    plt.tight_layout()
    plt.savefig(output_path)
    plt.close()

    return output_path


def save_metrics_and_figures(
    prepared_dataframe: pd.DataFrame,
    summary: dict[str, object],
    label_column: str,
    confidence_column: str,
    metrics_dir: Path,
    figures_dir: Path,
    summary_output: Path,
) -> tuple[list[Path], list[Path]]:
    generated_metrics: list[Path] = []
    generated_figures: list[Path] = []

    aspect_distribution = distribution_as_records(
        prepared_dataframe,
        label_column,
    ).rename(columns={label_column: "aspect_label"})
    confidence_distribution = distribution_as_records(
        prepared_dataframe,
        confidence_column,
    ).rename(columns={confidence_column: "aspect_label_confidence"})
    aspect_by_sentiment = crosstab_as_records(
        prepared_dataframe,
        label_column,
        "final_sentiment",
    ).rename(columns={label_column: "aspect_label"})

    generated_metrics.append(save_json(summary, summary_output))
    generated_metrics.extend(
        save_dataframe_metric(
            aspect_distribution,
            metrics_dir / "svm_aspect_label_distribution.csv",
            metrics_dir / "svm_aspect_label_distribution.json",
        )
    )
    generated_metrics.extend(
        save_dataframe_metric(
            confidence_distribution,
            metrics_dir / "svm_aspect_confidence_distribution.csv",
            metrics_dir / "svm_aspect_confidence_distribution.json",
        )
    )
    generated_metrics.extend(
        save_dataframe_metric(
            aspect_by_sentiment,
            metrics_dir / "svm_aspect_by_sentiment_distribution.csv",
            metrics_dir / "svm_aspect_by_sentiment_distribution.json",
        )
    )

    generated_figures.append(
        save_bar_figure(
            aspect_distribution,
            "aspect_label",
            "count",
            figures_dir / "svm_aspect_label_distribution.png",
            "SVM Candidate Aspect Label Distribution",
            "Aspect Label",
            "Review Count",
        )
    )
    generated_figures.append(
        save_bar_figure(
            confidence_distribution,
            "aspect_label_confidence",
            "count",
            figures_dir / "svm_aspect_confidence_distribution.png",
            "SVM Candidate Aspect Confidence Distribution",
            "Aspect Confidence",
            "Review Count",
        )
    )
    generated_figures.append(
        save_aspect_by_sentiment_figure(
            aspect_by_sentiment,
            figures_dir / "svm_aspect_by_sentiment_distribution.png",
        )
    )

    return generated_metrics, generated_figures


def main() -> None:
    args = parse_args()
    allowed_confidence = parse_csv_argument(args.allowed_confidence)
    excluded_labels = parse_csv_argument(args.exclude_labels)

    dataframe = pd.read_csv(args.input)
    prepared_dataframe, counts = prepare_svm_dataset(
        dataframe=dataframe,
        text_column=args.text_column,
        label_column=args.label_column,
        confidence_column=args.confidence_column,
        allowed_confidence=allowed_confidence,
        excluded_labels=excluded_labels,
    )
    summary = build_summary(
        prepared_dataframe=prepared_dataframe,
        counts=counts,
        text_column=args.text_column,
        label_column=args.label_column,
        confidence_column=args.confidence_column,
        allowed_confidence=allowed_confidence,
        excluded_labels=excluded_labels,
    )

    args.output.parent.mkdir(parents=True, exist_ok=True)
    prepared_dataframe.to_csv(args.output, index=False)

    generated_metrics, generated_figures = save_metrics_and_figures(
        prepared_dataframe=prepared_dataframe,
        summary=summary,
        label_column=args.label_column,
        confidence_column=args.confidence_column,
        metrics_dir=args.metrics_dir,
        figures_dir=args.figures_dir,
        summary_output=args.summary_output,
    )

    print(
        json.dumps(
            {
                "output": str(args.output),
                "summary_output": str(args.summary_output),
                "final_dataset_rows": summary["final_dataset_rows"],
                "aspect_distribution": summary["aspect_distribution"],
                "confidence_distribution": summary["confidence_distribution"],
                "metrics": [str(path) for path in generated_metrics],
                "figures": [str(path) for path in generated_figures],
                "methodology_note": METHODOLOGY_NOTE,
            },
            indent=2,
            sort_keys=True,
        )
    )


if __name__ == "__main__":
    main()
