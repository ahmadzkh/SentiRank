"""Apply conservative keyword-based sentiment relabeling.

This script preserves the rating-derived `initial_sentiment` column and writes a
separate `final_sentiment` column for downstream preprocessing.
"""

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

VALID_SENTIMENT_LABELS = ("Negative", "Neutral", "Positive")
NEGATION_TERMS = (
    "tidak",
    "bukan",
    "belum",
    "jangan",
    "ga",
    "gak",
    "nggak",
    "ngga",
    "tak",
)

STRONG_NEGATIVE_KEYWORDS = (
    "error",
    "bug",
    "crash",
    "lemot",
    "lambat",
    "gagal",
    "tidak bisa",
    "ga bisa",
    "gak bisa",
    "tidak dapat",
    "susah",
    "buruk",
    "kecewa",
    "iklan",
    "mahal",
    "login gagal",
    "force close",
    "loading lama",
    "sering keluar",
    "banyak iklan",
    "premium mahal",
)

STRONG_POSITIVE_KEYWORDS = (
    "bagus",
    "mantap",
    "suka",
    "mudah",
    "lancar",
    "puas",
    "keren",
    "terbaik",
    "membantu",
    "nyaman",
    "rekomendasi",
    "worth it",
    "stabil",
    "cepat",
)

