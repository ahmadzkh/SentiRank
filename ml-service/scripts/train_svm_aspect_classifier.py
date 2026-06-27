"""Train and evaluate SVM aspect classifier scenarios."""

from __future__ import annotations

import argparse
import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Final

import matplotlib
import pandas as pd
from joblib import dump
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    precision_recall_fscore_support,
)
from sklearn.model_selection import train_test_split
from sklearn.pipeline import FeatureUnion, Pipeline
from sklearn.svm import LinearSVC

matplotlib.use("Agg")
import matplotlib.pyplot as plt


DEFAULT_INPUT = Path("../datasets/processed/svm/svm_aspect_dataset.csv")
DEFAULT_OUTPUT_DIR = Path("saved_models/svm")
DEFAULT_SUMMARY_OUTPUT = Path("../datasets/outputs/eda/04_svm/svm_training_summary.json")
DEFAULT_FIGURES_DIR = Path("../docs/figures/04_svm")
SCENARIO_CHOICES: Final[tuple[str, ...]] = (
    "original_7class",
    "merged_5class",
    "both",
)
SCENARIOS: Final[tuple[str, ...]] = ("original_7class", "merged_5class")
ORIGINAL_LABELS: Final[tuple[str, ...]] = (
    "Features & Content",
    "Ads Experience",
    "Subscription & Pricing",
    "Performance & Stability",
    "Account/Login",
    "Audio Quality",
    "UI/UX",
)
MERGED_LABEL_MAP: Final[dict[str, str]] = {
    "Features & Content": "Features, Content & Audio Experience",
    "Audio Quality": "Features, Content & Audio Experience",
    "Performance & Stability": "App Reliability & Usability",
    "UI/UX": "App Reliability & Usability",
    "Ads Experience": "Ads Experience",
    "Subscription & Pricing": "Subscription & Pricing",
    "Account/Login": "Account/Login",
}
METHODOLOGY_NOTE: Final[str] = (
    "SVM aspect classifier experiments use weak labels derived from keyword-based "
    "aspect labeling. Results measure performance against weak labels, not "
    "expert-validated ground truth."
)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=(
            "Train controlled SVM aspect-classification scenarios using TF-IDF "
            "features without modifying source datasets or application layers."
        )
    )
    parser.add_argument("--input", type=Path, default=DEFAULT_INPUT)
    parser.add_argument("--output-dir", type=Path, default=DEFAULT_OUTPUT_DIR)
    parser.add_argument("--text-column", default="text_svm")
    parser.add_argument("--label-column", default="aspect_label")
    parser.add_argument("--scenario", choices=SCENARIO_CHOICES, default="both")
    parser.add_argument("--test-size", type=float, default=0.15)
    parser.add_argument("--val-size", type=float, default=0.15)
    parser.add_argument("--random-state", type=int, default=42)
    parser.add_argument("--summary-output", type=Path, default=DEFAULT_SUMMARY_OUTPUT)

    return parser.parse_args()


def validate_columns(dataframe: pd.DataFrame, columns: list[str]) -> None:
    missing_columns = [column for column in columns if column not in dataframe.columns]
    if missing_columns:
        raise ValueError(f"Missing required columns: {', '.join(missing_columns)}")


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
    save_json(json.loads(dataframe.to_json(orient="records")), json_path)

    return [csv_path, json_path]


def scenario_names(requested_scenario: str) -> list[str]:
    if requested_scenario == "both":
        return list(SCENARIOS)

    return [requested_scenario]


def validate_split_sizes(test_size: float, val_size: float) -> None:
    if not 0 < test_size < 1:
        raise ValueError("--test-size must be between 0 and 1")
    if not 0 < val_size < 1:
        raise ValueError("--val-size must be between 0 and 1")
    if test_size + val_size >= 1:
        raise ValueError("--test-size + --val-size must be less than 1")


