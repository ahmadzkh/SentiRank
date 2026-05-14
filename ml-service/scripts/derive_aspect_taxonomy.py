"""Derive exploratory aspect taxonomy candidate terms from processed reviews."""

from __future__ import annotations

import argparse
import json
import re
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path

import matplotlib
import pandas as pd

matplotlib.use("Agg")
import matplotlib.pyplot as plt

METHODOLOGY_NOTE = (
    "Candidate aspects are derived from exploratory analysis of user reviews and "
    "must be validated through expert judgement before being used as final "
    "AHP/Fuzzy AHP criteria."
)
GENERAL_FALLBACK_METHODOLOGY_NOTE = (
    "General fallback rows are analyzed to identify uncovered themes for weak "
    "label refinement. These terms are exploratory and must not be treated as "
    "expert-validated aspect criteria."
)
DEFAULT_FIGURES_DIR = Path("../docs/figures/02_preprocessing")
MIN_TOKEN_LENGTH = 3
TOKEN_EXCEPTIONS = {"ui", "ux"}
STOPWORDS = {
    "ada",
    "agar",
    "aja",
    "akan",
    "aku",
    "anda",
    "apa",
    "aplikasi",
    "atau",
    "bagi",
    "banget",
    "banyak",
    "baru",
    "bisa",
    "buat",
    "dalam",
    "dan",
    "dari",
    "dengan",
    "di",
    "dia",
    "dulu",
    "emoji",
    "harus",
    "ini",
    "itu",
    "jadi",
    "jangan",
    "juga",
    "kalau",
    "karena",
    "ke",
    "kok",
    "lagi",
    "lebih",
    "masih",
    "mau",
    "mohon",
    "nya",
    "pada",
    "pake",
    "pakai",
    "para",
    "saat",
    "saja",
    "saya",
    "semua",
    "spotify",
    "sudah",
    "supaya",
    "tapi",
    "terus",
    "tidak",
    "untuk",
    "yang",
}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=(
            "Analyze focused processed review text to derive exploratory aspect "
            "taxonomy candidate terms."
        )
    )
    parser.add_argument("--input", type=Path, required=True)
    parser.add_argument("--output-summary", type=Path, required=True)
    parser.add_argument("--output-keywords", type=Path, required=True)
    parser.add_argument("--text-column", default="text_svm")
    parser.add_argument("--label-column", default="final_sentiment")
    parser.add_argument("--focus-labels", default="Negative,Neutral")
    parser.add_argument("--focus-aspect", default=None)
    parser.add_argument("--aspect-column", default="aspect_label")
    parser.add_argument("--top-n", type=int, default=100)

    return parser.parse_args()


def parse_focus_labels(value: str) -> list[str]:
    labels = [label.strip() for label in value.split(",") if label.strip()]

    if not labels:
        raise ValueError("--focus-labels must contain at least one label")

    return labels


def validate_columns(dataframe: pd.DataFrame, columns: list[str]) -> None:
    missing_columns = [column for column in columns if column not in dataframe.columns]

    if missing_columns:
        raise ValueError(f"Missing required columns: {', '.join(missing_columns)}")


def tokenize_text(value: object) -> list[str]:
    text = "" if pd.isna(value) else str(value).lower()
    raw_tokens = re.findall(r"[a-z0-9_]+", text)

    return [
        token
        for token in raw_tokens
        if is_meaningful_token(token)
    ]


def is_meaningful_token(token: str) -> bool:
    if token in STOPWORDS:
        return False

    if token.isdigit():
        return False

    return len(token) >= MIN_TOKEN_LENGTH or token in TOKEN_EXCEPTIONS


def count_terms(texts: pd.Series) -> tuple[Counter[str], Counter[str]]:
    unigram_counts: Counter[str] = Counter()
    bigram_counts: Counter[str] = Counter()

    for text in texts.fillna(""):
        tokens = tokenize_text(text)
        unigram_counts.update(tokens)
        bigram_counts.update(
            f"{left} {right}" for left, right in zip(tokens, tokens[1:])
        )

    return unigram_counts, bigram_counts


def build_candidate_terms_dataframe(
    unigram_counts: Counter[str],
    bigram_counts: Counter[str],
    focus_labels: list[str],
    text_column: str,
    top_n: int,
) -> pd.DataFrame:
    rows = []
    focus_label_text = ",".join(focus_labels)

    for term, count in unigram_counts.most_common(top_n):
        rows.append(
            {
                "term": term,
                "term_type": "unigram",
                "count": int(count),
                "focus_labels": focus_label_text,
                "text_column": text_column,
            }
        )

    for term, count in bigram_counts.most_common(top_n):
        rows.append(
            {
                "term": term,
                "term_type": "bigram",
                "count": int(count),
                "focus_labels": focus_label_text,
                "text_column": text_column,
            }
        )

    return pd.DataFrame(
        rows,
        columns=["term", "term_type", "count", "focus_labels", "text_column"],
    )


