"""Controlled IndoBERT fine-tuning script for sentiment classification."""

from __future__ import annotations

import argparse
import inspect
import json
import random
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Callable

import matplotlib
import numpy as np
import pandas as pd
from sklearn.metrics import (
    accuracy_score,
    precision_recall_fscore_support,
)

matplotlib.use("Agg")
import matplotlib.pyplot as plt

DEFAULT_TRAIN_FILE = Path("../datasets/processed/indobert/train.csv")
DEFAULT_VALIDATION_FILE = Path("../datasets/processed/indobert/validation.csv")
DEFAULT_TEST_FILE = Path("../datasets/processed/indobert/test.csv")
DEFAULT_LABEL_MAPPING = Path("../datasets/processed/indobert/label_mapping.json")
DEFAULT_OUTPUT_DIR = Path("saved_models/indobert")
DEFAULT_METRICS_OUTPUT = Path(
    "../datasets/outputs/eda/03_indobert/indobert_training_metrics.json"
)
DEFAULT_PREDICTIONS_OUTPUT = Path(
    "../datasets/outputs/eda/03_indobert/indobert_test_predictions.csv"
)
DEFAULT_FIGURES_DIR = Path("../docs/figures/03_indobert")
REQUIRED_COLUMNS = ("text_indobert", "label_id")


@dataclass(frozen=True)
class TrainingDependencies:
    auto_model_for_sequence_classification: object
    auto_tokenizer: object
    data_collator_with_padding: object
    dataset: object
    trainer: object
    training_arguments: object
    torch: object


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=(
            "Fine-tune IndoBERT for sentiment classification. Use --dry-run to "
            "validate inputs without downloading model weights or training."
        )
    )
    parser.add_argument("--train-file", type=Path, default=DEFAULT_TRAIN_FILE)
    parser.add_argument("--validation-file", type=Path, default=DEFAULT_VALIDATION_FILE)
    parser.add_argument("--test-file", type=Path, default=DEFAULT_TEST_FILE)
    parser.add_argument("--label-mapping", type=Path, default=DEFAULT_LABEL_MAPPING)
    parser.add_argument("--model-name", default="indobenchmark/indobert-base-p1")
    parser.add_argument("--output-dir", type=Path, default=DEFAULT_OUTPUT_DIR)
    parser.add_argument("--metrics-output", type=Path, default=DEFAULT_METRICS_OUTPUT)
    parser.add_argument("--max-length", type=int, default=128)
    parser.add_argument("--batch-size", type=int, default=16)
    parser.add_argument("--learning-rate", type=float, default=2e-5)
    parser.add_argument("--epochs", type=int, default=3)
    parser.add_argument("--random-state", type=int, default=42)
    parser.add_argument("--dry-run", action="store_true")

    return parser.parse_args()


def validate_file_exists(path: Path) -> None:
    if not path.is_file():
        raise FileNotFoundError(f"Missing required file: {path}")


def load_dataframe(path: Path) -> pd.DataFrame:
    validate_file_exists(path)

    return pd.read_csv(path)


def validate_dataframe(dataframe: pd.DataFrame, dataset_name: str) -> None:
    missing_columns = [
        column for column in REQUIRED_COLUMNS if column not in dataframe.columns
    ]

    if missing_columns:
        raise ValueError(
            f"{dataset_name} is missing required columns: "
            f"{', '.join(missing_columns)}"
        )

    empty_text_count = int(
        dataframe["text_indobert"].fillna("").astype(str).str.strip().eq("").sum()
    )
    if empty_text_count:
        raise ValueError(f"{dataset_name} contains {empty_text_count} empty text rows")

    if "preprocessing_status" in dataframe.columns:
        valid_preprocessing_mask = (
            dataframe["preprocessing_status"].fillna("").astype(str).eq("valid")
        )
        dropped_status_count = int((~valid_preprocessing_mask).sum())
        if dropped_status_count:
            raise ValueError(
                f"{dataset_name} contains {dropped_status_count} non-valid "
                "preprocessing rows"
            )


def load_label_mapping(path: Path) -> dict[str, int]:
    validate_file_exists(path)
    raw_mapping = json.loads(path.read_text(encoding="utf-8"))
    mapping = {str(label): int(label_id) for label, label_id in raw_mapping.items()}

    expected_mapping = {"Negative": 0, "Neutral": 1, "Positive": 2}
    if mapping != expected_mapping:
        raise ValueError(
            "Label mapping must be exactly "
            f"{expected_mapping}; received {mapping}"
        )

    return mapping