def build_target_column(
    dataframe: pd.DataFrame,
    scenario: str,
    label_column: str,
) -> tuple[pd.DataFrame, str, list[str]]:
    prepared = dataframe.copy()

    if scenario == "original_7class":
        target_column = label_column
        labels = [label for label in ORIGINAL_LABELS if label in set(prepared[label_column])]
        prepared = prepared.loc[prepared[label_column].isin(ORIGINAL_LABELS)].copy()
    elif scenario == "merged_5class":
        target_column = "aspect_label_merged"
        prepared[target_column] = prepared[label_column].map(MERGED_LABEL_MAP)
        prepared = prepared.loc[prepared[target_column].notna()].copy()
        labels = sorted(prepared[target_column].unique().tolist())
    else:
        raise ValueError(f"Unsupported scenario: {scenario}")

    return prepared, target_column, labels


def prepare_scenario_dataframe(
    dataframe: pd.DataFrame,
    scenario: str,
    text_column: str,
    label_column: str,
) -> tuple[pd.DataFrame, str, list[str], dict[str, int]]:
    validate_columns(dataframe, [text_column, label_column])

    working = dataframe.copy()
    total_input_rows = int(len(working))
    preprocessing_status_rows_removed = 0

    if "preprocessing_status" in working.columns:
        valid_preprocessing_mask = (
            working["preprocessing_status"].fillna("").astype(str).eq("valid")
        )
        preprocessing_status_rows_removed = int((~valid_preprocessing_mask).sum())
        working = working.loc[valid_preprocessing_mask].copy()

    working[text_column] = working[text_column].fillna("").astype(str).str.strip()
    working = working.loc[working[text_column].ne("")].copy()
    removed_empty_text_count = int(
        total_input_rows - preprocessing_status_rows_removed - len(working)
    )

    working, target_column, labels = build_target_column(
        dataframe=working,
        scenario=scenario,
        label_column=label_column,
    )
    rows_after_label_mapping = int(len(working))
    conflicting_duplicate_text_count = int(
        working.groupby(text_column)[target_column].nunique().gt(1).sum()
    )
    before_dedup = int(len(working))
    working = working.drop_duplicates(subset=[text_column], keep="first").copy()
    duplicate_text_removed_count = before_dedup - int(len(working))
    labels = [label for label in labels if label in set(working[target_column])]
    label_counts = working[target_column].value_counts()

    if any(label_counts[label] < 3 for label in labels):
        raise ValueError(
            f"Scenario {scenario} has a class with fewer than 3 rows after filtering"
        )

    details = {
        "total_input_rows": total_input_rows,
        "preprocessing_status_rows_removed": preprocessing_status_rows_removed,
        "rows_after_preprocessing_status_filter": int(
            total_input_rows - preprocessing_status_rows_removed
        ),
        "removed_empty_text_count": removed_empty_text_count,
        "rows_after_label_mapping": rows_after_label_mapping,
        "duplicate_text_removed_count": duplicate_text_removed_count,
        "conflicting_duplicate_text_count": conflicting_duplicate_text_count,
        "rows_after_deduplication": int(len(working)),
    }

    return working, target_column, labels, details


def split_dataframe(
    dataframe: pd.DataFrame,
    target_column: str,
    test_size: float,
    val_size: float,
    random_state: int,
) -> dict[str, pd.DataFrame]:
    train_validation, test = train_test_split(
        dataframe,
        test_size=test_size,
        random_state=random_state,
        stratify=dataframe[target_column],
    )
    adjusted_val_size = val_size / (1 - test_size)
    train, validation = train_test_split(
        train_validation,
        test_size=adjusted_val_size,
        random_state=random_state,
        stratify=train_validation[target_column],
    )

    return {
        "train": train.reset_index(drop=True),
        "validation": validation.reset_index(drop=True),
        "test": test.reset_index(drop=True),
    }


