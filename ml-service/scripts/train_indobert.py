"""Controlled IndoBERT fine-tuning and artifact export for sentiment classification."""

from __future__ import annotations

import argparse
import inspect
import json
import os
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
from sklearn.utils.class_weight import compute_class_weight

matplotlib.use("Agg")
import matplotlib.pyplot as plt

PROJECT_ROOT = Path(__file__).resolve().parents[2]
ML_SERVICE_ROOT = PROJECT_ROOT / "ml-service"

RUN_NAME = "run_3_weighted_loss_lr_1e-5"
BASE_MODEL = "indobenchmark/indobert-base-p1"
EXPECTED_LABELS = ("Negative", "Neutral", "Positive")
TEXT_QUALITY_FILTER_RULES = [
    "morse_like_text",
    "high_symbol_ratio",
    "high_digit_ratio",
    "too_few_alphabet_chars",
    "too_short_after_cleaning",
    "repeated_garbage_pattern",
]

DEFAULT_DATASET_DIR = PROJECT_ROOT / "datasets" / "processed" / "indobert"
DEFAULT_TRAIN_FILE = DEFAULT_DATASET_DIR / "train.csv"
DEFAULT_VALIDATION_FILE = DEFAULT_DATASET_DIR / "validation.csv"
DEFAULT_TEST_FILE = DEFAULT_DATASET_DIR / "test.csv"
DEFAULT_LABEL_MAPPING = DEFAULT_DATASET_DIR / "label_mapping.json"
DEFAULT_INPUT_DATASET = PROJECT_ROOT / "datasets" / "processed" / "reviews_final.csv"
DEFAULT_EDA_DIR = PROJECT_ROOT / "datasets" / "outputs" / "eda" / "03_indobert"
DEFAULT_RUN_OUTPUT_DIR = DEFAULT_EDA_DIR / RUN_NAME
DEFAULT_EXPORT_BASE_DIR = ML_SERVICE_ROOT / "saved_models" / "indobert"
DEFAULT_PREPROCESSING_SUMMARY = (
    ML_SERVICE_ROOT / "quality_audit" / "preprocess_indobert_quality_summary.json"
)
DEFAULT_NOISE_REPORT = (
    ML_SERVICE_ROOT / "quality_audit" / "reviews_preprocessed_indobert_noise_report.csv"
)
DEFAULT_NOISE_REPORT_JSON = (
    ML_SERVICE_ROOT / "quality_audit" / "reviews_preprocessed_indobert_noise_report.json"
)

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
            "Fine-tune IndoBERT run_3 for sentiment classification and export "
            "a Hugging Face-compatible artifact. Use --dry-run to validate "
            "inputs without downloading model weights or training."
        )
    )
    parser.add_argument("--run-name", default=RUN_NAME)
    parser.add_argument("--train-file", type=Path, default=DEFAULT_TRAIN_FILE)
    parser.add_argument("--validation-file", type=Path, default=DEFAULT_VALIDATION_FILE)
    parser.add_argument("--test-file", type=Path, default=DEFAULT_TEST_FILE)
    parser.add_argument("--label-mapping", type=Path, default=DEFAULT_LABEL_MAPPING)
    parser.add_argument("--input-dataset", type=Path, default=DEFAULT_INPUT_DATASET)
    parser.add_argument("--model-name", default=BASE_MODEL)
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=None,
        help="Trainer checkpoint directory. Defaults to <export-dir>/checkpoints.",
    )
    parser.add_argument(
        "--export-dir",
        type=Path,
        default=None,
        help=(
            "Final Hugging Face artifact directory. Defaults to "
            "ml-service/saved_models/indobert/<run-name>."
        ),
    )
    parser.add_argument(
        "--metrics-output",
        type=Path,
        default=None,
        help=(
            "Research metrics JSON output. Defaults to "
            "datasets/outputs/eda/03_indobert/<run-name>/indobert_training_metrics.json."
        ),
    )
    parser.add_argument(
        "--figures-dir",
        type=Path,
        default=None,
        help=(
            "Figure output directory. Defaults to "
            "docs/figures/03_indobert/<run-name>."
        ),
    )
    parser.add_argument("--max-length", type=int, default=128)
    parser.add_argument("--batch-size", type=int, default=16)
    parser.add_argument("--learning-rate", type=float, default=1e-5)
    parser.add_argument("--epochs", type=int, default=3)
    parser.add_argument("--gradient-accumulation-steps", type=int, default=1)
    parser.add_argument("--weight-decay", type=float, default=0.01)
    parser.add_argument("--random-state", type=int, default=42)
    parser.add_argument(
        "--weighted-loss",
        action=argparse.BooleanOptionalAction,
        default=True,
        help="Enable balanced class-weighted cross entropy for run_3.",
    )
    parser.add_argument(
        "--dataset-version",
        default="processed_indobert_current",
        help="Human-readable dataset version stored in eval_metrics.json.",
    )
    parser.add_argument(
        "--preprocessing-version",
        default="preprocess_indobert_quality_filtering_v1",
    )
    parser.add_argument(
        "--text-quality-filtering-enabled",
        action=argparse.BooleanOptionalAction,
        default=True,
    )
    parser.add_argument(
        "--preprocessing-summary",
        type=Path,
        default=DEFAULT_PREPROCESSING_SUMMARY,
    )
    parser.add_argument("--noise-report", type=Path, default=DEFAULT_NOISE_REPORT)
    parser.add_argument(
        "--noise-report-json",
        type=Path,
        default=DEFAULT_NOISE_REPORT_JSON,
    )
    parser.add_argument(
        "--metrics-note",
        default=(
            "Metrics are valid only for the dataset used in this run. Re-run "
            "run_3 after the text quality filtering update before treating "
            "the exported artifact as the current final thesis candidate."
        ),
    )
    parser.add_argument("--push-to-hub", action="store_true")
    parser.add_argument("--hf-repo-id", default=None)
    parser.add_argument("--hf-private", action="store_true")
    parser.add_argument("--hf-token-env", default="HF_TOKEN")
    parser.add_argument("--dry-run", action="store_true")

    args = parser.parse_args()
    apply_derived_defaults(args)
    normalize_path_args(args)

    return args