DEFAULT_METRICS_DIR = Path("../datasets/outputs/eda/02_preprocessing")
DEFAULT_FIGURES_DIR = Path("../docs/figures/02_preprocessing")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=(
            "Conservatively relabel ambiguous sentiment rows using documented "
            "keyword rules."
        )
    )
    parser.add_argument("--input", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--text-column", default="content")
    parser.add_argument("--label-column", default="initial_sentiment")
    parser.add_argument("--output-label-column", default="final_sentiment")
    parser.add_argument("--summary-output", type=Path, default=None)
    parser.add_argument("--metrics-dir", type=Path, default=DEFAULT_METRICS_DIR)
    parser.add_argument("--figures-dir", type=Path, default=DEFAULT_FIGURES_DIR)

    return parser.parse_args()


def normalize_for_keyword_matching(value: object) -> str:
    text = "" if pd.isna(value) else str(value)
    text = unicodedata.normalize("NFKC", html.unescape(text))
    text = text.lower()
    text = re.sub(r"\s+", " ", text)

    return text.strip()


def find_keyword_hits(text: str, keywords: tuple[str, ...]) -> list[str]:
    hits = []

    for keyword in keywords:
        normalized_keyword = normalize_for_keyword_matching(keyword)
        keyword_pattern = build_keyword_pattern(normalized_keyword)
        keyword_has_negation = contains_negation_term(normalized_keyword)

        for match in re.finditer(keyword_pattern, text):
            if keyword_has_negation or not has_preceding_negation(text, match.start()):
                hits.append(keyword)
                break

    return hits


def build_keyword_pattern(keyword: str) -> str:
    escaped_keyword = re.escape(keyword).replace(r"\ ", r"\s+")

    return rf"(?<!\w){escaped_keyword}(?!\w)"


def contains_negation_term(text: str) -> bool:
    tokens = re.findall(r"[a-z]+", text)

    return any(token in NEGATION_TERMS for token in tokens)


def has_preceding_negation(text: str, match_start: int) -> bool:
    context = text[max(0, match_start - 32) : match_start]
    tokens = re.findall(r"[a-z]+", context)

    return any(token in NEGATION_TERMS for token in tokens[-3:])


def relabel_row(
    row: pd.Series,
    text_column: str,
    label_column: str,
) -> tuple[str, str]:
    original_label = str(row[label_column])
    normalized_text = normalize_for_keyword_matching(row[text_column])
    negative_hits = find_keyword_hits(normalized_text, STRONG_NEGATIVE_KEYWORDS)
    positive_hits = find_keyword_hits(normalized_text, STRONG_POSITIVE_KEYWORDS)

    if original_label not in VALID_SENTIMENT_LABELS:
        raise ValueError(f"Invalid sentiment label: {original_label!r}")

    if original_label == "Neutral":
        if negative_hits and not positive_hits:
            return "Negative", build_reason("neutral_to_negative", negative_hits)

        if positive_hits and not negative_hits:
            return "Positive", build_reason("neutral_to_positive", positive_hits)

        if negative_hits and positive_hits:
            mixed_hits = [*negative_hits, *positive_hits]
            return original_label, build_reason("audit_mixed_signals", mixed_hits)

        return original_label, "unchanged_neutral_no_strong_signal"

    if original_label == "Negative" and positive_hits and not negative_hits:
        return original_label, build_reason(
            "audit_positive_signal_in_negative",
            positive_hits,
        )

    if original_label == "Positive" and negative_hits and not positive_hits:
        return original_label, build_reason(
            "audit_negative_signal_in_positive",
            negative_hits,
        )

    return original_label, f"unchanged_{original_label.lower()}"


def build_reason(reason_type: str, hits: list[str]) -> str:
    compact_hits = ", ".join(hits[:5])

    return f"{reason_type}: {compact_hits}"


def apply_relabeling(
    dataframe: pd.DataFrame,
    text_column: str,
    label_column: str,
    output_label_column: str,
) -> pd.DataFrame:
    validate_columns(dataframe, [text_column, label_column])

    relabeled = dataframe.copy()
    results = relabeled.apply(
        lambda row: relabel_row(row, text_column, label_column),
        axis=1,
        result_type="expand",
    )
    relabeled[output_label_column] = results[0]
    relabeled["relabel_reason"] = results[1]

    return relabeled


def validate_columns(dataframe: pd.DataFrame, columns: list[str]) -> None:
    missing_columns = [column for column in columns if column not in dataframe.columns]

    if missing_columns:
        raise ValueError(f"Missing required columns: {', '.join(missing_columns)}")


def build_distribution(dataframe: pd.DataFrame, label_column: str) -> pd.DataFrame:
    counts = (
        dataframe[label_column]
        .value_counts()
        .reindex(VALID_SENTIMENT_LABELS, fill_value=0)
    )

    return pd.DataFrame(
        {
            "sentiment_label": list(counts.index),
            "count": [int(count) for count in counts.values],
        }
    )


def build_summary(
    dataframe: pd.DataFrame,
    label_column: str,
    output_label_column: str,
) -> dict[str, object]:
    changed_mask = dataframe[label_column] != dataframe[output_label_column]
    audit_mask = dataframe["relabel_reason"].str.startswith("audit_", na=False)
    total_rows = int(len(dataframe))
    changed_count = int(changed_mask.sum())
    summary: dict[str, object] = {
        "total_rows": total_rows,
        "changed_label_count": changed_count,
        "changed_label_percentage": round(changed_count / total_rows * 100, 4)
        if total_rows
        else 0.0,
        "audit_candidate_count": int(audit_mask.sum()),
        "label_distribution_before": distribution_to_dict(
            build_distribution(dataframe, label_column)
        ),
        "label_distribution_after": distribution_to_dict(
            build_distribution(dataframe, output_label_column)
        ),
        "generated_at": datetime.now(timezone.utc).isoformat(),
    }

    if "rating" in dataframe.columns:
        rating_values = pd.to_numeric(dataframe["rating"], errors="coerce")
        summary["rating_3_changed_count"] = int(
            (changed_mask & rating_values.eq(3)).sum()
        )

    return summary


def distribution_to_dict(distribution: pd.DataFrame) -> dict[str, int]:
    return {
        str(row["sentiment_label"]): int(row["count"])
        for row in distribution.to_dict(orient="records")
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


def save_relabeling_metrics(
    dataframe: pd.DataFrame,
    label_column: str,
    output_label_column: str,
    summary: dict[str, object],
    metrics_dir: Path,
) -> list[Path]:
    before_distribution = build_distribution(dataframe, label_column)
    after_distribution = build_distribution(dataframe, output_label_column)
    summary_path = metrics_dir / "relabeling_summary.json"
    generated_paths = []
    generated_paths.extend(
        save_dataframe_metric(
            before_distribution,
            metrics_dir / "label_distribution_before_relabeling.csv",
            metrics_dir / "label_distribution_before_relabeling.json",
        )
    )
    generated_paths.extend(
        save_dataframe_metric(
            after_distribution,
            metrics_dir / "label_distribution_after_relabeling.csv",
            metrics_dir / "label_distribution_after_relabeling.json",
        )
    )
    generated_paths.append(save_summary(summary, summary_path))

    return generated_paths


def create_label_distribution_figure(
    distribution: pd.DataFrame,
    output_path: Path,
    title: str,
) -> Path:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    plt.figure(figsize=(8, 5))
    plt.bar(
        distribution["sentiment_label"],
        distribution["count"],
        color="#2f6f9f",
    )
    plt.title(title)
    plt.xlabel("Sentiment Label")
    plt.ylabel("Review Count")
    plt.tight_layout()
    plt.savefig(output_path)
    plt.close()

    return output_path


def create_relabeling_change_figure(
    dataframe: pd.DataFrame,
    label_column: str,
    output_label_column: str,
    output_path: Path,
) -> Path:
    changed_count = int(
        (dataframe[label_column] != dataframe[output_label_column]).sum()
    )
    unchanged_count = int(len(dataframe) - changed_count)
    audit_count = int(
        dataframe["relabel_reason"].str.startswith("audit_", na=False).sum()
    )

    output_path.parent.mkdir(parents=True, exist_ok=True)
    plt.figure(figsize=(8, 5))
    plt.bar(
        ["Unchanged", "Changed", "Audit candidates"],
        [unchanged_count, changed_count, audit_count],
        color=["#8c8c8c", "#2f6f9f", "#b7791f"],
    )
    plt.title("Keyword Relabeling Change Summary")
    plt.xlabel("Relabeling Status")
    plt.ylabel("Review Count")
    plt.tight_layout()
    plt.savefig(output_path)
    plt.close()

    return output_path


def save_relabeling_figures(
    dataframe: pd.DataFrame,
    label_column: str,
    output_label_column: str,
    figures_dir: Path,
) -> list[Path]:
    before_distribution = build_distribution(dataframe, label_column)
    after_distribution = build_distribution(dataframe, output_label_column)

    return [
        create_label_distribution_figure(
            before_distribution,
            figures_dir / "label_distribution_before_relabeling.png",
            "Label Distribution Before Relabeling",
        ),
        create_label_distribution_figure(
            after_distribution,
            figures_dir / "label_distribution_after_relabeling.png",
            "Label Distribution After Relabeling",
        ),
        create_relabeling_change_figure(
            dataframe,
            label_column,
            output_label_column,
            figures_dir / "relabeling_change_summary.png",
        ),
    ]


def main() -> None:
    args = parse_args()
    summary_output = args.summary_output

    if summary_output is None:
        summary_output = args.metrics_dir / "relabeling_summary.json"

    dataframe = pd.read_csv(args.input)
    relabeled_dataframe = apply_relabeling(
        dataframe=dataframe,
        text_column=args.text_column,
        label_column=args.label_column,
        output_label_column=args.output_label_column,
    )
    summary = build_summary(
        dataframe=relabeled_dataframe,
        label_column=args.label_column,
        output_label_column=args.output_label_column,
    )

    args.output.parent.mkdir(parents=True, exist_ok=True)
    relabeled_dataframe.to_csv(args.output, index=False)
    metrics = save_relabeling_metrics(
        dataframe=relabeled_dataframe,
        label_column=args.label_column,
        output_label_column=args.output_label_column,
        summary=summary,
        metrics_dir=args.metrics_dir,
    )
    figures = save_relabeling_figures(
        dataframe=relabeled_dataframe,
        label_column=args.label_column,
        output_label_column=args.output_label_column,
        figures_dir=args.figures_dir,
    )

    if summary_output != args.metrics_dir / "relabeling_summary.json":
        save_summary(summary, summary_output)

    print(
        json.dumps(
            {
                "output": str(args.output),
                "summary_output": str(summary_output),
                "metrics": [str(path) for path in metrics],
                "figures": [str(path) for path in figures],
                "summary": summary,
            },
            indent=2,
            sort_keys=True,
        )
    )


if __name__ == "__main__":
    main()
