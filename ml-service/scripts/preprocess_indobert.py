"""Create conservative text preprocessing output for IndoBERT workflows."""

from __future__ import annotations

import argparse
import html
import json
import re
import unicodedata
from datetime import datetime, timezone
from pathlib import Path

import pandas as pd


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=(
            "Prepare conservative cleaned text for IndoBERT without tokenizing, "
            "downloading models, or creating train/validation/test splits."
        )
    )
    parser.add_argument("--input", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--text-column", default="content")
    parser.add_argument("--label-column", default="final_sentiment")
    parser.add_argument("--summary-output", type=Path, default=None)

    return parser.parse_args()


def clean_text_for_indobert(value: object) -> str:
    text = "" if pd.isna(value) else str(value)
    text = unicodedata.normalize("NFKC", html.unescape(text))
    text = re.sub(r"https?://\S+|www\.\S+", " ", text)
    text = re.sub(r"<[^>]+>", " ", text)
    text = text.replace("\u200b", " ")
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
) -> pd.DataFrame:
    validate_columns(dataframe, [text_column, label_column])

    preprocessed = dataframe.copy()
    preprocessed["text_indobert"] = preprocessed[text_column].map(
        clean_text_for_indobert
    )

    return preprocessed


def build_summary(
    dataframe: pd.DataFrame,
    text_column: str,
    label_column: str,
) -> dict[str, object]:
    raw_lengths = dataframe[text_column].fillna("").astype(str).str.len()
    cleaned_lengths = dataframe["text_indobert"].fillna("").astype(str).str.len()

    return {
        "total_rows": int(len(dataframe)),
        "label_column": label_column,
        "missing_text_count": int(dataframe[text_column].isna().sum()),
        "empty_text_indobert_count": int(dataframe["text_indobert"].eq("").sum()),
        "raw_text_length_mean": float(raw_lengths.mean()),
        "text_indobert_length_mean": float(cleaned_lengths.mean()),
        "generated_at": datetime.now(timezone.utc).isoformat(),
    }


def save_summary(summary: dict[str, object], output_path: Path) -> None:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(
        json.dumps(summary, indent=2, sort_keys=True),
        encoding="utf-8",
    )


def main() -> None:
    args = parse_args()
    dataframe = pd.read_csv(args.input)
    preprocessed_dataframe = preprocess_dataframe(
        dataframe=dataframe,
        text_column=args.text_column,
        label_column=args.label_column,
    )
    summary = build_summary(
        dataframe=preprocessed_dataframe,
        text_column=args.text_column,
        label_column=args.label_column,
    )

    args.output.parent.mkdir(parents=True, exist_ok=True)
    preprocessed_dataframe.to_csv(args.output, index=False)

    if args.summary_output is not None:
        save_summary(summary, args.summary_output)

    print(
        json.dumps(
            {
                "output": str(args.output),
                "summary_output": str(args.summary_output)
                if args.summary_output is not None
                else None,
                "summary": summary,
            },
            indent=2,
            sort_keys=True,
        )
    )


if __name__ == "__main__":
    main()