def apply_derived_defaults(args: argparse.Namespace) -> None:
    run_output_dir = DEFAULT_EDA_DIR / args.run_name
    export_dir = DEFAULT_EXPORT_BASE_DIR / args.run_name

    if args.export_dir is None:
        args.export_dir = export_dir

    if args.output_dir is None:
        args.output_dir = args.export_dir / "checkpoints"

    if args.metrics_output is None:
        args.metrics_output = run_output_dir / "indobert_training_metrics.json"

    if args.figures_dir is None:
        args.figures_dir = PROJECT_ROOT / "docs" / "figures" / "03_indobert" / args.run_name


def normalize_path_args(args: argparse.Namespace) -> None:
    for attribute_name in [
        "train_file",
        "validation_file",
        "test_file",
        "label_mapping",
        "input_dataset",
        "output_dir",
        "export_dir",
        "metrics_output",
        "figures_dir",
        "preprocessing_summary",
        "noise_report",
        "noise_report_json",
    ]:
        setattr(args, attribute_name, resolve_project_path(getattr(args, attribute_name)))


def resolve_project_path(path: Path) -> Path:
    expanded = path.expanduser()
    if expanded.is_absolute():
        return expanded.resolve()

    return (PROJECT_ROOT / expanded).resolve()


def relative_to_project(path: Path) -> str:
    try:
        return str(path.resolve().relative_to(PROJECT_ROOT))
    except ValueError:
        return str(path)


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

    if set(mapping.keys()) != set(EXPECTED_LABELS):
        raise ValueError(
            "Label mapping must contain exactly the sentiment labels "
            f"{EXPECTED_LABELS}; received {sorted(mapping.keys())}"
        )

    expected_ids = set(range(len(EXPECTED_LABELS)))
    observed_ids = set(mapping.values())
    if observed_ids != expected_ids:
        raise ValueError(
            f"Label mapping IDs must be {sorted(expected_ids)}; "
            f"received {sorted(observed_ids)}"
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


def build_class_weights(
    train_dataframe: pd.DataFrame,
    label_mapping: dict[str, int],
    run_name: str,
) -> tuple[dict[str, object], list[float]]:
    classes = np.array(sorted(label_mapping.values()))
    labels = train_dataframe["label_id"].astype(int).to_numpy()
    weights = compute_class_weight(class_weight="balanced", classes=classes, y=labels)
    id_to_label = {label_id: label for label, label_id in label_mapping.items()}
    train_distribution = build_label_distribution(train_dataframe, label_mapping)
    weights_by_id = {
        str(int(label_id)): float(weight)
        for label_id, weight in zip(classes, weights)
    }
    weights_by_label = {
        id_to_label[int(label_id)]: float(weight)
        for label_id, weight in zip(classes, weights)
    }
    payload = {
        "run_name": run_name,
        "method": "sklearn.utils.class_weight.compute_class_weight(class_weight='balanced')",
        "train_distribution": train_distribution,
        "weights_by_id": weights_by_id,
        "weights_by_label": weights_by_label,
    }

    return payload, [float(weight) for weight in weights]


def build_dry_run_report(
    args: argparse.Namespace,
    datasets: dict[str, pd.DataFrame],
    label_mapping: dict[str, int],
) -> dict[str, object]:
    class_weights_payload = None
    if args.weighted_loss:
        class_weights_payload, _ = build_class_weights(
            datasets["train"], label_mapping, args.run_name
        )

    return {
        "dry_run": True,
        "run_name": args.run_name,
        "dataset_sizes": build_dataset_sizes(datasets),
        "label_distribution": {
            split_name: build_label_distribution(dataframe, label_mapping)
            for split_name, dataframe in datasets.items()
        },
        "label_mapping": label_mapping,
        "training_config": build_training_config(args, class_weights_payload),
        "preprocessing_config": build_preprocessing_config(args),
        "planned_outputs": {
            "checkpoint_dir": relative_to_project(args.output_dir),
            "export_dir": relative_to_project(args.export_dir),
            "metrics_output": relative_to_project(args.metrics_output),
            "predictions_output": relative_to_project(
                build_predictions_output(args.metrics_output)
            ),
            "training_loss_figure": relative_to_project(
                args.figures_dir / "indobert_training_loss.png"
            ),
            "eval_metrics_figure": relative_to_project(
                args.figures_dir / "indobert_eval_metrics.png"
            ),
            "artifact_files": [
                "config.json",
                "model.safetensors or pytorch_model.bin",
                "tokenizer_config.json",
                "special_tokens_map.json",
                "vocab.txt or tokenizer.json",
                "eval_metrics.json",
                "label_mapping.json",
                "preprocessing_config.json",
                "training_config.json",
                "README.md",
            ],
        },
        "side_effects": "No model download, no training, no artifact writes.",
    }


def build_dataset_sizes(datasets: dict[str, pd.DataFrame]) -> dict[str, int]:
    return {
        split_name: int(len(dataframe))
        for split_name, dataframe in datasets.items()
    }


def build_training_config(
    args: argparse.Namespace,
    class_weights_payload: dict[str, object] | None,
) -> dict[str, object]:
    return {
        "run_name": args.run_name,
        "base_model": args.model_name,
        "learning_rate": args.learning_rate,
        "batch_size": args.batch_size,
        "epochs": args.epochs,
        "max_length": args.max_length,
        "weighted_loss_enabled": bool(args.weighted_loss),
        "loss": "weighted_cross_entropy" if args.weighted_loss else "cross_entropy",
        "class_weights": class_weights_payload,
        "random_seed": args.random_state,
        "gradient_accumulation_steps": args.gradient_accumulation_steps,
        "weight_decay": args.weight_decay,
        "optimizer": "Trainer default AdamW",
        "scheduler": "Trainer default linear schedule",
        "evaluation_strategy": "epoch",
        "save_strategy": "epoch",
        "metric_for_best_model": "f1_macro",
        "train_file": relative_to_project(args.train_file),
        "validation_file": relative_to_project(args.validation_file),
        "test_file": relative_to_project(args.test_file),
        "label_mapping_file": relative_to_project(args.label_mapping),
        "output_dir": relative_to_project(args.output_dir),
        "export_dir": relative_to_project(args.export_dir),
    }


def load_optional_json(path: Path) -> dict[str, object] | None:
    if not path.is_file():
        return None

    return json.loads(path.read_text(encoding="utf-8"))


def build_preprocessing_config(args: argparse.Namespace) -> dict[str, object]:
    summary = load_optional_json(args.preprocessing_summary)
    quality_summary = None
    if summary is not None:
        quality_summary = {
            "valid_rows": summary.get("valid_rows"),
            "dropped_rows": summary.get("dropped_rows"),
            "drop_reason_distribution": summary.get("drop_reason_distribution"),
            "generated_at": summary.get("generated_at"),
        }

    return {
        "pipeline_name": "preprocess_indobert.py",
        "preprocessing_version": args.preprocessing_version,
        "text_quality_filtering_enabled": bool(args.text_quality_filtering_enabled),
        "filtering_rules": TEXT_QUALITY_FILTER_RULES,
        "input_dataset_path": relative_to_project(args.input_dataset),
        "processed_dataset_path": relative_to_project(args.train_file.parent),
        "train_file": relative_to_project(args.train_file),
        "validation_file": relative_to_project(args.validation_file),
        "test_file": relative_to_project(args.test_file),
        "preprocessing_summary_path": relative_to_project(args.preprocessing_summary)
        if args.preprocessing_summary.is_file()
        else None,
        "dropped_noise_report_path": relative_to_project(args.noise_report)
        if args.noise_report.is_file()
        else None,
        "dropped_noise_report_json_path": relative_to_project(args.noise_report_json)
        if args.noise_report_json.is_file()
        else None,
        "quality_summary": quality_summary,
        "note": (
            "This artifact workflow is prepared for the updated IndoBERT "
            "preprocessing pipeline with text quality filtering. Confirm the "
            "processed split files were regenerated from that pipeline before "
            "treating metrics as current."
        ),
    }


def build_predictions_output(metrics_output: Path) -> Path:
    return metrics_output.parent / "indobert_test_predictions.csv"


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

    import accelerate  # noqa: F401
    import evaluate  # noqa: F401

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
        "gradient_accumulation_steps": args.gradient_accumulation_steps,
        "num_train_epochs": args.epochs,
        "weight_decay": args.weight_decay,
        "load_best_model_at_end": True,
        "metric_for_best_model": "f1_macro",
        "greater_is_better": True,
        "report_to": [],
        "seed": args.random_state,
    }

    if "logging_strategy" in argument_names:
        training_kwargs["logging_strategy"] = "epoch"

    if "save_total_limit" in argument_names:
        training_kwargs["save_total_limit"] = 2

    if "save_safetensors" in argument_names:
        training_kwargs["save_safetensors"] = True

    return training_arguments_class(**training_kwargs)


