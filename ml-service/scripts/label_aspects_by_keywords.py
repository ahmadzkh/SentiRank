"""Create weak aspect labels using an exploratory keyword taxonomy."""

from __future__ import annotations

import argparse
import json
import re
from collections import OrderedDict
from datetime import datetime, timezone
from pathlib import Path

import matplotlib
import pandas as pd

matplotlib.use("Agg")
import matplotlib.pyplot as plt

METHODOLOGY_NOTE = (
    "Weak aspect labels are generated using keyword dictionaries for "
    "exploratory SVM preparation and are not expert-validated ground truth."
)
DEFAULT_METRICS_DIR = Path("../datasets/outputs/eda/02_preprocessing")
DEFAULT_FIGURES_DIR = Path("../docs/figures/02_preprocessing")
DEFAULT_SENTIMENT_COLUMN = "final_sentiment"
GENERAL_ASPECT = "General"
ACTIONABLE_ASPECTS = (
    "Performance & Stability",
    "Ads Experience",
    "Subscription & Pricing",
    "Features & Content",
    "Audio Quality",
    "UI/UX",
    "Account/Login",
)
ASPECT_KEYWORDS: OrderedDict[str, tuple[str, ...]] = OrderedDict(
    {
        "Performance & Stability": (
            "lemot",
            "lambat",
            "loading",
            "lag",
            "nge lag",
            "berat",
            "error",
            "bug",
            "crash",
            "force close",
            "keluar sendiri",
            "macet",
            "tidak bisa dibuka",
            "berhenti sendiri",
            "sering keluar",
        ),
        "Ads Experience": (
            "iklan",
            "ads",
            "promosi",
            "ganggu",
            "mengganggu",
            "terlalu banyak iklan",
            "kebanyakan iklan",
            "iklannya",
        ),
        "Subscription & Pricing": (
            "premium",
            "langganan",
            "bayar",
            "mahal",
            "gratis",
            "paket",
            "subscription",
            "pembayaran",
            "harga",
        ),
        "Features & Content": (
            "fitur",
            "shuffle",
            "playlist",
            "lirik",
            "download",
            "rekomendasi",
            "podcast",
            "equalizer",
            "lagu",
            "musik",
            "album",
            "artis",
            "konten",
            "library",
            "koleksi",
        ),
        "Audio Quality": (
            "suara",
            "audio",
            "kualitas lagu",
            "kualitas suara",
            "jernih",
            "volume",
            "bass",
            "noise",
            "putus putus",
        ),
        "UI/UX": (
            "tampilan",
            "ui",
            "ux",
            "interface",
            "desain",
            "menu",
            "navigasi",
            "tombol",
            "layout",
            "mudah digunakan",
            "sulit digunakan",
        ),
        "Account/Login": (
            "login",
            "akun",
            "daftar",
            "masuk",
            "logout",
            "password",
            "email",
            "verifikasi",
            "tidak bisa login",
            "gagal login",
        ),
    }
)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=(
            "Assign weak aspect labels using a draft keyword taxonomy for "
            "exploratory SVM preparation."
        )
    )
    parser.add_argument("--input", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--text-column", default="text_svm")
    parser.add_argument("--aspect-column", default="aspect_label")
    parser.add_argument("--summary-output", type=Path, required=True)

    return parser.parse_args()


def normalize_for_matching(value: object) -> str:
    text = "" if pd.isna(value) else str(value).lower()
    text = re.sub(r"[-_/]+", " ", text)
    text = re.sub(r"\s+", " ", text)

    return text.strip()


def build_keyword_pattern(keyword: str) -> str:
    normalized_keyword = normalize_for_matching(keyword)
    escaped_keyword = re.escape(normalized_keyword).replace(r"\ ", r"\s+")

    return rf"(?<!\w){escaped_keyword}(?!\w)"


def find_keyword_hits(text: str, keywords: tuple[str, ...]) -> list[str]:
    hits = []

    for keyword in keywords:
        if re.search(build_keyword_pattern(keyword), text):
            hits.append(keyword)

    return hits


def score_aspects(text: str) -> dict[str, list[str]]:
    return {
        aspect: find_keyword_hits(text, keywords)
        for aspect, keywords in ASPECT_KEYWORDS.items()
    }


def choose_aspect(scored_hits: dict[str, list[str]]) -> tuple[str, str]:
    best_aspect = GENERAL_ASPECT
    best_hits: list[str] = []

    for aspect in ACTIONABLE_ASPECTS:
        hits = scored_hits[aspect]

        if len(hits) > len(best_hits):
            best_aspect = aspect
            best_hits = hits

    if not best_hits:
        return GENERAL_ASPECT, "fallback_no_keyword_match"

    compact_hits = ", ".join(best_hits[:5])

    return best_aspect, f"matched_keywords: {compact_hits}"


def validate_columns(dataframe: pd.DataFrame, columns: list[str]) -> None:
    missing_columns = [column for column in columns if column not in dataframe.columns]

    if missing_columns:
        raise ValueError(f"Missing required columns: {', '.join(missing_columns)}")


def label_dataframe(
    dataframe: pd.DataFrame,
    text_column: str,
    aspect_column: str,
) -> pd.DataFrame:
    validate_columns(dataframe, [text_column])
    labeled_dataframe = dataframe.copy()
    labels = []
    reasons = []

    for value in labeled_dataframe[text_column].fillna(""):
        text = normalize_for_matching(value)
        aspect, reason = choose_aspect(score_aspects(text))
        labels.append(aspect)
        reasons.append(reason)

    labeled_dataframe[aspect_column] = labels
    labeled_dataframe["aspect_label_reason"] = reasons

    return labeled_dataframe


def build_aspect_distribution(
    dataframe: pd.DataFrame,
    aspect_column: str,
) -> pd.DataFrame:
    aspect_order = [*ACTIONABLE_ASPECTS, GENERAL_ASPECT]
    counts = dataframe[aspect_column].value_counts().reindex(
        aspect_order,
        fill_value=0,
    )

    return pd.DataFrame(
        {
            "aspect_label": list(counts.index),
            "count": [int(count) for count in counts.values],
        }
    )


def build_aspect_by_sentiment_distribution(
    dataframe: pd.DataFrame,
    aspect_column: str,
) -> pd.DataFrame:
    aspect_order = [*ACTIONABLE_ASPECTS, GENERAL_ASPECT]

    if DEFAULT_SENTIMENT_COLUMN not in dataframe.columns:
        distribution = build_aspect_distribution(dataframe, aspect_column)
        distribution[DEFAULT_SENTIMENT_COLUMN] = "Unknown"

        return distribution[[DEFAULT_SENTIMENT_COLUMN, "aspect_label", "count"]]

    grouped = (
        dataframe.groupby([DEFAULT_SENTIMENT_COLUMN, aspect_column])
        .size()
        .reset_index(name="count")
    )
    grouped[aspect_column] = pd.Categorical(
        grouped[aspect_column],
        categories=aspect_order,
        ordered=True,
    )

    return grouped.sort_values([DEFAULT_SENTIMENT_COLUMN, aspect_column]).rename(
        columns={aspect_column: "aspect_label"}
    )


def build_summary(
    dataframe: pd.DataFrame,
    aspect_column: str,
) -> dict[str, object]:
    total_rows = int(len(dataframe))
    general_count = int(dataframe[aspect_column].eq(GENERAL_ASPECT).sum())
    rows_with_keyword_match = int(total_rows - general_count)

    return {
        "total_rows": total_rows,
        "aspect_distribution": distribution_to_dict(
            build_aspect_distribution(dataframe, aspect_column)
        ),
        "general_label_count": general_count,
        "general_label_percentage": round(general_count / total_rows * 100, 4)
        if total_rows
        else 0.0,
        "rows_with_keyword_match": rows_with_keyword_match,
        "rows_without_keyword_match": general_count,
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "methodology_note": METHODOLOGY_NOTE,
    }


def distribution_to_dict(distribution: pd.DataFrame) -> dict[str, int]:
    return {
        str(row["aspect_label"]): int(row["count"])
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


def save_metrics(
    dataframe: pd.DataFrame,
    aspect_column: str,
    summary_output: Path,
    metrics_dir: Path = DEFAULT_METRICS_DIR,
) -> list[Path]:
    aspect_distribution = build_aspect_distribution(dataframe, aspect_column)
    aspect_by_sentiment = build_aspect_by_sentiment_distribution(
        dataframe,
        aspect_column,
    )
    summary = build_summary(dataframe, aspect_column)
    generated_paths = []
    generated_paths.extend(
        save_dataframe_metric(
            aspect_distribution,
            metrics_dir / "aspect_label_distribution.csv",
            metrics_dir / "aspect_label_distribution.json",
        )
    )
    generated_paths.extend(
        save_dataframe_metric(
            aspect_by_sentiment,
            metrics_dir / "aspect_by_sentiment_distribution.csv",
            metrics_dir / "aspect_by_sentiment_distribution.json",
        )
    )
    generated_paths.append(save_summary(summary, summary_output))

    return generated_paths


def save_aspect_distribution_figure(
    aspect_distribution: pd.DataFrame,
    figures_dir: Path = DEFAULT_FIGURES_DIR,
) -> Path:
    output_path = figures_dir / "aspect_label_distribution.png"
    figures_dir.mkdir(parents=True, exist_ok=True)
    ordered_distribution = aspect_distribution.sort_values("count")

    plt.figure(figsize=(9, 6))
    plt.barh(
        ordered_distribution["aspect_label"],
        ordered_distribution["count"],
        color="#2f6f9f",
    )
    plt.title("Weak Aspect Label Distribution")
    plt.xlabel("Review Count")
    plt.ylabel("Aspect Label")
    plt.tight_layout()
    plt.savefig(output_path)
    plt.close()

    return output_path


def save_aspect_by_sentiment_figure(
    dataframe: pd.DataFrame,
    aspect_column: str,
    figures_dir: Path = DEFAULT_FIGURES_DIR,
) -> Path:
    output_path = figures_dir / "aspect_by_sentiment_distribution.png"
    figures_dir.mkdir(parents=True, exist_ok=True)
    aspect_order = [*ACTIONABLE_ASPECTS, GENERAL_ASPECT]

    if DEFAULT_SENTIMENT_COLUMN not in dataframe.columns:
        return save_aspect_distribution_figure(
            build_aspect_distribution(dataframe, aspect_column),
            figures_dir,
        )

    pivot = (
        dataframe.groupby([aspect_column, DEFAULT_SENTIMENT_COLUMN])
        .size()
        .unstack(fill_value=0)
        .reindex(aspect_order, fill_value=0)
    )
    pivot.plot(kind="bar", stacked=True, figsize=(10, 6))
    plt.title("Weak Aspect Labels by Final Sentiment")
    plt.xlabel("Aspect Label")
    plt.ylabel("Review Count")
    plt.xticks(rotation=35, ha="right")
    plt.tight_layout()
    plt.savefig(output_path)
    plt.close()

    return output_path


def save_figures(dataframe: pd.DataFrame, aspect_column: str) -> list[Path]:
    aspect_distribution = build_aspect_distribution(dataframe, aspect_column)

    return [
        save_aspect_distribution_figure(aspect_distribution),
        save_aspect_by_sentiment_figure(dataframe, aspect_column),
    ]


def main() -> None:
    args = parse_args()
    dataframe = pd.read_csv(args.input)
    labeled_dataframe = label_dataframe(
        dataframe=dataframe,
        text_column=args.text_column,
        aspect_column=args.aspect_column,
    )

    args.output.parent.mkdir(parents=True, exist_ok=True)
    labeled_dataframe.to_csv(args.output, index=False)

    metrics = save_metrics(
        dataframe=labeled_dataframe,
        aspect_column=args.aspect_column,
        summary_output=args.summary_output,
    )
    figures = save_figures(labeled_dataframe, args.aspect_column)
    summary = build_summary(labeled_dataframe, args.aspect_column)

    print(
        json.dumps(
            {
                "output": str(args.output),
                "summary_output": str(args.summary_output),
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
