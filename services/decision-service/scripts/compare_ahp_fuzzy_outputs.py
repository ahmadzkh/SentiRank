"""Compare sample/development AHP and Fuzzy AHP outputs."""

from __future__ import annotations

import argparse
import csv
import json
import sys
from datetime import UTC, datetime
from pathlib import Path
from typing import Any

import matplotlib.pyplot as plt


DECISION_ROOT = Path(__file__).resolve().parents[1]
PROJECT_ROOT = DECISION_ROOT.parent.parent
if str(DECISION_ROOT) not in sys.path:
    sys.path.insert(0, str(DECISION_ROOT))

from app.schemas.ahp import (
    AhpCriterionWeight,
    FuzzyAhpCriterionWeight,
    RankingComparisonRequest,
)
from app.services.ranking_comparison import compare_ahp_and_fuzzy_ahp


SAMPLE_FLAGS = {
    "is_sample": True,
    "not_final_expert_judgement": True,
}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Compare sample/development AHP and Fuzzy AHP output weights."
    )
    parser.add_argument(
        "--ahp-weights",
        type=Path,
        default=Path(
            "../datasets/outputs/eda/06_ahp/sample_development/ahp_weights_sample_development.json"
        ),
        help="Path to sample AHP weights JSON.",
    )
    parser.add_argument(
        "--fuzzy-weights",
        type=Path,
        default=Path(
            "../datasets/outputs/eda/07_fuzzy_ahp/sample_development/fuzzy_ahp_weights_sample_development.json"
        ),
        help="Path to sample Fuzzy AHP weights JSON.",
    )
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=PROJECT_ROOT / "datasets/outputs/eda/08_ranking_comparison/sample_development",
        help="Directory for sample comparison outputs.",
    )
    parser.add_argument(
        "--run-label",
        default="sample_development_only",
        help="Run label recorded in generated outputs.",
    )
    return parser.parse_args()


def load_json(path: Path) -> dict[str, Any]:
    if not path.exists():
        raise FileNotFoundError(f"Required weights JSON not found: {path}")
    return json.loads(path.read_text(encoding="utf-8"))


def load_ahp_weights(path: Path) -> list[AhpCriterionWeight]:
    payload = load_json(path)
    weights = payload.get("weights")
    if not isinstance(weights, list):
        raise ValueError(f"AHP weights JSON must contain a 'weights' list: {path}")
    return [AhpCriterionWeight(**weight) for weight in weights]


def load_fuzzy_weights(path: Path) -> list[FuzzyAhpCriterionWeight]:
    payload = load_json(path)
    weights = payload.get("weights")
    if not isinstance(weights, list):
        raise ValueError(f"Fuzzy AHP weights JSON must contain a 'weights' list: {path}")
    return [FuzzyAhpCriterionWeight(**weight) for weight in weights]


def write_json(path: Path, payload: dict[str, Any]) -> None:
    path.write_text(json.dumps(payload, indent=2, ensure_ascii=False), encoding="utf-8")


def write_comparison_csv(path: Path, rows: list[dict[str, Any]]) -> None:
    fields = [
        "criterion_id",
        "criterion_name",
        "ahp_weight",
        "fuzzy_ahp_weight",
        "ahp_rank",
        "fuzzy_ahp_rank",
        "weight_delta",
        "rank_delta",
        "run_label",
        "is_sample",
        "not_final_expert_judgement",
    ]
    with path.open("w", encoding="utf-8", newline="") as file:
        writer = csv.DictWriter(file, fieldnames=fields)
        writer.writeheader()
        writer.writerows(rows)


def save_comparison_figure(path: Path, rows: list[dict[str, Any]]) -> None:
    sorted_rows = sorted(rows, key=lambda item: item["ahp_rank"])
    labels = [item["criterion_name"] for item in sorted_rows]
    ahp_weights = [item["ahp_weight"] for item in sorted_rows]
    fuzzy_weights = [item["fuzzy_ahp_weight"] for item in sorted_rows]
    positions = list(range(len(labels)))
    width = 0.38

    plt.figure(figsize=(11, 5))
    plt.bar([position - width / 2 for position in positions], ahp_weights, width, label="AHP")
    plt.bar(
        [position + width / 2 for position in positions],
        fuzzy_weights,
        width,
        label="Fuzzy AHP",
    )
    plt.ylabel("Weight")
    plt.title("Sample Development AHP vs Fuzzy AHP Weight Comparison")
    plt.xticks(positions, labels, rotation=30, ha="right")
    plt.legend()
    plt.tight_layout()
    path.parent.mkdir(parents=True, exist_ok=True)
    plt.savefig(path, dpi=160)
    plt.close()


def main() -> None:
    args = parse_args()
    ahp_path = args.ahp_weights.resolve()
    fuzzy_path = args.fuzzy_weights.resolve()
    output_dir = args.output_dir.resolve()
    output_dir.mkdir(parents=True, exist_ok=True)

    ahp_weights = load_ahp_weights(ahp_path)
    fuzzy_weights = load_fuzzy_weights(fuzzy_path)

    response = compare_ahp_and_fuzzy_ahp(
        RankingComparisonRequest(
            run_label=args.run_label,
            ahp_weights=ahp_weights,
            fuzzy_ahp_weights=fuzzy_weights,
        )
    )

    rows = [
        {
            **item.model_dump(),
            "run_label": args.run_label,
            **SAMPLE_FLAGS,
        }
        for item in response.items
    ]

    comparison_json = output_dir / "ahp_fuzzy_ranking_comparison_sample_development.json"
    comparison_csv = output_dir / "ahp_fuzzy_ranking_comparison_sample_development.csv"
    summary_json = output_dir / "ranking_comparison_summary_sample_development.json"
    figure_path = (
        PROJECT_ROOT
        / "docs"
        / "figures"
        / "08_ranking_comparison"
        / "sample_development"
        / "ahp_fuzzy_weight_comparison_sample_development.png"
    )

    write_json(
        comparison_json,
        {
            "run_label": args.run_label,
            **SAMPLE_FLAGS,
            "items": rows,
            "summary": response.summary,
            "warnings": response.warnings,
        },
    )
    write_comparison_csv(comparison_csv, rows)
    write_json(
        summary_json,
        {
            "run_label": args.run_label,
            **SAMPLE_FLAGS,
            "methodology_note": (
                "Sample development comparison for pipeline validation only. "
                "This is not final expert judgement and must not be used as a thesis ranking."
            ),
            "ahp_weights": str(ahp_path),
            "fuzzy_ahp_weights": str(fuzzy_path),
            "output_dir": str(output_dir),
            "figure": str(figure_path),
            "summary": response.summary,
            "generated_at": datetime.now(UTC).isoformat(),
        },
    )
    save_comparison_figure(figure_path, rows)

    print(f"Sample AHP/Fuzzy comparison written to: {comparison_json}")
    print(f"Changed rank count: {response.summary.get('changed_rank_count')}")
    print(f"Sample comparison figure written to: {figure_path}")


if __name__ == "__main__":
    main()