def build_general_fallback_terms_dataframe(
    general_unigrams: Counter[str],
    general_bigrams: Counter[str],
    negative_unigrams: Counter[str],
    negative_bigrams: Counter[str],
    neutral_unigrams: Counter[str],
    neutral_bigrams: Counter[str],
    focus_aspect: str,
    text_column: str,
    top_n: int,
) -> pd.DataFrame:
    rows = []

    add_term_rows(
        rows=rows,
        counts=general_unigrams,
        subset="general",
        term_type="unigram",
        focus_aspect=focus_aspect,
        text_column=text_column,
        top_n=top_n,
    )
    add_term_rows(
        rows=rows,
        counts=general_bigrams,
        subset="general",
        term_type="bigram",
        focus_aspect=focus_aspect,
        text_column=text_column,
        top_n=top_n,
    )
    add_term_rows(
        rows=rows,
        counts=negative_unigrams,
        subset="general_negative",
        term_type="unigram",
        focus_aspect=focus_aspect,
        text_column=text_column,
        top_n=top_n,
    )
    add_term_rows(
        rows=rows,
        counts=negative_bigrams,
        subset="general_negative",
        term_type="bigram",
        focus_aspect=focus_aspect,
        text_column=text_column,
        top_n=top_n,
    )
    add_term_rows(
        rows=rows,
        counts=neutral_unigrams,
        subset="general_neutral",
        term_type="unigram",
        focus_aspect=focus_aspect,
        text_column=text_column,
        top_n=top_n,
    )
    add_term_rows(
        rows=rows,
        counts=neutral_bigrams,
        subset="general_neutral",
        term_type="bigram",
        focus_aspect=focus_aspect,
        text_column=text_column,
        top_n=top_n,
    )

    return pd.DataFrame(
        rows,
        columns=[
            "term",
            "term_type",
            "count",
            "subset",
            "focus_aspect",
            "text_column",
        ],
    )


def add_term_rows(
    rows: list[dict[str, object]],
    counts: Counter[str],
    subset: str,
    term_type: str,
    focus_aspect: str,
    text_column: str,
    top_n: int,
) -> None:
    for term, count in counts.most_common(top_n):
        rows.append(
            {
                "term": term,
                "term_type": term_type,
                "count": int(count),
                "subset": subset,
                "focus_aspect": focus_aspect,
                "text_column": text_column,
            }
        )


def build_summary(
    dataframe: pd.DataFrame,
    focused_dataframe: pd.DataFrame,
    focus_labels: list[str],
    unigram_counts: Counter[str],
    bigram_counts: Counter[str],
    top_n: int,
) -> dict[str, object]:
    return {
        "total_rows": int(len(dataframe)),
        "focused_rows": int(len(focused_dataframe)),
        "focus_labels": focus_labels,
        "top_terms": [
            {"term": term, "count": int(count)}
            for term, count in unigram_counts.most_common(top_n)
        ],
        "top_bigrams_if_available": [
            {"term": term, "count": int(count)}
            for term, count in bigram_counts.most_common(top_n)
        ],
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "methodology_note": METHODOLOGY_NOTE,
    }


def build_general_fallback_summary(
    dataframe: pd.DataFrame,
    general_dataframe: pd.DataFrame,
    negative_general_dataframe: pd.DataFrame,
    neutral_general_dataframe: pd.DataFrame,
    general_unigrams: Counter[str],
    general_bigrams: Counter[str],
    top_n: int,
) -> dict[str, object]:
    total_rows = int(len(dataframe))
    general_rows = int(len(general_dataframe))

    return {
        "total_rows": total_rows,
        "general_rows": general_rows,
        "general_percentage": round(general_rows / total_rows * 100, 4)
        if total_rows
        else 0.0,
        "general_negative_rows": int(len(negative_general_dataframe)),
        "general_neutral_rows": int(len(neutral_general_dataframe)),
        "top_general_terms": [
            {"term": term, "count": int(count)}
            for term, count in general_unigrams.most_common(top_n)
        ],
        "top_general_bigrams": [
            {"term": term, "count": int(count)}
            for term, count in general_bigrams.most_common(top_n)
        ],
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "methodology_note": GENERAL_FALLBACK_METHODOLOGY_NOTE,
    }


def save_summary(summary: dict[str, object], output_path: Path) -> Path:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(
        json.dumps(summary, indent=2, sort_keys=True),
        encoding="utf-8",
    )

    return output_path


def save_candidate_terms(dataframe: pd.DataFrame, output_path: Path) -> Path:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    dataframe.to_csv(output_path, index=False)

    return output_path


def save_candidate_terms_figure(
    candidate_terms: pd.DataFrame,
    figures_dir: Path = DEFAULT_FIGURES_DIR,
) -> Path:
    output_path = figures_dir / "aspect_candidate_terms.png"
    figures_dir.mkdir(parents=True, exist_ok=True)
    top_terms = candidate_terms.head(20).sort_values("count")

    plt.figure(figsize=(9, 6))
    plt.barh(top_terms["term"], top_terms["count"], color="#2f6f9f")
    plt.title("Top Aspect Candidate Terms")
    plt.xlabel("Frequency")
    plt.ylabel("Candidate Term")
    plt.tight_layout()
    plt.savefig(output_path)
    plt.close()

    return output_path


