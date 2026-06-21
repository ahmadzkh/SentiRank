"""Create normalized text preprocessing output for SVM workflows."""

from __future__ import annotations

import argparse
import json
import re
import sys
from datetime import datetime, timezone
from pathlib import Path

import matplotlib
import pandas as pd

matplotlib.use("Agg")
import matplotlib.pyplot as plt

ML_SERVICE_ROOT = Path(__file__).resolve().parents[1]
if str(ML_SERVICE_ROOT) not in sys.path:
    sys.path.insert(0, str(ML_SERVICE_ROOT))

PROJECT_ROOT = ML_SERVICE_ROOT.parent

from app.utils.text_quality_filtering import (  # noqa: E402
    PREPROCESSING_STATUS_VALID,
    QUALITY_DIAGNOSTIC_COLUMNS,
    QUALITY_METADATA_COLUMNS,
    assess_text_quality,
    normalize_unicode_controls,
)

DEFAULT_INPUT = (
    PROJECT_ROOT / "datasets" / "processed" / "dataset_spotify_indobert_stage.csv"
)
DEFAULT_FINAL_OUTPUT = (
    PROJECT_ROOT / "datasets" / "processed" / "dataset_spotify_processed.csv"
)
DEFAULT_FINAL_JSON_OUTPUT = (
    PROJECT_ROOT / "datasets" / "processed" / "dataset_spotify_processed.json"
)
DEFAULT_NOISE_REPORT_OUTPUT = (
    PROJECT_ROOT / "datasets" / "processed" / "dataset_spotify_noise_report.csv"
)
DEFAULT_NOISE_REPORT_JSON_OUTPUT = (
    PROJECT_ROOT / "datasets" / "processed" / "dataset_spotify_noise_report.json"
)
QUALITY_STAGE = "svm_preprocessing"
FINAL_OUTPUT_COLUMNS = [
    "external_id",
    "rating",
    "content",
    "initial_sentiment",
    "final_sentiment",
    "text_indobert",
    "text_svm",
    "original_text",
    "cleaned_text",
    "preprocessing_status",
    "drop_reason",
    "text_length_before",
    "text_length_after",
    "reviewed_at",
    "source",
    "app_id",
]


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=(
            "Prepare normalized text for SVM without fitting TF-IDF, creating "
            "vectorizer artifacts, or splitting datasets."
        ),
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    parser.add_argument(
        "--input",
        type=Path,
        default=DEFAULT_INPUT,
        help="Valid IndoBERT-stage CSV.",
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=None,
        help="Optional secondary SVM-stage CSV; canonical output uses --final-output.",
    )
    parser.add_argument("--text-column", default="content")
    parser.add_argument("--label-column", default="final_sentiment")
    parser.add_argument("--summary-output", type=Path, default=None)
    parser.add_argument(
        "--metrics-dir",
        type=Path,
        default=None,
        help="Optional secondary metrics directory.",
    )
    parser.add_argument(
        "--figures-dir",
        type=Path,
        default=None,
        help="Optional secondary figures directory.",
    )
    parser.add_argument(
        "--final-output",
        type=Path,
        default=DEFAULT_FINAL_OUTPUT,
        help="Canonical valid-row CSV.",
    )
    parser.add_argument(
        "--final-json-output",
        type=Path,
        default=DEFAULT_FINAL_JSON_OUTPUT,
        help="Canonical valid-row JSON.",
    )
    parser.add_argument(
        "--noise-report-output",
        type=Path,
        default=DEFAULT_NOISE_REPORT_OUTPUT,
        help="Cumulative canonical dropped-row CSV.",
    )
    parser.add_argument(
        "--noise-report-json-output",
        type=Path,
        default=DEFAULT_NOISE_REPORT_JSON_OUTPUT,
        help="JSON counterpart of --noise-report-output.",
    )

    return parser.parse_args()


def clean_text_for_svm(value: object) -> str:
    text = "" if pd.isna(value) else str(value)
    text = normalize_unicode_controls(text)
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
) -> tuple[pd.DataFrame, pd.DataFrame]:
    validate_columns(dataframe, [text_column, label_column])

    preprocessed = dataframe.copy()
    preprocessed["text_svm"] = preprocessed[text_column].map(clean_text_for_svm)

    if "text_indobert" not in preprocessed.columns:
        preprocessed["text_indobert"] = preprocessed[text_column].fillna("").astype(str)

    preprocessed = attach_quality_metadata(
        dataframe=preprocessed,
        text_column=text_column,
        cleaned_text_column="text_svm",
    )
    valid = preprocessed.loc[
        preprocessed["preprocessing_status"].eq(PREPROCESSING_STATUS_VALID)
    ].copy()
    dropped = preprocessed.loc[
        ~preprocessed["preprocessing_status"].eq(PREPROCESSING_STATUS_VALID)
    ].copy()

    return valid, dropped