def build_split_distribution(
    split_dataframes: dict[str, pd.DataFrame],
    target_column: str,
    scenario: str,
) -> pd.DataFrame:
    rows = []

    for split_name, dataframe in split_dataframes.items():
        counts = dataframe[target_column].value_counts().sort_index()
        total = int(counts.sum())
        for label, count in counts.items():
            rows.append(
                {
                    "scenario": scenario,
                    "split": split_name,
                    "label": str(label),
                    "count": int(count),
                    "percentage": float(count / total * 100) if total else 0.0,
                }
            )

    return pd.DataFrame(rows)


def build_pipeline(random_state: int) -> Pipeline:
    return Pipeline(
        steps=[
            (
                "features",
                FeatureUnion(
                    [
                        (
                            "word_tfidf",
                            TfidfVectorizer(
                                analyzer="word",
                                ngram_range=(1, 2),
                                min_df=2,
                                max_df=0.95,
                                sublinear_tf=True,
                            ),
                        ),
                        (
                            "char_tfidf",
                            TfidfVectorizer(
                                analyzer="char_wb",
                                ngram_range=(3, 5),
                                min_df=2,
                                sublinear_tf=True,
                            ),
                        ),
                    ]
                ),
            ),
            (
                "classifier",
                LinearSVC(
                    class_weight="balanced",
                    random_state=random_state,
                    max_iter=5000,
                ),
            ),
        ]
    )


def compute_metrics(y_true: pd.Series, y_pred: pd.Series) -> dict[str, float]:
    precision_macro, recall_macro, f1_macro, _ = precision_recall_fscore_support(
        y_true,
        y_pred,
        average="macro",
        zero_division=0,
    )
    (
        precision_weighted,
        recall_weighted,
        f1_weighted,
        _,
    ) = precision_recall_fscore_support(
        y_true,
        y_pred,
        average="weighted",
        zero_division=0,
    )

    return {
        "accuracy": float(accuracy_score(y_true, y_pred)),
        "precision_macro": float(precision_macro),
        "recall_macro": float(recall_macro),
        "f1_macro": float(f1_macro),
        "precision_weighted": float(precision_weighted),
        "recall_weighted": float(recall_weighted),
        "f1_weighted": float(f1_weighted),
    }


def save_confusion_matrix_csv(
    y_true: pd.Series,
    y_pred: pd.Series,
    labels: list[str],
    output_path: Path,
) -> Path:
    matrix = confusion_matrix(y_true, y_pred, labels=labels)
    matrix_dataframe = pd.DataFrame(matrix, columns=labels)
    matrix_dataframe.insert(0, "true_label", labels)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    matrix_dataframe.to_csv(output_path, index=False)

    return output_path


def save_predictions(
    test_dataframe: pd.DataFrame,
    predictions: pd.Series,
    target_column: str,
    scenario: str,
    output_path: Path,
) -> Path:
    trace_columns = [
        "external_id",
        "rating",
        "content",
        "text_svm",
        "aspect_label",
        "aspect_label_confidence",
        "final_sentiment",
    ]
    selected_columns = [column for column in trace_columns if column in test_dataframe.columns]
    prediction_dataframe = test_dataframe[selected_columns].copy()
    prediction_dataframe["scenario"] = scenario
    prediction_dataframe["true_label"] = test_dataframe[target_column].astype(str)
    prediction_dataframe["predicted_label"] = pd.Series(predictions).astype(str)
    prediction_dataframe["is_correct"] = (
        prediction_dataframe["true_label"] == prediction_dataframe["predicted_label"]
    )
    output_path.parent.mkdir(parents=True, exist_ok=True)
    prediction_dataframe.to_csv(output_path, index=False)

    return output_path


