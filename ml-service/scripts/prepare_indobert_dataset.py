"""Prepare stratified local CSV splits for IndoBERT sentiment modeling."""

from __future__ import annotations

import argparse
import json
from datetime import datetime, timezone
from pathlib import Path

import matplotlib
import pandas as pd
from sklearn.model_selection import train_test_split

matplotlib.use("Agg")
import matplotlib.pyplot as plt

LABEL_MAPPING = {
    "Negative": 0,
    "Neutral": 1,
    "Positive": 2,
}
DEFAULT_INPUT = Path("../datasets/processed/reviews_final.csv")
DEFAULT_OUTPUT_DIR = Path("../datasets/processed/indobert")
DEFAULT_SUMMARY_OUTPUT = Path(
    "../datasets/outputs/eda/03_indobert/indobert_dataset_summary.json"
)
DEFAULT_METRICS_DIR = Path("../datasets/outputs/eda/03_indobert")
DEFAULT_FIGURES_DIR = Path("../docs/figures/03_indobert")
OUTPUT_COLUMNS = [
    "external_id",
    "rating",
    "content",
    "initial_sentiment",
    "final_sentiment",
    "text_indobert",
    "reviewed_at",
    "source",
    "app_id",
    "label_id",
]
TRAINING_CONFIG_PLAN = {
    "model_name": "indobenchmark/indobert-base-p1",
    "max_length": 128,
    "batch_size": 16,
    "learning_rate": 2e-5,
    "epochs": 3,
    "evaluation_strategy": "epoch",
    "save_strategy": "epoch",
    "metric_for_best_model": "f1_macro",
    "early_stopping": "planned for Phase 8B if feasible",
}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=(
            "Prepare IndoBERT sentiment train, validation, and test CSV splits "
            "without downloading models or running training."
        )
    )
    parser.add_argument("--input", type=Path, default=DEFAULT_INPUT)
    parser.add_argument("--output-dir", type=Path, default=DEFAULT_OUTPUT_DIR)
    parser.add_argument("--text-column", default="text_indobert")
    parser.add_argument("--label-column", default="final_sentiment")
    parser.add_argument("--test-size", type=float, default=0.15)
    parser.add_argument("--val-size", type=float, default=0.15)
    parser.add_argument("--random-state", type=int, default=42)
    parser.add_argument("--summary-output", type=Path, default=DEFAULT_SUMMARY_OUTPUT)

    return parser.parse_args()


def validate_args(test_size: float, val_size: float) -> None:
    if not 0 < test_size < 1:
        raise ValueError("--test-size must be between 0 and 1")

    if not 0 < val_size < 1:
        raise ValueError("--val-size must be between 0 and 1")

    if test_size + val_size >= 1:
        raise ValueError("--test-size plus --val-size must be less than 1")


def validate_columns(dataframe: pd.DataFrame, columns: list[str]) -> None:
    missing_columns = [column for column in columns if column not in dataframe.columns]

    if missing_columns:
        raise ValueError(f"Missing required columns: {', '.join(missing_columns)}")


def prepare_dataset(
    dataframe: pd.DataFrame,
    text_column: str,
    label_column: str,
) -> tuple[pd.DataFrame, dict[str, int]]:
    validate_columns(dataframe, [text_column, label_column])
    initial_rows = int(len(dataframe))
    valid_label_mask = dataframe[label_column].isin(LABEL_MAPPING)
    valid_label_rows = dataframe[valid_label_mask].copy()
    valid_label_rows[text_column] = valid_label_rows[text_column].fillna("").astype(str)
    non_empty_text_mask = valid_label_rows[text_column].str.strip().ne("")
    prepared = valid_label_rows[non_empty_text_mask].copy()
    prepared["label_id"] = prepared[label_column].map(LABEL_MAPPING).astype(int)

    validation_counts = {
        "initial_rows": initial_rows,
        "invalid_label_rows_removed": int((~valid_label_mask).sum()),
        "empty_text_rows_removed": int((~non_empty_text_mask).sum()),
        "valid_rows": int(len(prepared)),
    }

    return select_output_columns(prepared), validation_counts


def select_output_columns(dataframe: pd.DataFrame) -> pd.DataFrame:
    selected_columns = [column for column in OUTPUT_COLUMNS if column in dataframe]
    extra_columns = [
        column for column in dataframe.columns if column not in selected_columns
    ]

    return dataframe[selected_columns + extra_columns].copy()


def create_stratified_splits(
    dataframe: pd.DataFrame,
    label_column: str,
    test_size: float,
    val_size: float,
    random_state: int,
) -> dict[str, pd.DataFrame]:
    train_validation, test = train_test_split(
        dataframe,
        test_size=test_size,
        stratify=dataframe[label_column],
        random_state=random_state,
    )
    adjusted_validation_size = val_size / (1 - test_size)
    train, validation = train_test_split(
        train_validation,
        test_size=adjusted_validation_size,
        stratify=train_validation[label_column],
        random_state=random_state,
    )

    return {
        "train": train.reset_index(drop=True),
        "validation": validation.reset_index(drop=True),
        "test": test.reset_index(drop=True),
    }