def build_trainer_kwargs(
    trainer_class: object,
    tokenizer: object,
) -> dict[str, object]:
    argument_names = set(inspect.signature(trainer_class.__init__).parameters.keys())
    if "processing_class" in argument_names:
        return {"processing_class": tokenizer}

    return {"tokenizer": tokenizer}


def build_trainer_class(
    trainer_class: object,
    torch_module: object,
    weighted_loss_enabled: bool,
) -> object:
    if not weighted_loss_enabled:
        return trainer_class

    class WeightedTrainer(trainer_class):  # type: ignore[misc, valid-type]
        def __init__(self, *args: object, class_weights_tensor: object, **kwargs: object):
            super().__init__(*args, **kwargs)
            self.class_weights_tensor = class_weights_tensor

        def compute_loss(
            self,
            model: object,
            inputs: dict[str, object],
            return_outputs: bool = False,
            **kwargs: object,
        ) -> object:
            labels = inputs.pop("labels", None)
            if labels is None:
                raise ValueError("WeightedTrainer requires labels in inputs.")

            outputs = model(**inputs)
            logits = outputs["logits"] if isinstance(outputs, dict) else outputs.logits
            loss_function = torch_module.nn.CrossEntropyLoss(
                weight=self.class_weights_tensor.to(logits.device)
            )
            loss = loss_function(
                logits.view(-1, model.config.num_labels),
                labels.view(-1),
            )

            return (loss, outputs) if return_outputs else loss

    return WeightedTrainer