def save_confusion_matrix_figure(
    y_true: pd.Series,
    y_pred: pd.Series,
    labels: list[str],
    output_path: Path,
    title: str,
) -> Path:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    matrix = confusion_matrix(y_true, y_pred, labels=labels)

    plt.figure(figsize=(10, 8))
    plt.imshow(matrix, interpolation="nearest", cmap="Blues")
    plt.title(title)
    plt.colorbar()
    tick_positions = range(len(labels))
    plt.xticks(tick_positions, labels, rotation=45, ha="right")
    plt.yticks(tick_positions, labels)
    threshold = matrix.max() / 2 if matrix.size else 0
    for row_index in range(matrix.shape[0]):
        for column_index in range(matrix.shape[1]):
            value = matrix[row_index, column_index]
            plt.text(
                column_index,
                row_index,
                str(value),
                ha="center",
                va="center",
                color="white" if value > threshold else "black",
            )
    plt.ylabel("True Label")
    plt.xlabel("Predicted Label")
    plt.tight_layout()
    plt.savefig(output_path)
    plt.close()

    return output_path


def save_class_f1_figure(
    report: dict[str, object],
    labels: list[str],
    output_path: Path,
    title: str,
) -> Path:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    f1_scores = [
        float(report[label]["f1-score"])
        for label in labels
        if isinstance(report.get(label), dict)
    ]
    f1_labels = [label for label in labels if isinstance(report.get(label), dict)]

    plt.figure(figsize=(10, 5))
    plt.bar(f1_labels, f1_scores, color="#2f6f9f")
    plt.title(title)
    plt.xlabel("Aspect Class")
    plt.ylabel("F1 Score")
    plt.ylim(0, 1)
    plt.xticks(rotation=30, ha="right")
    plt.tight_layout()
    plt.savefig(output_path)
    plt.close()

    return output_path


def save_scenario_comparison_figure(
    comparison_dataframe: pd.DataFrame,
    output_path: Path,
) -> Path:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    metrics = ["accuracy", "f1_macro", "f1_weighted"]
    x_positions = range(len(comparison_dataframe))
    width = 0.22

    plt.figure(figsize=(9, 5))
    for metric_index, metric in enumerate(metrics):
        offsets = [
            position + (metric_index - 1) * width for position in x_positions
        ]
        plt.bar(offsets, comparison_dataframe[metric], width=width, label=metric)
    plt.xticks(
        list(x_positions),
        comparison_dataframe["scenario"],
        rotation=20,
        ha="right",
    )
    plt.ylim(0, 1)
    plt.title("SVM Scenario Comparison")
    plt.xlabel("Scenario")
    plt.ylabel("Score")
    plt.legend()
    plt.tight_layout()
    plt.savefig(output_path)
    plt.close()

    return output_path


def save_label_mapping(
    labels: list[str],
    scenario: str,
    target_column: str,
    output_path: Path,
) -> Path:
    label_to_id = {label: index for index, label in enumerate(labels)}
    payload = {
        "scenario": scenario,
        "target_column": target_column,
        "label_to_id": label_to_id,
        "id_to_label": {str(index): label for label, index in label_to_id.items()},
    }
    return save_json(payload, output_path)