def build_label_distribution(
    dataframe: pd.DataFrame,
    label_column: str,
) -> pd.DataFrame:
    counts = dataframe[label_column].value_counts().reindex(
        LABEL_MAPPING.keys(),
        fill_value=0,
    )

    return pd.DataFrame(
        {
            "label": list(counts.index),
            "label_id": [LABEL_MAPPING[label] for label in counts.index],
            "count": [int(count) for count in counts.values],
        }
    )


def build_split_distribution(
    splits: dict[str, pd.DataFrame],
    label_column: str,
) -> pd.DataFrame:
    rows = []

    for split_name, split_dataframe in splits.items():
        counts = split_dataframe[label_column].value_counts().reindex(
            LABEL_MAPPING.keys(),
            fill_value=0,
        )

        for label, count in counts.items():
            rows.append(
                {
                    "split": split_name,
                    "label": label,
                    "label_id": LABEL_MAPPING[label],
                    "count": int(count),
                }
            )

    return pd.DataFrame(rows)


def build_text_length_summary(dataframe: pd.DataFrame, text_column: str) -> dict[str, object]:
    text_lengths = dataframe[text_column].fillna("").astype(str).str.len()

    return {
        "count": int(text_lengths.count()),
        "min": int(text_lengths.min()),
        "median": float(text_lengths.median()),
        "mean": float(text_lengths.mean()),
        "max": int(text_lengths.max()),
    }


def build_summary(
    prepared_dataframe: pd.DataFrame,
    splits: dict[str, pd.DataFrame],
    validation_counts: dict[str, int],
    text_column: str,
    label_column: str,
    test_size: float,
    val_size: float,
    random_state: int,
) -> dict[str, object]:
    split_sizes = {
        split_name: int(len(split_dataframe))
        for split_name, split_dataframe in splits.items()
    }

    return {
        **validation_counts,
        "label_column": label_column,
        "text_column": text_column,
        "label_mapping": LABEL_MAPPING,
        "split_sizes": split_sizes,
        "test_size": test_size,
        "validation_size": val_size,
        "train_size": round(1 - test_size - val_size, 6),
        "random_state": random_state,
        "label_distribution": distribution_to_records(
            build_label_distribution(prepared_dataframe, label_column)
        ),
        "split_distribution": distribution_to_records(
            build_split_distribution(splits, label_column)
        ),
        "text_length_summary": build_text_length_summary(
            prepared_dataframe,
            text_column,
        ),
        "training_config_plan": TRAINING_CONFIG_PLAN,
        "generated_at": datetime.now(timezone.utc).isoformat(),
    }


def distribution_to_records(dataframe: pd.DataFrame) -> list[dict[str, object]]:
    return json.loads(dataframe.to_json(orient="records"))


def save_splits_and_mapping(
    splits: dict[str, pd.DataFrame],
    output_dir: Path,
) -> list[Path]:
    output_dir.mkdir(parents=True, exist_ok=True)
    output_paths = []

    for split_name, split_dataframe in splits.items():
        output_path = output_dir / f"{split_name}.csv"
        split_dataframe.to_csv(output_path, index=False)
        output_paths.append(output_path)

    label_mapping_path = output_dir / "label_mapping.json"
    label_mapping_path.write_text(
        json.dumps(LABEL_MAPPING, indent=2, sort_keys=True),
        encoding="utf-8",
    )
    output_paths.append(label_mapping_path)

    return output_paths


def save_dataframe_metric(
    dataframe: pd.DataFrame,
    csv_path: Path,
    json_path: Path,
) -> list[Path]:
    csv_path.parent.mkdir(parents=True, exist_ok=True)
    dataframe.to_csv(csv_path, index=False)
    json_path.write_text(
        json.dumps(distribution_to_records(dataframe), indent=2),
        encoding="utf-8",
    )

    return [csv_path, json_path]


def save_json_metric(data: dict[str, object], output_path: Path) -> Path:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(
        json.dumps(data, indent=2, sort_keys=True),
        encoding="utf-8",
    )

    return output_path


def save_metrics(
    prepared_dataframe: pd.DataFrame,
    splits: dict[str, pd.DataFrame],
    summary: dict[str, object],
    text_column: str,
    label_column: str,
    metrics_dir: Path,
    summary_output: Path,
) -> list[Path]:
    label_distribution = build_label_distribution(prepared_dataframe, label_column)
    split_distribution = build_split_distribution(splits, label_column)
    text_length_summary = build_text_length_summary(prepared_dataframe, text_column)
    generated_paths = [save_json_metric(summary, summary_output)]
    generated_paths.extend(
        save_dataframe_metric(
            label_distribution,
            metrics_dir / "indobert_label_distribution.csv",
            metrics_dir / "indobert_label_distribution.json",
        )
    )
    generated_paths.extend(
        save_dataframe_metric(
            split_distribution,
            metrics_dir / "indobert_split_distribution.csv",
            metrics_dir / "indobert_split_distribution.json",
        )
    )
    generated_paths.append(
        save_json_metric(
            text_length_summary,
            metrics_dir / "indobert_text_length_summary.json",
        )
    )

    return generated_paths