def attach_quality_metadata(
    dataframe: pd.DataFrame,
    text_column: str,
    cleaned_text_column: str,
) -> pd.DataFrame:
    quality_records = [
        assess_text_quality(
            original_text="" if pd.isna(original_text) else str(original_text),
            cleaned_text="" if pd.isna(cleaned_text) else str(cleaned_text),
        )
        for original_text, cleaned_text in zip(
            dataframe[text_column],
            dataframe[cleaned_text_column],
        )
    ]
    quality_dataframe = pd.DataFrame.from_records(quality_records, index=dataframe.index)

    enriched = dataframe.copy()
    for column in QUALITY_METADATA_COLUMNS + QUALITY_DIAGNOSTIC_COLUMNS:
        enriched[column] = quality_dataframe[column]

    return enriched


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
    valid_dataframe: pd.DataFrame,
    dropped_dataframe: pd.DataFrame,
    text_column: str,
    label_column: str,
) -> dict[str, object]:
    label_counts = valid_dataframe[label_column].value_counts().sort_index()
    drop_reason_counts = (
        dropped_dataframe["drop_reason"].value_counts().sort_index().to_dict()
        if not dropped_dataframe.empty
        else {}
    )

    return {
        "total_rows": int(len(valid_dataframe)),
        "total_rows_before_quality_filter": int(
            len(valid_dataframe) + len(dropped_dataframe)
        ),
        "valid_rows": int(len(valid_dataframe)),
        "dropped_rows": int(len(dropped_dataframe)),
        "label_column": label_column,
        "label_distribution_final": {
            str(label): int(count) for label, count in label_counts.items()
        },
        "missing_source_text_count": int(valid_dataframe[text_column].isna().sum()),
        "empty_text_indobert_count": int(valid_dataframe["text_indobert"].eq("").sum()),
        "empty_text_svm_count": int(valid_dataframe["text_svm"].eq("").sum()),
        "drop_reason_distribution": {
            str(reason): int(count) for reason, count in drop_reason_counts.items()
        },
        "sample_dropped_rows": records_for_json(
            dropped_dataframe,
            [
                "external_id",
                "original_text",
                "cleaned_text",
                "drop_reason",
                "text_length_before",
                "text_length_after",
                "alphabet_char_count",
                "digit_char_count",
                "symbol_char_count",
            ],
            limit=10,
        ),
        "sample_short_valid_rows": records_for_json(
            valid_dataframe.loc[
                (valid_dataframe["token_count"] <= 2)
                | (valid_dataframe["text_length_after"] <= 15)
            ],
            [
                "external_id",
                "original_text",
                "cleaned_text",
                "drop_reason",
                "text_length_before",
                "text_length_after",
                "token_count",
            ],
            limit=10,
        ),
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


def save_json_records(
    dataframe: pd.DataFrame,
    output_path: Path,
    omit_null_fields: bool = False,
) -> Path:
    records = json.loads(dataframe.to_json(orient="records", force_ascii=False))
    output_path.parent.mkdir(parents=True, exist_ok=True)

    with output_path.open("w", encoding="utf-8", newline="\n") as handle:
        handle.write("[\n")
        for index, record in enumerate(records):
            if omit_null_fields:
                record = {key: value for key, value in record.items() if value is not None}
            if index:
                handle.write(",\n")
            handle.write("  ")
            handle.write(json.dumps(record, ensure_ascii=False, separators=(",", ":")))
        handle.write("\n]\n")

    return output_path


def save_summary(summary: dict[str, object], output_path: Path) -> Path:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(
        json.dumps(summary, indent=2, sort_keys=True),
        encoding="utf-8",
    )

    return output_path


def records_for_json(
    dataframe: pd.DataFrame,
    columns: list[str],
    limit: int,
) -> list[dict[str, object]]:
    selected_columns = [column for column in columns if column in dataframe.columns]
    if dataframe.empty or not selected_columns:
        return []

    return json.loads(dataframe[selected_columns].head(limit).to_json(orient="records"))


def select_noise_report_columns(dataframe: pd.DataFrame) -> pd.DataFrame:
    preferred_columns = [
        "external_id",
        "quality_stage",
        "rating",
        "final_sentiment",
        "original_text",
        "cleaned_text",
        "text_indobert",
        "text_svm",
        "preprocessing_status",
        "drop_reason",
        "text_length_before",
        "text_length_after",
        "alphabet_char_count",
        "digit_char_count",
        "symbol_char_count",
        "token_count",
        "morse_char_ratio",
        "symbol_char_ratio",
        "digit_char_ratio",
    ]
    selected_columns = [
        column for column in preferred_columns if column in dataframe.columns
    ]

    return dataframe[selected_columns].copy()


def build_noise_report(
    dropped_dataframe: pd.DataFrame,
    existing_csv: Path,
) -> pd.DataFrame:
    current_report = select_noise_report_columns(
        dropped_dataframe.assign(quality_stage=QUALITY_STAGE)
    )

    if not existing_csv.exists():
        return current_report

    existing_report = pd.read_csv(existing_csv)
    if "quality_stage" not in existing_report.columns:
        raise ValueError(
            f"Existing noise report lacks quality_stage provenance: {existing_csv}"
        )

    existing_report = existing_report.loc[
        ~existing_report["quality_stage"].eq(QUALITY_STAGE)
    ]
    combined = select_noise_report_columns(
        pd.concat([existing_report, current_report], ignore_index=True, sort=False)
    )

    if "external_id" in combined.columns and combined["external_id"].duplicated().any():
        raise ValueError("Noise report contains duplicate external_id values")

    return combined


def save_noise_reports(
    report_dataframe: pd.DataFrame,
    csv_output: Path,
    json_output: Path,
) -> list[Path]:
    csv_output.parent.mkdir(parents=True, exist_ok=True)
    report_dataframe.to_csv(csv_output, index=False, lineterminator="\n")
    save_json_records(report_dataframe, json_output, omit_null_fields=True)

    return [csv_output, json_output]


def save_preprocessing_metrics(
    dataframe: pd.DataFrame,
    dropped_dataframe: pd.DataFrame,
    text_column: str,
    label_column: str,
    summary_output: Path,
    metrics_dir: Path,
) -> list[Path]:
    text_length_metrics = build_text_length_metrics(dataframe, text_column)
    summary = build_preprocessing_summary(
        valid_dataframe=dataframe,
        dropped_dataframe=dropped_dataframe,
        text_column=text_column,
        label_column=label_column,
    )
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


def normalize_text_line_endings(dataframe: pd.DataFrame) -> pd.DataFrame:
    normalized = dataframe.copy()
    text_columns = normalized.select_dtypes(include=["object", "string"]).columns

    for column in text_columns:
        normalized[column] = normalized[column].map(
            lambda value: value.replace("\r\n", "\n").replace("\r", "\n")
            if isinstance(value, str)
            else value
        )

    return normalized


def main() -> None:
    args = parse_args()
    summary_output = args.summary_output

    if summary_output is None and args.metrics_dir is not None:
        summary_output = args.metrics_dir / "preprocessing_summary.json"

    dataframe = pd.read_csv(args.input)
    preprocessed_dataframe, dropped_dataframe = preprocess_dataframe(
        dataframe=dataframe,
        text_column=args.text_column,
        label_column=args.label_column,
    )
    summary = build_preprocessing_summary(
        valid_dataframe=preprocessed_dataframe,
        dropped_dataframe=dropped_dataframe,
        text_column=args.text_column,
        label_column=args.label_column,
    )
    noise_report = build_noise_report(
        dropped_dataframe=dropped_dataframe,
        existing_csv=args.noise_report_output,
    )

    if args.output is not None:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        preprocessed_dataframe.to_csv(args.output, index=False)

    noise_reports = save_noise_reports(
        report_dataframe=noise_report,
        csv_output=args.noise_report_output,
        json_output=args.noise_report_json_output,
    )

    final_dataframe = normalize_text_line_endings(
        select_final_columns(preprocessed_dataframe)
    )
    args.final_output.parent.mkdir(parents=True, exist_ok=True)
    final_dataframe.to_csv(args.final_output, index=False, lineterminator="\r\n")
    save_json_records(final_dataframe, args.final_json_output)

    metrics: list[Path] = []
    if args.metrics_dir is not None and summary_output is not None:
        metrics = save_preprocessing_metrics(
            dataframe=preprocessed_dataframe,
            dropped_dataframe=dropped_dataframe,
            text_column=args.text_column,
            label_column=args.label_column,
            summary_output=summary_output,
            metrics_dir=args.metrics_dir,
        )
    elif summary_output is not None:
        metrics = [save_summary(summary, summary_output)]

    figure = None
    if args.figures_dir is not None:
        figure = save_text_length_figure(
            dataframe=preprocessed_dataframe,
            text_column=args.text_column,
            figures_dir=args.figures_dir,
        )

    print(
        json.dumps(
            {
                "input_path": str(args.input),
                "processed_output_path": str(args.final_output),
                "processed_json_output_path": str(args.final_json_output),
                "noise_report_path": str(noise_reports[0]),
                "noise_report_json_path": str(noise_reports[1]),
                "stage_output_path": str(args.output)
                if args.output is not None
                else None,
                "summary_output": str(summary_output)
                if summary_output is not None
                else None,
                "metrics": [str(path) for path in metrics],
                "figures": [str(figure)] if figure is not None else [],
                "total_rows": summary["total_rows_before_quality_filter"],
                "valid_rows": summary["valid_rows"],
                "dropped_rows": summary["dropped_rows"],
                "drop_reason_distribution": summary["drop_reason_distribution"],
                "noise_report_rows": int(len(noise_report)),
            },
            indent=2,
            sort_keys=True,
        )
    )


if __name__ == "__main__":
    main()