def apply_label_mapping_to_model_config(
    model: object,
    label_mapping: dict[str, int],
) -> None:
    model.config.label2id = dict(label_mapping)
    model.config.id2label = {
        int(label_id): label for label, label_id in label_mapping.items()
    }


def run_training(
    args: argparse.Namespace,
    datasets: dict[str, pd.DataFrame],
    label_mapping: dict[str, int],
) -> None:
    dependencies = load_training_dependencies()
    set_seed(args.random_state, dependencies.torch)

    id_to_label = {label_id: label for label, label_id in label_mapping.items()}
    label_to_id = {label: label_id for label, label_id in label_mapping.items()}
    class_weights_payload = None
    class_weights = None
    if args.weighted_loss:
        class_weights_payload, class_weights = build_class_weights(
            datasets["train"], label_mapping, args.run_name
        )

    tokenizer = dependencies.auto_tokenizer.from_pretrained(args.model_name)
    model = dependencies.auto_model_for_sequence_classification.from_pretrained(
        args.model_name,
        num_labels=len(label_mapping),
        id2label=id_to_label,
        label2id=label_to_id,
    )
    apply_label_mapping_to_model_config(model, label_mapping)

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
    trainer_class = build_trainer_class(
        trainer_class=dependencies.trainer,
        torch_module=dependencies.torch,
        weighted_loss_enabled=args.weighted_loss,
    )
    trainer_init_kwargs = {}
    if args.weighted_loss:
        trainer_init_kwargs["class_weights_tensor"] = dependencies.torch.tensor(
            class_weights,
            dtype=dependencies.torch.float,
        )

    trainer = trainer_class(
        model=model,
        args=training_arguments,
        train_dataset=train_dataset,
        eval_dataset=validation_dataset,
        data_collator=dependencies.data_collator_with_padding(tokenizer=tokenizer),
        compute_metrics=build_compute_metrics(),
        **build_trainer_kwargs(dependencies.trainer, tokenizer),
        **trainer_init_kwargs,
    )
    train_result = trainer.train()
    test_result = trainer.evaluate(test_dataset, metric_key_prefix="test")
    predictions = trainer.predict(test_dataset)

    apply_label_mapping_to_model_config(trainer.model, label_mapping)
    args.export_dir.mkdir(parents=True, exist_ok=True)
    trainer.save_model(str(args.export_dir))
    tokenizer.save_pretrained(str(args.export_dir))

    training_config = build_training_config(args, class_weights_payload)
    preprocessing_config = build_preprocessing_config(args)
    eval_metrics = build_eval_metrics(
        args=args,
        datasets=datasets,
        label_mapping=label_mapping,
        train_metrics=train_result.metrics,
        test_metrics=test_result,
        training_config=training_config,
        preprocessing_config=preprocessing_config,
    )
    save_training_outputs(
        args=args,
        datasets=datasets,
        label_mapping=label_mapping,
        train_metrics=train_result.metrics,
        test_metrics=test_result,
        eval_metrics=eval_metrics,
        training_config=training_config,
        preprocessing_config=preprocessing_config,
        prediction_output=predictions,
        log_history=trainer.state.log_history,
    )
    hub_result = maybe_push_to_hub(args)

    print(
        json.dumps(
            {
                "run_name": args.run_name,
                "export_dir": relative_to_project(args.export_dir),
                "metrics_output": relative_to_project(args.metrics_output),
                "hub_upload": hub_result,
            },
            indent=2,
            sort_keys=True,
        )
    )