def save_label_distribution_figure(
    dataframe: pd.DataFrame,
    label_column: str,
    figures_dir: Path,
) -> Path:
    distribution = build_label_distribution(dataframe, label_column)
    output_path = figures_dir / "indobert_label_distribution.png"
    figures_dir.mkdir(parents=True, exist_ok=True)

    plt.figure(figsize=(8, 5))
    plt.bar(distribution["label"], distribution["count"], color="#2f6f9f")
    plt.title("IndoBERT Label Distribution")
    plt.xlabel("Sentiment Label")
    plt.ylabel("Review Count")
    plt.tight_layout()
    plt.savefig(output_path)
    plt.close()

    return output_path


def save_split_distribution_figure(
    splits: dict[str, pd.DataFrame],
    label_column: str,
    figures_dir: Path,
) -> Path:
    distribution = build_split_distribution(splits, label_column)
    pivot = distribution.pivot(index="split", columns="label", values="count")
    output_path = figures_dir / "indobert_split_distribution.png"
    figures_dir.mkdir(parents=True, exist_ok=True)

    pivot.plot(kind="bar", stacked=False, figsize=(9, 5))
    plt.title("IndoBERT Split Distribution")
    plt.xlabel("Dataset Split")
    plt.ylabel("Review Count")
    plt.xticks(rotation=0)
    plt.tight_layout()
    plt.savefig(output_path)
    plt.close()

    return output_path


def save_text_length_distribution_figure(
    dataframe: pd.DataFrame,
    text_column: str,
    figures_dir: Path,
) -> Path:
    output_path = figures_dir / "indobert_text_length_distribution.png"
    text_lengths = dataframe[text_column].fillna("").astype(str).str.len()
    figures_dir.mkdir(parents=True, exist_ok=True)

    plt.figure(figsize=(8, 5))
    plt.hist(text_lengths, bins=40, color="#2f6f9f", edgecolor="white")
    plt.title("IndoBERT Text Length Distribution")
    plt.xlabel("Character Count")
    plt.ylabel("Review Count")
    plt.tight_layout()
    plt.savefig(output_path)
    plt.close()

    return output_path


def save_figures(
    prepared_dataframe: pd.DataFrame,
    splits: dict[str, pd.DataFrame],
    text_column: str,
    label_column: str,
    figures_dir: Path,
) -> list[Path]:
    return [
        save_label_distribution_figure(prepared_dataframe, label_column, figures_dir),
        save_split_distribution_figure(splits, label_column, figures_dir),
        save_text_length_distribution_figure(prepared_dataframe, text_column, figures_dir),
    ]


def main() -> None:
    args = parse_args()
    validate_args(args.test_size, args.val_size)
    dataframe = pd.read_csv(args.input)
    prepared_dataframe, validation_counts = prepare_dataset(
        dataframe=dataframe,
        text_column=args.text_column,
        label_column=args.label_column,
    )
    splits = create_stratified_splits(
        dataframe=prepared_dataframe,
        label_column=args.label_column,
        test_size=args.test_size,
        val_size=args.val_size,
        random_state=args.random_state,
    )
    summary = build_summary(
        prepared_dataframe=prepared_dataframe,
        splits=splits,
        validation_counts=validation_counts,
        text_column=args.text_column,
        label_column=args.label_column,
        test_size=args.test_size,
        val_size=args.val_size,
        random_state=args.random_state,
    )
    metrics_dir = args.summary_output.parent
    split_outputs = save_splits_and_mapping(splits, args.output_dir)
    metric_outputs = save_metrics(
        prepared_dataframe=prepared_dataframe,
        splits=splits,
        summary=summary,
        text_column=args.text_column,
        label_column=args.label_column,
        metrics_dir=metrics_dir,
        summary_output=args.summary_output,
    )
    figure_outputs = save_figures(
        prepared_dataframe=prepared_dataframe,
        splits=splits,
        text_column=args.text_column,
        label_column=args.label_column,
        figures_dir=DEFAULT_FIGURES_DIR,
    )

    print(
        json.dumps(
            {
                "split_outputs": [str(path) for path in split_outputs],
                "metric_outputs": [str(path) for path in metric_outputs],
                "figure_outputs": [str(path) for path in figure_outputs],
                "summary": summary,
            },
            indent=2,
            sort_keys=True,
        )
    )


if __name__ == "__main__":
    main()
