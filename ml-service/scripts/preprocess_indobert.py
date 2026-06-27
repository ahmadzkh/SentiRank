"""Create conservative text preprocessing output for IndoBERT workflows."""

from __future__ import annotations

import argparse
import json
import re
import sys
from datetime import datetime, timezone
from pathlib import Path

import pandas as pd

ML_SERVICE_ROOT = Path(__file__).resolve().parents[1]
if str(ML_SERVICE_ROOT) not in sys.path:
    sys.path.insert(0, str(ML_SERVICE_ROOT))

PROJECT_ROOT = ML_SERVICE_ROOT.parent
DEFAULT_INPUT = PROJECT_ROOT / "datasets" / "processed" / "reviews_relabelled.csv"
DEFAULT_OUTPUT = (
    PROJECT_ROOT / "datasets" / "processed" / "dataset_spotify_indobert_stage.csv"
)
DEFAULT_NOISE_REPORT_OUTPUT = (
    PROJECT_ROOT / "datasets" / "processed" / "dataset_spotify_noise_report.csv"
)
DEFAULT_NOISE_REPORT_JSON_OUTPUT = (
    PROJECT_ROOT / "datasets" / "processed" / "dataset_spotify_noise_report.json"
)
QUALITY_STAGE = "indobert_preprocessing"

from app.utils.text_quality_filtering import (  # noqa: E402
    PREPROCESSING_STATUS_VALID,
    QUALITY_DIAGNOSTIC_COLUMNS,
    QUALITY_METADATA_COLUMNS,
    assess_text_quality,
    normalize_unicode_controls,
)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=(
            "Prepare conservative cleaned text for IndoBERT without tokenizing, "
            "downloading models, or creating train/validation/test splits."
        ),
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    parser.add_argument(
        "--input",
        type=Path,
        default=DEFAULT_INPUT,
        help="Legacy relabeling input; override to process another compatible CSV.",
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=DEFAULT_OUTPUT,
        help="Valid IndoBERT-stage rows consumed by preprocess_svm.py.",
    )
    parser.add_argument("--text-column", default="content")
    parser.add_argument("--label-column", default="final_sentiment")
    parser.add_argument("--summary-output", type=Path, default=None)
    parser.add_argument(
        "--noise-report-output",
        type=Path,
        default=DEFAULT_NOISE_REPORT_OUTPUT,
        help="First-stage dropped rows; SVM merges its dropped rows into this report.",
    )
    parser.add_argument(
        "--noise-report-json-output",
        type=Path,
        default=DEFAULT_NOISE_REPORT_JSON_OUTPUT,
        help="JSON counterpart of --noise-report-output.",
    )

    return parser.parse_args()


def clean_text_for_indobert(value: object) -> str:
    text = "" if pd.isna(value) else str(value)
    text = normalize_unicode_controls(text)
    text = re.sub(r"https?://\S+|www\.\S+", " ", text)
    text = re.sub(r"<[^>]+>", " ", text)
    text = re.sub(r"\s+", " ", text)

    return text.strip()


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
    preprocessed["text_indobert"] = preprocessed[text_column].map(
        clean_text_for_indobert
    )
    preprocessed = attach_quality_metadata(
        dataframe=preprocessed,
        text_column=text_column,
        cleaned_text_column="text_indobert",
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


def build_summary(
    valid_dataframe: pd.DataFrame,
    dropped_dataframe: pd.DataFrame,
    text_column: str,
    label_column: str,
) -> dict[str, object]:
    raw_lengths = valid_dataframe[text_column].fillna("").astype(str).str.len()
    cleaned_lengths = valid_dataframe["text_indobert"].fillna("").astype(str).str.len()
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
        "missing_text_count": int(valid_dataframe[text_column].isna().sum()),
        "empty_text_indobert_count": int(valid_dataframe["text_indobert"].eq("").sum()),
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
        "raw_text_length_mean": float(raw_lengths.mean()) if len(raw_lengths) else 0.0,
        "text_indobert_length_mean": float(cleaned_lengths.mean())
        if len(cleaned_lengths)
        else 0.0,
        "generated_at": datetime.now(timezone.utc).isoformat(),
    }


def save_summary(summary: dict[str, object], output_path: Path) -> None:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(
        json.dumps(summary, indent=2, sort_keys=True),
        encoding="utf-8",
    )


def records_for_json(
    dataframe: pd.DataFrame,
    columns: list[str],
    limit: int,
) -> list[dict[str, object]]:
    selected_columns = [column for column in columns if column in dataframe.columns]
    if dataframe.empty or not selected_columns:
        return []

    return json.loads(
        dataframe[selected_columns].head(limit).to_json(orient="records")
    )


def select_noise_report_columns(dataframe: pd.DataFrame) -> pd.DataFrame:
    preferred_columns = [
        "external_id",
        "quality_stage",
        "rating",
        "final_sentiment",
        "original_text",
        "cleaned_text",
        "text_indobert",
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


def save_noise_reports(
    dropped_dataframe: pd.DataFrame,
    csv_output: Path,
    json_output: Path,
) -> list[Path]:
    report_dataframe = select_noise_report_columns(dropped_dataframe)
    csv_output.parent.mkdir(parents=True, exist_ok=True)
    json_output.parent.mkdir(parents=True, exist_ok=True)
    report_dataframe.to_csv(csv_output, index=False)
    json_output.write_text(
        json.dumps(
            json.loads(report_dataframe.to_json(orient="records")),
            indent=2,
        ),
        encoding="utf-8",
    )

    return [csv_output, json_output]


def main() -> None:
    args = parse_args()
    dataframe = pd.read_csv(args.input)
    preprocessed_dataframe, dropped_dataframe = preprocess_dataframe(
        dataframe=dataframe,
        text_column=args.text_column,
        label_column=args.label_column,
    )
    summary = build_summary(
        valid_dataframe=preprocessed_dataframe,
        dropped_dataframe=dropped_dataframe,
        text_column=args.text_column,
        label_column=args.label_column,
    )
    dropped_dataframe = dropped_dataframe.assign(quality_stage=QUALITY_STAGE)

    args.output.parent.mkdir(parents=True, exist_ok=True)
    preprocessed_dataframe.to_csv(args.output, index=False)
    noise_reports = save_noise_reports(
        dropped_dataframe=dropped_dataframe,
        csv_output=args.noise_report_output,
        json_output=args.noise_report_json_output,
    )

    if args.summary_output is not None:
        save_summary(summary, args.summary_output)

    print(
        json.dumps(
            {
                "input_path": str(args.input),
                "processed_output_path": str(args.output),
                "noise_report_path": str(noise_reports[0]),
                "noise_report_json_path": str(noise_reports[1]),
                "summary_output": str(args.summary_output)
                if args.summary_output is not None
                else None,
                "total_rows": summary["total_rows_before_quality_filter"],
                "valid_rows": summary["valid_rows"],
                "dropped_rows": summary["dropped_rows"],
                "drop_reason_distribution": summary["drop_reason_distribution"],
            },
            indent=2,
            sort_keys=True,
        )
    )


if __name__ == "__main__":
    main()