def load_and_validate_inputs(
    args: argparse.Namespace,
) -> tuple[dict[str, pd.DataFrame], dict[str, int]]:
    datasets = {
        "train": load_dataframe(args.train_file),
        "validation": load_dataframe(args.validation_file),
        "test": load_dataframe(args.test_file),
    }
    label_mapping = load_label_mapping(args.label_mapping)

    for dataset_name, dataframe in datasets.items():
        validate_dataframe(dataframe, dataset_name)
        validate_label_ids(dataframe, dataset_name, label_mapping)

    return datasets, label_mapping


def validate_label_ids(
    dataframe: pd.DataFrame,
    dataset_name: str,
    label_mapping: dict[str, int],
) -> None:
    allowed_ids = set(label_mapping.values())
    observed_ids = set(int(label_id) for label_id in dataframe["label_id"].unique())
    unknown_ids = observed_ids - allowed_ids

    if unknown_ids:
        raise ValueError(f"{dataset_name} contains unknown label IDs: {unknown_ids}")


def build_label_distribution(
    dataframe: pd.DataFrame,
    label_mapping: dict[str, int],
) -> dict[str, int]:
    id_to_label = {label_id: label for label, label_id in label_mapping.items()}
    counts = dataframe["label_id"].value_counts().sort_index()

    return {
        id_to_label[int(label_id)]: int(count)
        for label_id, count in counts.items()
    }


def build_dry_run_report(
    args: argparse.Namespace,
    datasets: dict[str, pd.DataFrame],
    label_mapping: dict[str, int],
) -> dict[str, object]:
    return {
        "dry_run": True,
        "dataset_sizes": {
            split_name: int(len(dataframe))
            for split_name, dataframe in datasets.items()
        },
        "label_distribution": {
            split_name: build_label_distribution(dataframe, label_mapping)
            for split_name, dataframe in datasets.items()
        },
        "label_mapping": label_mapping,
        "training_config": build_training_config(args),
        "planned_outputs": {
            "model_dir": str(args.output_dir),
            "metrics_output": str(args.metrics_output),
            "predictions_output": str(build_predictions_output(args.metrics_output)),
            "training_loss_figure": str(
                DEFAULT_FIGURES_DIR / "indobert_training_loss.png"
            ),
            "eval_metrics_figure": str(
                DEFAULT_FIGURES_DIR / "indobert_eval_metrics.png"
            ),
        },
        "side_effects": "No model download, no training, no artifact writes.",
    }


def build_training_config(args: argparse.Namespace) -> dict[str, object]:
    return {
        "model_name": args.model_name,
        "max_length": args.max_length,
        "batch_size": args.batch_size,
        "learning_rate": args.learning_rate,
        "epochs": args.epochs,
        "random_state": args.random_state,
        "evaluation_strategy": "epoch",
        "save_strategy": "epoch",
        "metric_for_best_model": "f1_macro",
    }


def build_predictions_output(metrics_output: Path) -> Path:
    return metrics_output.parent / DEFAULT_PREDICTIONS_OUTPUT.name


def load_training_dependencies() -> TrainingDependencies:
    import torch
    from datasets import Dataset
    from transformers import (
        AutoModelForSequenceClassification,
        AutoTokenizer,
        DataCollatorWithPadding,
        Trainer,
        TrainingArguments,
    )

    import evaluate  # noqa: F401
    import accelerate  # noqa: F401

    return TrainingDependencies(
        auto_model_for_sequence_classification=AutoModelForSequenceClassification,
        auto_tokenizer=AutoTokenizer,
        data_collator_with_padding=DataCollatorWithPadding,
        dataset=Dataset,
        trainer=Trainer,
        training_arguments=TrainingArguments,
        torch=torch,
    )


def set_seed(seed: int, torch_module: object | None = None) -> None:
    random.seed(seed)
    np.random.seed(seed)

    if torch_module is not None:
        torch_module.manual_seed(seed)

        if torch_module.cuda.is_available():
            torch_module.cuda.manual_seed_all(seed)


def dataframe_to_hf_dataset(
    dataframe: pd.DataFrame,
    dataset_class: object,
) -> object:
    return dataset_class.from_pandas(
        dataframe[["text_indobert", "label_id"]].rename(columns={"label_id": "labels"}),
        preserve_index=False,
    )


def tokenize_dataset(
    dataset: object,
    tokenizer: object,
    max_length: int,
) -> object:
    def tokenize_batch(batch: dict[str, list[str]]) -> dict[str, object]:
        return tokenizer(
            batch["text_indobert"],
            truncation=True,
            max_length=max_length,
        )

    return dataset.map(tokenize_batch, batched=True)