def train_and_evaluate_scenario(
    dataframe: pd.DataFrame,
    scenario: str,
    args: argparse.Namespace,
    metrics_dir: Path,
    figures_dir: Path,
) -> dict[str, object]:
    scenario_dataframe, target_column, labels, preparation_details = (
        prepare_scenario_dataframe(
            dataframe=dataframe,
            scenario=scenario,
            text_column=args.text_column,
            label_column=args.label_column,
        )
    )
    split_dataframes = split_dataframe(
        dataframe=scenario_dataframe,
        target_column=target_column,
        test_size=args.test_size,
        val_size=args.val_size,
        random_state=args.random_state,
    )
    split_distribution = build_split_distribution(
        split_dataframes=split_dataframes,
        target_column=target_column,
        scenario=scenario,
    )
    split_distribution_paths = save_dataframe_metric(
        split_distribution,
        metrics_dir / f"svm_{scenario}_split_distribution.csv",
        metrics_dir / f"svm_{scenario}_split_distribution.json",
    )

    pipeline = build_pipeline(args.random_state)
    pipeline.fit(
        split_dataframes["train"][args.text_column],
        split_dataframes["train"][target_column],
    )

    validation_predictions = pipeline.predict(split_dataframes["validation"][args.text_column])
    test_predictions = pipeline.predict(split_dataframes["test"][args.text_column])
    validation_metrics = compute_metrics(
        split_dataframes["validation"][target_column],
        validation_predictions,
    )
    test_metrics = compute_metrics(
        split_dataframes["test"][target_column],
        test_predictions,
    )
    report = classification_report(
        split_dataframes["test"][target_column],
        test_predictions,
        labels=labels,
        output_dict=True,
        zero_division=0,
    )

    metrics_payload = {
        "scenario": scenario,
        "target_column": target_column,
        "labels": labels,
        "preparation": preparation_details,
        "split_sizes": {
            split_name: int(len(split_dataframe))
            for split_name, split_dataframe in split_dataframes.items()
        },
        "validation_metrics": validation_metrics,
        "test_metrics": test_metrics,
        "model_config": {
            "feature_strategy": "FeatureUnion(word_tfidf, char_wb_tfidf)",
            "word_tfidf": {
                "analyzer": "word",
                "ngram_range": [1, 2],
                "min_df": 2,
                "max_df": 0.95,
                "sublinear_tf": True,
            },
            "char_tfidf": {
                "analyzer": "char_wb",
                "ngram_range": [3, 5],
                "min_df": 2,
                "sublinear_tf": True,
            },
            "classifier": "LinearSVC(class_weight='balanced')",
            "random_state": args.random_state,
        },
        "methodology_note": METHODOLOGY_NOTE,
        "generated_at": datetime.now(timezone.utc).isoformat(),
    }

    metrics_path = save_json(
        metrics_payload,
        metrics_dir / f"svm_{scenario}_metrics.json",
    )
    report_path = save_json(
        report,
        metrics_dir / f"svm_{scenario}_classification_report.json",
    )
    confusion_matrix_path = save_confusion_matrix_csv(
        split_dataframes["test"][target_column],
        test_predictions,
        labels,
        metrics_dir / f"svm_{scenario}_confusion_matrix.csv",
    )
    predictions_path = save_predictions(
        split_dataframes["test"],
        pd.Series(test_predictions),
        target_column,
        scenario,
        metrics_dir / f"svm_{scenario}_predictions.csv",
    )

    args.output_dir.mkdir(parents=True, exist_ok=True)
    pipeline_path = args.output_dir / f"svm_{scenario}_pipeline.joblib"
    dump(pipeline, pipeline_path)
    label_mapping_path = save_label_mapping(
        labels,
        scenario,
        target_column,
        args.output_dir / f"svm_{scenario}_label_mapping.json",
    )

    confusion_matrix_figure = save_confusion_matrix_figure(
        split_dataframes["test"][target_column],
        test_predictions,
        labels,
        figures_dir / f"svm_{scenario}_confusion_matrix.png",
        f"SVM {scenario} Confusion Matrix",
    )
    class_f1_figure = save_class_f1_figure(
        report,
        labels,
        figures_dir / f"svm_{scenario}_class_f1.png",
        f"SVM {scenario} Class F1",
    )

    return {
        "scenario": scenario,
        "labels": labels,
        "target_column": target_column,
        "preparation": preparation_details,
        "split_sizes": metrics_payload["split_sizes"],
        "validation_metrics": validation_metrics,
        "test_metrics": test_metrics,
        "metrics_files": [
            str(metrics_path),
            str(report_path),
            str(confusion_matrix_path),
            str(predictions_path),
            *[str(path) for path in split_distribution_paths],
        ],
        "figure_files": [str(confusion_matrix_figure), str(class_f1_figure)],
        "artifact_files": [str(pipeline_path), str(label_mapping_path)],
    }