def metric_value(metrics: dict[str, object], *names: str) -> float | None:
    for name in names:
        value = metrics.get(name)
        if value is not None:
            return float(value)

    return None


def build_eval_metrics(
    args: argparse.Namespace,
    datasets: dict[str, pd.DataFrame],
    label_mapping: dict[str, int],
    train_metrics: dict[str, float],
    test_metrics: dict[str, float],
    training_config: dict[str, object],
    preprocessing_config: dict[str, object],
) -> dict[str, object]:
    return {
        "run_name": args.run_name,
        "selected_configuration": {
            "base_model": args.model_name,
            "learning_rate": args.learning_rate,
            "weighted_loss_enabled": bool(args.weighted_loss),
            "batch_size": args.batch_size,
            "epochs": args.epochs,
            "max_length": args.max_length,
        },
        "dataset_version": args.dataset_version,
        "dataset_source": {
            "train_file": relative_to_project(args.train_file),
            "validation_file": relative_to_project(args.validation_file),
            "test_file": relative_to_project(args.test_file),
            "label_mapping_file": relative_to_project(args.label_mapping),
        },
        "preprocessing_version": args.preprocessing_version,
        "train_rows": int(len(datasets["train"])),
        "validation_rows": int(len(datasets["validation"])),
        "test_rows": int(len(datasets["test"])),
        "label_mapping": label_mapping,
        "label_distribution": {
            split_name: build_label_distribution(dataframe, label_mapping)
            for split_name, dataframe in datasets.items()
        },
        "accuracy": metric_value(test_metrics, "test_accuracy", "accuracy"),
        "precision_macro": metric_value(
            test_metrics, "test_precision_macro", "precision_macro"
        ),
        "precision_weighted": metric_value(
            test_metrics, "test_precision_weighted", "precision_weighted"
        ),
        "recall_macro": metric_value(test_metrics, "test_recall_macro", "recall_macro"),
        "recall_weighted": metric_value(
            test_metrics, "test_recall_weighted", "recall_weighted"
        ),
        "f1_macro": metric_value(test_metrics, "test_f1_macro", "f1_macro"),
        "f1_weighted": metric_value(test_metrics, "test_f1_weighted", "f1_weighted"),
        "loss": metric_value(test_metrics, "test_loss", "eval_loss", "loss"),
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "notes": args.metrics_note,
        "training_config": training_config,
        "preprocessing_config": preprocessing_config,
        "raw_train_metrics": train_metrics,
        "raw_test_metrics": test_metrics,
    }