def build_compute_metrics() -> Callable[[object], dict[str, float]]:
    def compute_metrics(eval_prediction: object) -> dict[str, float]:
        logits, labels = eval_prediction
        predictions = np.argmax(logits, axis=-1)
        precision_macro, recall_macro, f1_macro, _ = precision_recall_fscore_support(
            labels,
            predictions,
            average="macro",
            zero_division=0,
        )
        (
            precision_weighted,
            recall_weighted,
            f1_weighted,
            _,
        ) = precision_recall_fscore_support(
            labels,
            predictions,
            average="weighted",
            zero_division=0,
        )

        return {
            "accuracy": float(accuracy_score(labels, predictions)),
            "precision_macro": float(precision_macro),
            "recall_macro": float(recall_macro),
            "f1_macro": float(f1_macro),
            "precision_weighted": float(precision_weighted),
            "recall_weighted": float(recall_weighted),
            "f1_weighted": float(f1_weighted),
        }

    return compute_metrics


def build_training_arguments(
    args: argparse.Namespace,
    training_arguments_class: object,
) -> object:
    argument_names = set(
        inspect.signature(training_arguments_class.__init__).parameters.keys()
    )
    strategy_key = (
        "eval_strategy" if "eval_strategy" in argument_names else "evaluation_strategy"
    )
    training_kwargs = {
        "output_dir": str(args.output_dir),
        strategy_key: "epoch",
        "save_strategy": "epoch",
        "learning_rate": args.learning_rate,
        "per_device_train_batch_size": args.batch_size,
        "per_device_eval_batch_size": args.batch_size,
        "num_train_epochs": args.epochs,
        "weight_decay": 0.01,
        "load_best_model_at_end": True,
        "metric_for_best_model": "f1_macro",
        "greater_is_better": True,
        "report_to": [],
        "seed": args.random_state,
    }

    if "logging_strategy" in argument_names:
        training_kwargs["logging_strategy"] = "epoch"

    if "save_total_limit" in argument_names:
        training_kwargs["save_total_limit"] = 1

    return training_arguments_class(**training_kwargs)


def build_trainer_kwargs(
    trainer_class: object,
    tokenizer: object,
) -> dict[str, object]:
    argument_names = set(inspect.signature(trainer_class.__init__).parameters.keys())
    if "processing_class" in argument_names:
        return {"processing_class": tokenizer}

    return {"tokenizer": tokenizer}


def run_training(
    args: argparse.Namespace,
    datasets: dict[str, pd.DataFrame],
    label_mapping: dict[str, int],
) -> None:
    dependencies = load_training_dependencies()
    set_seed(args.random_state, dependencies.torch)
    id_to_label = {label_id: label for label, label_id in label_mapping.items()}
    label_to_id = {label: label_id for label, label_id in label_mapping.items()}
    tokenizer = dependencies.auto_tokenizer.from_pretrained(args.model_name)
    model = dependencies.auto_model_for_sequence_classification.from_pretrained(
        args.model_name,
        num_labels=3,
        id2label=id_to_label,
        label2id=label_to_id,
    )
    train_dataset = tokenize_dataset(
        dataframe_to_hf_dataset(datasets["train"], dependencies.dataset),
        tokenizer,
        args.max_length,
    )
    validation_dataset = tokenize_dataset(
        dataframe_to_hf_dataset(datasets["validation"], dependencies.dataset),
        tokenizer,
        args.max_length,
    )
    test_dataset = tokenize_dataset(
        dataframe_to_hf_dataset(datasets["test"], dependencies.dataset),
        tokenizer,
        args.max_length,
    )
    training_arguments = build_training_arguments(
        args=args,
        training_arguments_class=dependencies.training_arguments,
    )
    trainer = dependencies.trainer(
        model=model,
        args=training_arguments,
        train_dataset=train_dataset,
        eval_dataset=validation_dataset,
        data_collator=dependencies.data_collator_with_padding(tokenizer=tokenizer),
        compute_metrics=build_compute_metrics(),
        **build_trainer_kwargs(dependencies.trainer, tokenizer),
    )
    train_result = trainer.train()
    test_result = trainer.evaluate(test_dataset, metric_key_prefix="test")
    predictions = trainer.predict(test_dataset)

    args.output_dir.mkdir(parents=True, exist_ok=True)
    trainer.save_model(str(args.output_dir))
    tokenizer.save_pretrained(str(args.output_dir))
    save_training_outputs(
        args=args,
        datasets=datasets,
        label_mapping=label_mapping,
        train_metrics=train_result.metrics,
        test_metrics=test_result,
        prediction_output=predictions,
        log_history=trainer.state.log_history,
    )