def build_comparison(scenario_results: list[dict[str, object]]) -> pd.DataFrame:
    rows = []
    for result in scenario_results:
        test_metrics = result["test_metrics"]
        report_path = Path(
            next(
                path
                for path in result["metrics_files"]
                if path.endswith("_classification_report.json")
            )
        )
        report = json.loads(report_path.read_text(encoding="utf-8"))
        class_f1_scores = [
            float(report[label]["f1-score"])
            for label in result["labels"]
            if isinstance(report.get(label), dict)
        ]
        rows.append(
            {
                "scenario": result["scenario"],
                "class_count": len(result["labels"]),
                "accuracy": test_metrics["accuracy"],
                "precision_macro": test_metrics["precision_macro"],
                "recall_macro": test_metrics["recall_macro"],
                "f1_macro": test_metrics["f1_macro"],
                "precision_weighted": test_metrics["precision_weighted"],
                "recall_weighted": test_metrics["recall_weighted"],
                "f1_weighted": test_metrics["f1_weighted"],
                "min_class_f1": min(class_f1_scores) if class_f1_scores else 0.0,
            }
        )

    return pd.DataFrame(rows)


def select_candidate(comparison_dataframe: pd.DataFrame) -> dict[str, object]:
    ordered = comparison_dataframe.sort_values(
        by=["f1_macro", "min_class_f1", "f1_weighted"],
        ascending=[False, False, False],
    ).reset_index(drop=True)
    selected = ordered.iloc[0].to_dict()

    return {
        "selected_scenario": selected["scenario"],
        "selection_rule": (
            "Highest test macro F1, then better minority-class F1, then weighted F1."
        ),
        "selected_metrics": selected,
    }


def main() -> None:
    args = parse_args()
    validate_split_sizes(args.test_size, args.val_size)

    metrics_dir = args.summary_output.parent
    figures_dir = DEFAULT_FIGURES_DIR
    dataframe = pd.read_csv(args.input)
    scenario_results = [
        train_and_evaluate_scenario(
            dataframe=dataframe,
            scenario=scenario,
            args=args,
            metrics_dir=metrics_dir,
            figures_dir=figures_dir,
        )
        for scenario in scenario_names(args.scenario)
    ]
    comparison_dataframe = build_comparison(scenario_results)
    comparison_paths = save_dataframe_metric(
        comparison_dataframe,
        metrics_dir / "svm_scenario_comparison.csv",
        metrics_dir / "svm_scenario_comparison.json",
    )
    comparison_figure = save_scenario_comparison_figure(
        comparison_dataframe,
        figures_dir / "svm_scenario_comparison.png",
    )
    candidate_selection = select_candidate(comparison_dataframe)
    summary = {
        "scenario_results": scenario_results,
        "comparison_files": [str(path) for path in comparison_paths],
        "comparison_figure": str(comparison_figure),
        "candidate_selection": candidate_selection,
        "methodology_note": METHODOLOGY_NOTE,
        "generated_at": datetime.now(timezone.utc).isoformat(),
    }
    save_json(summary, args.summary_output)

    print(
        json.dumps(
            {
                "summary_output": str(args.summary_output),
                "candidate_selection": candidate_selection,
                "scenario_comparison": json.loads(
                    comparison_dataframe.to_json(orient="records")
                ),
                "model_artifacts": [
                    artifact
                    for result in scenario_results
                    for artifact in result["artifact_files"]
                ],
                "metrics_files": [
                    metric
                    for result in scenario_results
                    for metric in result["metrics_files"]
                ]
                + [str(path) for path in comparison_paths]
                + [str(args.summary_output)],
                "figure_files": [
                    figure
                    for result in scenario_results
                    for figure in result["figure_files"]
                ]
                + [str(comparison_figure)],
            },
            indent=2,
            sort_keys=True,
        )
    )


if __name__ == "__main__":
    main()