def save_training_outputs(
    args: argparse.Namespace,
    datasets: dict[str, pd.DataFrame],
    label_mapping: dict[str, int],
    train_metrics: dict[str, float],
    test_metrics: dict[str, float],
    eval_metrics: dict[str, object],
    training_config: dict[str, object],
    preprocessing_config: dict[str, object],
    prediction_output: object,
    log_history: list[dict[str, object]],
) -> None:
    args.metrics_output.parent.mkdir(parents=True, exist_ok=True)
    args.export_dir.mkdir(parents=True, exist_ok=True)
    predictions = np.argmax(prediction_output.predictions, axis=-1)
    labels = prediction_output.label_ids
    id_to_label = {label_id: label for label, label_id in label_mapping.items()}
    research_metrics = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "run_name": args.run_name,
        "dataset_sizes": build_dataset_sizes(datasets),
        "label_distribution": {
            split_name: build_label_distribution(dataframe, label_mapping)
            for split_name, dataframe in datasets.items()
        },
        "training_config": training_config,
        "preprocessing_config": preprocessing_config,
        "eval_metrics": eval_metrics,
        "train_metrics": train_metrics,
        "test_metrics": test_metrics,
    }
    write_json(args.metrics_output, research_metrics)
    write_json(args.export_dir / "eval_metrics.json", eval_metrics)
    write_json(args.export_dir / "label_mapping.json", label_mapping)
    write_json(args.export_dir / "preprocessing_config.json", preprocessing_config)
    write_json(args.export_dir / "training_config.json", training_config)

    class_weights = training_config.get("class_weights")
    if class_weights is not None:
        write_json(args.export_dir / "class_weights.json", class_weights)
        write_json(args.metrics_output.parent / "indobert_class_weights.json", class_weights)

    (args.export_dir / "README.md").write_text(
        build_model_card(args, eval_metrics),
        encoding="utf-8",
    )
    save_predictions(
        test_dataframe=datasets["test"],
        predictions=predictions,
        labels=labels,
        id_to_label=id_to_label,
        output_path=build_predictions_output(args.metrics_output),
    )
    save_training_loss_figure(log_history, train_metrics, args.figures_dir)
    save_eval_metrics_figure(test_metrics, args.figures_dir)


def write_json(path: Path, data: object) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(
        json.dumps(data, indent=2, sort_keys=True, default=json_default),
        encoding="utf-8",
    )


def json_default(value: object) -> object:
    if isinstance(value, np.integer):
        return int(value)

    if isinstance(value, np.floating):
        return float(value)

    if isinstance(value, np.ndarray):
        return value.tolist()

    if isinstance(value, Path):
        return str(value)

    raise TypeError(f"Object of type {type(value).__name__} is not JSON serializable")


