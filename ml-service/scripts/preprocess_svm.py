"""Create normalized text preprocessing output for SVM workflows."""

from __future__ import annotations

import argparse
import html
import json
import re
import unicodedata
from datetime import datetime, timezone
from pathlib import Path

import matplotlib
import pandas as pd

matplotlib.use("Agg")
import matplotlib.pyplot as plt

DEFAULT_METRICS_DIR = Path("../datasets/outputs/eda/02_preprocessing")
DEFAULT_FIGURES_DIR = Path("../docs/figures/02_preprocessing")
DEFAULT_FINAL_OUTPUT = Path("../datasets/processed/reviews_final.csv")
FINAL_OUTPUT_COLUMNS = [
    "external_id",
    "rating",
    "content",
    "initial_sentiment",
    "final_sentiment",
    "text_indobert",
    "text_svm",
    "reviewed_at",
    "source",
    "app_id",
]


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=(
            "Prepare normalized text for SVM without fitting TF-IDF, creating "
            "vectorizer artifacts, or splitting datasets."
        )
    )
    parser.add_argument("--input", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--text-column", default="content")
    parser.add_argument("--label-column", default="final_sentiment")
    parser.add_argument("--summary-output", type=Path, default=None)
    parser.add_argument("--metrics-dir", type=Path, default=DEFAULT_METRICS_DIR)
    parser.add_argument("--figures-dir", type=Path, default=DEFAULT_FIGURES_DIR)
    parser.add_argument("--final-output", type=Path, default=DEFAULT_FINAL_OUTPUT)

    return parser.parse_args()


def clean_text_for_svm(value: object) -> str:
    text = "" if pd.isna(value) else str(value)
    text = unicodedata.normalize("NFKC", html.unescape(text))
    text = text.lower()
    text = re.sub(r"https?://\S+|www\.\S+", " ", text)
    text = re.sub(r"<[^>]+>", " ", text)
    text = replace_emoji_with_token(text)
    text = normalize_repeated_characters(text)
    text = re.sub(r"[^a-z0-9_\s]", " ", text)
    text = re.sub(r"\s+", " ", text)

    return text.strip()


def replace_emoji_with_token(text: str) -> str:
    emoji_pattern = re.compile(
        "["
        "\U0001F300-\U0001F5FF"
        "\U0001F600-\U0001F64F"
        "\U0001F680-\U0001F6FF"
        "\U0001F700-\U0001F77F"
        "\U0001F780-\U0001F7FF"
        "\U0001F800-\U0001F8FF"
        "\U0001F900-\U0001F9FF"
        "\U0001FA00-\U0001FA6F"
        "\U0001FA70-\U0001FAFF"
        "]+",
        flags=re.UNICODE,
    )

    return emoji_pattern.sub(" emoji ", text)


def normalize_repeated_characters(text: str) -> str:
    return re.sub(r"([a-z])\1{2,}", r"\1\1", text)


def validate_columns(dataframe: pd.DataFrame, columns: list[str]) -> None:
    missing_columns = [column for column in columns if column not in dataframe.columns]

    if missing_columns:
        raise ValueError(f"Missing required columns: {', '.join(missing_columns)}")


def preprocess_dataframe(
    dataframe: pd.DataFrame,
    text_column: str,
    label_column: str,
) -> pd.DataFrame:
    validate_columns(dataframe, [text_column, label_column])

    preprocessed = dataframe.copy()
    preprocessed["text_svm"] = preprocessed[text_column].map(clean_text_for_svm)

    if "text_indobert" not in preprocessed.columns:
        preprocessed["text_indobert"] = preprocessed[text_column].fillna("").astype(str)

    return preprocessed


def build_text_length_metrics(
    dataframe: pd.DataFrame,
    text_column: str,
) -> pd.DataFrame:
    stages = [
        ("raw_content", dataframe[text_column]),
        ("text_indobert", dataframe["text_indobert"]),
        ("text_svm", dataframe["text_svm"]),
    ]
    rows = []

    for stage, series in stages:
        lengths = series.fillna("").astype(str).str.len()
        rows.append(
            {
                "stage": stage,
                "count": int(lengths.count()),
                "min": int(lengths.min()),
                "median": float(lengths.median()),
                "mean": float(lengths.mean()),
                "max": int(lengths.max()),
            }
        )

    return pd.DataFrame(rows)


def build_preprocessing_summary(
    dataframe: pd.DataFrame,
    text_column: str,
    label_column: str,
) -> dict[str, object]:
    label_counts = dataframe[label_column].value_counts().sort_index()

    return {
        "total_rows": int(len(dataframe)),
        "label_column": label_column,
        "label_distribution_final": {
            str(label): int(count) for label, count in label_counts.items()
        },
        "missing_source_text_count": int(dataframe[text_column].isna().sum()),
        "empty_text_indobert_count": int(dataframe["text_indobert"].eq("").sum()),
        "empty_text_svm_count": int(dataframe["text_svm"].eq("").sum()),
        "generated_at": datetime.now(timezone.utc).isoformat(),
    }


def save_dataframe_metric(
    dataframe: pd.DataFrame,
    csv_path: Path,
    json_path: Path,
) -> list[Path]:
    csv_path.parent.mkdir(parents=True, exist_ok=True)
    dataframe.to_csv(csv_path, index=False)
    json_path.write_text(
        json.dumps(
            json.loads(dataframe.to_json(orient="records")),
            indent=2,
        ),
        encoding="utf-8",
    )

    return [csv_path, json_path]


def save_summary(summary: dict[str, object], output_path: Path) -> Path:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(
        json.dumps(summary, indent=2, sort_keys=True),
        encoding="utf-8",
    )

    return output_path


def save_preprocessing_metrics(
    dataframe: pd.DataFrame,
    text_column: str,
    label_column: str,
    summary_output: Path,
    metrics_dir: Path,
) -> list[Path]:
    text_length_metrics = build_text_length_metrics(dataframe, text_column)
    summary = build_preprocessing_summary(dataframe, text_column, label_column)
    generated_paths = []
    generated_paths.extend(
        save_dataframe_metric(
            text_length_metrics,
            metrics_dir / "text_length_before_after_cleaning.csv",
            metrics_dir / "text_length_before_after_cleaning.json",
        )
    )
    generated_paths.append(save_summary(summary, summary_output))

    return generated_paths


def save_text_length_figure(
    dataframe: pd.DataFrame,
    text_column: str,
    figures_dir: Path,
) -> Path:
    metrics = build_text_length_metrics(dataframe, text_column)
    output_path = figures_dir / "text_length_before_after_cleaning.png"
    figures_dir.mkdir(parents=True, exist_ok=True)

    plt.figure(figsize=(8, 5))
    plt.bar(metrics["stage"], metrics["median"], color="#2f6f9f")
    plt.title("Text Length Before and After Cleaning")
    plt.xlabel("Preprocessing Stage")
    plt.ylabel("Median Character Count")
    plt.tight_layout()
    plt.savefig(output_path)
    plt.close()

    return output_path


def select_final_columns(dataframe: pd.DataFrame) -> pd.DataFrame:
    selected_columns = [
        column for column in FINAL_OUTPUT_COLUMNS if column in dataframe.columns
    ]

    return dataframe[selected_columns].copy()


def main() -> None:
    args = parse_args()
    summary_output = args.summary_output

    if summary_output is None:
        summary_output = args.metrics_dir / "preprocessing_summary.json"

    dataframe = pd.read_csv(args.input)
    preprocessed_dataframe = preprocess_dataframe(
        dataframe=dataframe,
        text_column=args.text_column,
        label_column=args.label_column,
    )

    args.output.parent.mkdir(parents=True, exist_ok=True)
    preprocessed_dataframe.to_csv(args.output, index=False)

    final_dataframe = select_final_columns(preprocessed_dataframe)
    args.final_output.parent.mkdir(parents=True, exist_ok=True)
    final_dataframe.to_csv(args.final_output, index=False)

    metrics = save_preprocessing_metrics(
        dataframe=preprocessed_dataframe,
        text_column=args.text_column,
        label_column=args.label_column,
        summary_output=summary_output,
        metrics_dir=args.metrics_dir,
    )
    figure = save_text_length_figure(
        dataframe=preprocessed_dataframe,
        text_column=args.text_column,
        figures_dir=args.figures_dir,
    )

    print(
        json.dumps(
            {
                "output": str(args.output),
                "final_output": str(args.final_output),
                "summary_output": str(summary_output),
                "metrics": [str(path) for path in metrics],
                "figures": [str(figure)],
            },
            indent=2,
            sort_keys=True,
        )
    )


if __name__ == "__main__":
    main()