def save_general_fallback_terms_figure(
    fallback_terms: pd.DataFrame,
    figures_dir: Path = DEFAULT_FIGURES_DIR,
) -> Path:
    output_path = figures_dir / "general_fallback_top_terms.png"
    figures_dir.mkdir(parents=True, exist_ok=True)
    top_terms = fallback_terms[
        (fallback_terms["subset"] == "general")
        & (fallback_terms["term_type"] == "unigram")
    ].head(20)

    plt.figure(figsize=(9, 6))

    if top_terms.empty:
        plt.text(0.5, 0.5, "No fallback terms available", ha="center", va="center")
        plt.axis("off")
    else:
        top_terms = top_terms.sort_values("count")
        plt.barh(top_terms["term"], top_terms["count"], color="#2f6f9f")
        plt.xlabel("Frequency")
        plt.ylabel("General Fallback Term")

    plt.title("Top General Fallback Terms")
    plt.tight_layout()
    plt.savefig(output_path)
    plt.close()

    return output_path


def run_general_fallback_analysis(args: argparse.Namespace) -> None:
    dataframe = pd.read_csv(args.input)
    validate_columns(dataframe, [args.text_column, args.aspect_column])

    general_dataframe = dataframe[dataframe[args.aspect_column].eq(args.focus_aspect)]

    if args.label_column in dataframe.columns:
        negative_general_dataframe = general_dataframe[
            general_dataframe[args.label_column].eq("Negative")
        ]
        neutral_general_dataframe = general_dataframe[
            general_dataframe[args.label_column].eq("Neutral")
        ]
    else:
        negative_general_dataframe = general_dataframe.iloc[0:0]
        neutral_general_dataframe = general_dataframe.iloc[0:0]

    general_unigrams, general_bigrams = count_terms(general_dataframe[args.text_column])
    negative_unigrams, negative_bigrams = count_terms(
        negative_general_dataframe[args.text_column]
    )
    neutral_unigrams, neutral_bigrams = count_terms(
        neutral_general_dataframe[args.text_column]
    )
    fallback_terms = build_general_fallback_terms_dataframe(
        general_unigrams=general_unigrams,
        general_bigrams=general_bigrams,
        negative_unigrams=negative_unigrams,
        negative_bigrams=negative_bigrams,
        neutral_unigrams=neutral_unigrams,
        neutral_bigrams=neutral_bigrams,
        focus_aspect=args.focus_aspect,
        text_column=args.text_column,
        top_n=args.top_n,
    )
    summary = build_general_fallback_summary(
        dataframe=dataframe,
        general_dataframe=general_dataframe,
        negative_general_dataframe=negative_general_dataframe,
        neutral_general_dataframe=neutral_general_dataframe,
        general_unigrams=general_unigrams,
        general_bigrams=general_bigrams,
        top_n=args.top_n,
    )
    keyword_output = save_candidate_terms(fallback_terms, args.output_keywords)
    summary_output = save_summary(summary, args.output_summary)
    figure_output = save_general_fallback_terms_figure(fallback_terms)

    print(
        json.dumps(
            {
                "output_keywords": str(keyword_output),
                "output_summary": str(summary_output),
                "figure": str(figure_output),
                "general_rows": int(len(general_dataframe)),
                "general_percentage": summary["general_percentage"],
            },
            indent=2,
            sort_keys=True,
        )
    )


def run_default_taxonomy_derivation(args: argparse.Namespace) -> None:
    focus_labels = parse_focus_labels(args.focus_labels)
    dataframe = pd.read_csv(args.input)
    validate_columns(dataframe, [args.text_column, args.label_column])

    focused_dataframe = dataframe[dataframe[args.label_column].isin(focus_labels)]
    unigram_counts, bigram_counts = count_terms(focused_dataframe[args.text_column])
    candidate_terms = build_candidate_terms_dataframe(
        unigram_counts=unigram_counts,
        bigram_counts=bigram_counts,
        focus_labels=focus_labels,
        text_column=args.text_column,
        top_n=args.top_n,
    )
    summary = build_summary(
        dataframe=dataframe,
        focused_dataframe=focused_dataframe,
        focus_labels=focus_labels,
        unigram_counts=unigram_counts,
        bigram_counts=bigram_counts,
        top_n=args.top_n,
    )
    keyword_output = save_candidate_terms(candidate_terms, args.output_keywords)
    summary_output = save_summary(summary, args.output_summary)
    figure_output = save_candidate_terms_figure(candidate_terms)

    print(
        json.dumps(
            {
                "output_keywords": str(keyword_output),
                "output_summary": str(summary_output),
                "figure": str(figure_output),
                "focused_rows": int(len(focused_dataframe)),
            },
            indent=2,
            sort_keys=True,
        )
    )


def main() -> None:
    args = parse_args()

    if args.focus_aspect:
        run_general_fallback_analysis(args)
    else:
        run_default_taxonomy_derivation(args)


if __name__ == "__main__":
    main()