def build_model_card(args: argparse.Namespace, eval_metrics: dict[str, object]) -> str:
    accuracy = eval_metrics.get("accuracy")
    f1_macro = eval_metrics.get("f1_macro")
    metrics_line = (
        f"- Accuracy: {accuracy:.6f}\n- Macro F1: {f1_macro:.6f}"
        if accuracy is not None and f1_macro is not None
        else "- Metrics: see `eval_metrics.json`."
    )

    return f"""# SentiRank IndoBERT Sentiment Artifact

This artifact contains the SentiRank IndoBERT sentiment classifier for Spotify review analysis.

## Intended Use

- Task: Indonesian Spotify review sentiment classification.
- Labels: `Negative`, `Neutral`, `Positive`.
- Selected run: `{args.run_name}`.
- Base model: `{args.model_name}`.

## Training Notes

The selected configuration uses balanced class-weighted cross entropy and learning rate `{args.learning_rate}`. Metrics depend on the processed IndoBERT dataset used for this run. Because text quality filtering was strengthened after earlier experiments, historical run_3 metrics must not be treated as automatically final unless this configuration is re-trained and evaluated on the updated processed dataset.

## Metrics

{metrics_line}

See `eval_metrics.json`, `training_config.json`, and `preprocessing_config.json` for the complete exported metadata.

## Limitations

- Trained for SentiRank thesis-stage Spotify review sentiment analysis.
- Not a general-purpose Indonesian sentiment model.
- Not production-ready without the later sentiment-service integration and runtime validation milestone.

## Local Usage

```python
from transformers import AutoModelForSequenceClassification, AutoTokenizer, pipeline

model_dir = "{relative_to_project(args.export_dir)}"
tokenizer = AutoTokenizer.from_pretrained(model_dir)
model = AutoModelForSequenceClassification.from_pretrained(model_dir)

classifier = pipeline("text-classification", model=model, tokenizer=tokenizer)
print(classifier("aplikasi spotify sering error dan banyak iklan"))
```
"""


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
    figures_dir: Path,
) -> None:
    output_path = figures_dir / "indobert_training_loss.png"
    figures_dir.mkdir(parents=True, exist_ok=True)
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


def save_eval_metrics_figure(test_metrics: dict[str, float], figures_dir: Path) -> None:
    output_path = figures_dir / "indobert_eval_metrics.png"
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
    figures_dir.mkdir(parents=True, exist_ok=True)

    plt.figure(figsize=(9, 5))
    plt.bar(metric_names, metric_values, color="#2f6f9f")
    plt.title("IndoBERT Test Metrics")
    plt.ylabel("Score")
    plt.ylim(0, 1)
    plt.xticks(rotation=25, ha="right")
    plt.tight_layout()
    plt.savefig(output_path)
    plt.close()


def maybe_push_to_hub(args: argparse.Namespace) -> dict[str, object] | None:
    if not args.push_to_hub:
        return None

    if not args.hf_repo_id:
        raise ValueError("--hf-repo-id is required when --push-to-hub is set")

    token = os.environ.get(args.hf_token_env)
    if not token:
        raise RuntimeError(
            f"--push-to-hub was requested, but environment variable "
            f"{args.hf_token_env} is not set"
        )

    from huggingface_hub import HfApi

    api = HfApi()
    api.create_repo(
        repo_id=args.hf_repo_id,
        private=args.hf_private,
        exist_ok=True,
        token=token,
    )
    api.upload_folder(
        folder_path=str(args.export_dir),
        repo_id=args.hf_repo_id,
        token=token,
        commit_message=f"Upload SentiRank IndoBERT artifact {args.run_name}",
    )

    return {
        "repo_id": args.hf_repo_id,
        "private": bool(args.hf_private),
        "uploaded_at": datetime.now(timezone.utc).isoformat(),
    }


def main() -> None:
    args = parse_args()
    datasets, label_mapping = load_and_validate_inputs(args)

    if args.dry_run:
        print(
            json.dumps(
                build_dry_run_report(args, datasets, label_mapping),
                indent=2,
                sort_keys=True,
                default=json_default,
            )
        )
        return

    run_training(args, datasets, label_mapping)


if __name__ == "__main__":
    main()