def save_training_outputs(
    args: argparse.Namespace,
    datasets: dict[str, pd.DataFrame],
    label_mapping: dict[str, int],
    train_metrics: dict[str, float],
    test_metrics: dict[str, float],
    prediction_output: object,
    log_history: list[dict[str, object]],
) -> None:
    args.metrics_output.parent.mkdir(parents=True, exist_ok=True)
    predictions = np.argmax(prediction_output.predictions, axis=-1)
    labels = prediction_output.label_ids
    id_to_label = {label_id: label for label, label_id in label_mapping.items()}
    metrics = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "dataset_sizes": {
            split_name: int(len(dataframe))
            for split_name, dataframe in datasets.items()
        },
        "label_distribution": {
            split_name: build_label_distribution(dataframe, label_mapping)
            for split_name, dataframe in datasets.items()
        },
        "training_config": build_training_config(args),
        "train_metrics": train_metrics,
        "test_metrics": test_metrics,
    }
    args.metrics_output.write_text(
        json.dumps(metrics, indent=2, sort_keys=True),
        encoding="utf-8",
    )
    save_predictions(
        test_dataframe=datasets["test"],
        predictions=predictions,
        labels=labels,
        id_to_label=id_to_label,
        output_path=build_predictions_output(args.metrics_output),
    )
    save_training_loss_figure(log_history, train_metrics)
    save_eval_metrics_figure(test_metrics)


def save_predictions(
    test_dataframe: pd.DataFrame,
    predictions: np.ndarray,
    labels: np.ndarray,
    id_to_label: dict[int, str],
    output_path: Path,
) -> None:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output = test_dataframe.copy()
    output["predicted_label_id"] = predictions
    output["predicted_label"] = [id_to_label[int(label_id)] for label_id in predictions]
    output["true_label_id"] = labels
    output["true_label"] = [id_to_label[int(label_id)] for label_id in labels]
    output.to_csv(output_path, index=False)


def save_training_loss_figure(
    log_history: list[dict[str, object]],
    train_metrics: dict[str, float],
) -> None:
    output_path = DEFAULT_FIGURES_DIR / "indobert_training_loss.png"
    DEFAULT_FIGURES_DIR.mkdir(parents=True, exist_ok=True)
    loss_points = [
        (
            float(entry.get("epoch", index + 1)),
            float(entry["loss"]),
        )
        for index, entry in enumerate(log_history)
        if "loss" in entry
    ]
    eval_loss_points = [
        (
            float(entry.get("epoch", index + 1)),
            float(entry["eval_loss"]),
        )
        for index, entry in enumerate(log_history)
        if "eval_loss" in entry
    ]

    plt.figure(figsize=(7, 4))
    if loss_points:
        epochs, losses = zip(*loss_points)
        plt.plot(epochs, losses, marker="o", label="Training loss", color="#2f6f9f")

    if eval_loss_points:
        epochs, losses = zip(*eval_loss_points)
        plt.plot(epochs, losses, marker="o", label="Validation loss", color="#b45f06")

    if not loss_points and not eval_loss_points:
        train_loss = float(train_metrics.get("train_loss", 0.0))
        plt.bar(["train_loss"], [train_loss], color="#2f6f9f")

    plt.title("IndoBERT Training Loss")
    plt.ylabel("Loss")
    plt.xlabel("Epoch")
    if loss_points or eval_loss_points:
        plt.legend()
    plt.tight_layout()
    plt.savefig(output_path)
    plt.close()


def save_eval_metrics_figure(test_metrics: dict[str, float]) -> None:
    output_path = DEFAULT_FIGURES_DIR / "indobert_eval_metrics.png"
    metric_names = [
        "test_accuracy",
        "test_precision_macro",
        "test_recall_macro",
        "test_f1_macro",
        "test_f1_weighted",
    ]
    metric_values = [
        float(test_metrics.get(metric_name, 0.0)) for metric_name in metric_names
    ]
    DEFAULT_FIGURES_DIR.mkdir(parents=True, exist_ok=True)

    plt.figure(figsize=(9, 5))
    plt.bar(metric_names, metric_values, color="#2f6f9f")
    plt.title("IndoBERT Test Metrics")
    plt.ylabel("Score")
    plt.ylim(0, 1)
    plt.xticks(rotation=25, ha="right")
    plt.tight_layout()
    plt.savefig(output_path)
    plt.close()


def main() -> None:
    args = parse_args()
    datasets, label_mapping = load_and_validate_inputs(args)

    if args.dry_run:
        print(
            json.dumps(
                build_dry_run_report(args, datasets, label_mapping),
                indent=2,
                sort_keys=True,
            )
        )
        return

    run_training(args, datasets, label_mapping)


if __name__ == "__main__":
    main()
