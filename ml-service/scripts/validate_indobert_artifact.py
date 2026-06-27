"""Validate an exported SentiRank IndoBERT Hugging Face artifact."""

from __future__ import annotations

import argparse
import json
from pathlib import Path


REQUIRED_METADATA_FILES = [
    "config.json",
    "tokenizer_config.json",
    "special_tokens_map.json",
    "eval_metrics.json",
    "label_mapping.json",
    "preprocessing_config.json",
    "training_config.json",
    "README.md",
]
MODEL_WEIGHT_FILES = ["model.safetensors", "pytorch_model.bin"]
TOKENIZER_VOCAB_FILES = ["tokenizer.json", "vocab.txt", "spiece.model"]


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=(
            "Validate that an exported IndoBERT artifact folder contains the "
            "required Hugging Face files and can be loaded locally."
        )
    )
    parser.add_argument("--model-dir", type=Path, required=True)
    parser.add_argument(
        "--sample-text",
        default="aplikasi spotify sering error dan terlalu banyak iklan",
    )

    return parser.parse_args()


def require_file(model_dir: Path, filename: str) -> None:
    path = model_dir / filename
    if not path.is_file():
        raise FileNotFoundError(f"Missing required artifact file: {path}")


def require_one_of(model_dir: Path, filenames: list[str], description: str) -> str:
    for filename in filenames:
        if (model_dir / filename).is_file():
            return filename

    raise FileNotFoundError(
        f"Missing {description}; expected one of: {', '.join(filenames)}"
    )


def validate_label_mapping(model_dir: Path) -> dict[str, int]:
    mapping_path = model_dir / "label_mapping.json"
    mapping = json.loads(mapping_path.read_text(encoding="utf-8"))
    normalized = {str(label): int(label_id) for label, label_id in mapping.items()}
    expected_labels = {"Negative", "Neutral", "Positive"}

    if set(normalized.keys()) != expected_labels:
        raise ValueError(
            f"Unexpected labels in label_mapping.json: {sorted(normalized.keys())}"
        )

    if set(normalized.values()) != {0, 1, 2}:
        raise ValueError(
            f"Unexpected label IDs in label_mapping.json: {sorted(normalized.values())}"
        )

    return normalized


def load_and_run_sample(model_dir: Path, sample_text: str) -> dict[str, object]:
    import torch
    from transformers import AutoModelForSequenceClassification, AutoTokenizer

    tokenizer = AutoTokenizer.from_pretrained(model_dir)
    model = AutoModelForSequenceClassification.from_pretrained(model_dir)
    model.eval()

    encoded = tokenizer(sample_text, return_tensors="pt", truncation=True, max_length=128)
    with torch.no_grad():
        output = model(**encoded)

    probabilities = torch.softmax(output.logits, dim=-1)[0]
    predicted_id = int(torch.argmax(probabilities).item())
    id_to_label = {
        int(label_id): label for label, label_id in model.config.label2id.items()
    }

    return {
        "sample_text": sample_text,
        "predicted_label_id": predicted_id,
        "predicted_label": id_to_label.get(predicted_id, str(predicted_id)),
        "confidence": float(probabilities[predicted_id].item()),
    }


def validate_artifact(model_dir: Path, sample_text: str) -> dict[str, object]:
    if not model_dir.is_dir():
        raise FileNotFoundError(f"Artifact directory does not exist: {model_dir}")

    for filename in REQUIRED_METADATA_FILES:
        require_file(model_dir, filename)

    model_weight_file = require_one_of(
        model_dir,
        MODEL_WEIGHT_FILES,
        "model weights",
    )
    tokenizer_vocab_file = require_one_of(
        model_dir,
        TOKENIZER_VOCAB_FILES,
        "tokenizer vocabulary",
    )
    label_mapping = validate_label_mapping(model_dir)
    sample_result = load_and_run_sample(model_dir, sample_text)

    return {
        "valid": True,
        "model_dir": str(model_dir),
        "model_weight_file": model_weight_file,
        "tokenizer_vocab_file": tokenizer_vocab_file,
        "label_mapping": label_mapping,
        "sample_inference": sample_result,
    }


def main() -> None:
    args = parse_args()
    result = validate_artifact(args.model_dir.resolve(), args.sample_text)
    print(json.dumps(result, indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
