"""Calculate sample/development Fuzzy AHP weights from judgement CSV input."""

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
    Criterion,
    FuzzyAhpCalculateRequest,
    FuzzyAhpPairwiseComparison,
    FuzzyTriangularNumber,
)
from app.services.fuzzy_ahp_calculator import calculate_fuzzy_ahp


SAMPLE_FLAGS = {
    "is_sample": True,
    "not_final_expert_judgement": True,
}
EXPECTED_CRITERIA_COUNT = 5
EXPECTED_COMPARISON_COUNT = 10


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Calculate sample/development Fuzzy AHP weights from pairwise judgement CSV."
    )
    parser.add_argument(
        "--criteria-json",
        type=Path,
        default=PROJECT_ROOT / "docs/templates/ahp/final_criteria_for_ahp.json",
        help="Path to final criteria JSON.",
    )
    parser.add_argument(
        "--input",
        type=Path,
        default=Path(
            "../docs/templates/ahp/sample_development/fuzzy_ahp_pairwise_sample_development.csv"
        ),
        help="Path to Fuzzy AHP pairwise judgement CSV.",
    )
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=PROJECT_ROOT / "datasets/outputs/eda/07_fuzzy_ahp/sample_development",
        help="Directory for sample Fuzzy AHP calculation outputs.",
    )
    parser.add_argument(
        "--run-label",
        default="sample_development_only",
        help="Run label recorded in generated outputs.",
    )
    parser.add_argument(
        "--defuzzification-method",
        default="centroid",
        help="Defuzzification method. Phase 10C uses centroid.",
    )
    return parser.parse_args()


def load_criteria(criteria_json: Path) -> list[Criterion]:
    if not criteria_json.exists():
        raise FileNotFoundError(f"Criteria JSON not found: {criteria_json}")

    payload = json.loads(criteria_json.read_text(encoding="utf-8"))
    criteria_payload = payload.get("criteria")
    if not isinstance(criteria_payload, list):
        raise ValueError("Criteria JSON must contain a top-level 'criteria' list.")
    if len(criteria_payload) != EXPECTED_CRITERIA_COUNT:
        raise ValueError(
            f"Expected {EXPECTED_CRITERIA_COUNT} criteria, found {len(criteria_payload)}."
        )

    return [
        Criterion(
            id=str(item["criterion_id"]),
            name=str(item["criterion_name"]),
            description=item.get("description"),
        )
        for item in criteria_payload
    ]


def load_csv_rows(input_path: Path) -> list[dict[str, str]]:
    if not input_path.exists():
        raise FileNotFoundError(f"Fuzzy AHP pairwise CSV not found: {input_path}")

    with input_path.open("r", encoding="utf-8", newline="") as file:
        rows = list(csv.DictReader(file))

    if len(rows) != EXPECTED_COMPARISON_COUNT:
        raise ValueError(
            f"Expected {EXPECTED_COMPARISON_COUNT} pairwise comparisons, found {len(rows)}."
        )
    return rows


def _parse_tfn(row: dict[str, str]) -> FuzzyTriangularNumber:
    comparison_id = row.get("comparison_id", "").strip()
    try:
        value = FuzzyTriangularNumber(
            l=float(row.get("fuzzy_l", "")),
            m=float(row.get("fuzzy_m", "")),
            u=float(row.get("fuzzy_u", "")),
        )
    except ValueError as exc:
        raise ValueError(f"Comparison {comparison_id} has invalid TFN values.") from exc
    return value


def validate_pairwise_rows(
    rows: list[dict[str, str]],
    criteria: list[Criterion],
) -> None:
    valid_names = {criterion.name for criterion in criteria}
    seen_pairs: set[tuple[str, str]] = set()

    for row in rows:
        comparison_id = row.get("comparison_id", "").strip()
        criterion_a = row.get("criterion_a", "").strip()
        criterion_b = row.get("criterion_b", "").strip()
        if not comparison_id:
            raise ValueError("Each Fuzzy AHP comparison must have a comparison_id.")
        if criterion_a not in valid_names or criterion_b not in valid_names:
            raise ValueError(
                f"Unknown criterion in {comparison_id}: {criterion_a} vs {criterion_b}"
            )
        if criterion_a == criterion_b:
            raise ValueError(f"Comparison {comparison_id} uses the same criterion twice.")

        pair_key = tuple(sorted((criterion_a, criterion_b)))
        if pair_key in seen_pairs:
            raise ValueError(f"Duplicate comparison pair in {comparison_id}: {pair_key}")
        seen_pairs.add(pair_key)

        _parse_tfn(row)

    expected_pairs = {
        tuple(sorted((criteria[index_a].name, criteria[index_b].name)))
        for index_a in range(len(criteria))
        for index_b in range(index_a + 1, len(criteria))
    }
    missing_pairs = sorted(expected_pairs - seen_pairs)
    if missing_pairs:
        raise ValueError(f"Missing Fuzzy AHP comparison pairs: {missing_pairs}")


def build_comparisons(rows: list[dict[str, str]]) -> list[FuzzyAhpPairwiseComparison]:
    return [
        FuzzyAhpPairwiseComparison(
            criterion_a=row["criterion_a"].strip(),
            criterion_b=row["criterion_b"].strip(),
            fuzzy_value_a_over_b=_parse_tfn(row),
            linguistic_scale=row.get("linguistic_scale") or None,
            justification=row.get("justification") or None,
        )
        for row in rows
    ]


def write_json(path: Path, payload: dict[str, Any]) -> None:
    path.write_text(json.dumps(payload, indent=2, ensure_ascii=False), encoding="utf-8")


def tfn_to_dict(value: FuzzyTriangularNumber) -> dict[str, float]:
    return value.model_dump()


def write_weights_csv(path: Path, rows: list[dict[str, Any]]) -> None:
    fields = [
        "criterion_id",
        "criterion_name",
        "fuzzy_l",
        "fuzzy_m",
        "fuzzy_u",
        "defuzzified_weight",
        "normalized_weight",
        "rank",
        "run_label",
        "is_sample",
        "not_final_expert_judgement",
    ]
    with path.open("w", encoding="utf-8", newline="") as file:
        writer = csv.DictWriter(file, fieldnames=fields)
        writer.writeheader()
        writer.writerows(rows)


def save_weight_figure(path: Path, weight_rows: list[dict[str, Any]]) -> None:
    sorted_rows = sorted(weight_rows, key=lambda item: item["rank"])
    labels = [item["criterion_name"] for item in sorted_rows]
    weights = [item["normalized_weight"] for item in sorted_rows]

    plt.figure(figsize=(10, 5))
    plt.bar(labels, weights, color="#0f766e")
    plt.ylabel("Normalized Fuzzy AHP weight")
    plt.title("Sample Development Fuzzy AHP Criteria Weights")
    plt.xticks(rotation=30, ha="right")
    plt.tight_layout()
    path.parent.mkdir(parents=True, exist_ok=True)
    plt.savefig(path, dpi=160)
    plt.close()


def main() -> None:
    args = parse_args()
    criteria_path = args.criteria_json.resolve()
    input_path = args.input.resolve()
    output_dir = args.output_dir.resolve()
    output_dir.mkdir(parents=True, exist_ok=True)

    criteria = load_criteria(criteria_path)
    rows = load_csv_rows(input_path)
    validate_pairwise_rows(rows, criteria)
    comparisons = build_comparisons(rows)

    response = calculate_fuzzy_ahp(
        FuzzyAhpCalculateRequest(
            run_label=args.run_label,
            criteria=criteria,
            comparisons=comparisons,
            defuzzification_method=args.defuzzification_method,
        )
    )

    weights_json_rows = [
        {
            **weight.model_dump(),
            "run_label": args.run_label,
            **SAMPLE_FLAGS,
        }
        for weight in response.weights
    ]
    weights_csv_rows = [
        {
            "criterion_id": weight.criterion_id,
            "criterion_name": weight.criterion_name,
            "fuzzy_l": weight.fuzzy_weight.l,
            "fuzzy_m": weight.fuzzy_weight.m,
            "fuzzy_u": weight.fuzzy_weight.u,
            "defuzzified_weight": weight.defuzzified_weight,
            "normalized_weight": weight.normalized_weight,
            "rank": weight.rank,
            "run_label": args.run_label,
            **SAMPLE_FLAGS,
        }
        for weight in response.weights
    ]

    weights_json = output_dir / "fuzzy_ahp_weights_sample_development.json"
    weights_csv = output_dir / "fuzzy_ahp_weights_sample_development.csv"
    matrix_json = output_dir / "fuzzy_ahp_pairwise_matrix_sample_development.json"
    consistency_json = output_dir / "fuzzy_ahp_modal_consistency_sample_development.json"
    summary_json = output_dir / "fuzzy_ahp_calculation_summary_sample_development.json"
    figure_path = (
        PROJECT_ROOT
        / "docs"
        / "figures"
        / "07_fuzzy_ahp"
        / "sample_development"
        / "fuzzy_ahp_weights_sample_development.png"
    )

    write_json(
        weights_json,
        {
            "run_label": args.run_label,
            **SAMPLE_FLAGS,
            "method": response.method,
            "criteria_count": response.criteria_count,
            "defuzzification_method": response.defuzzification_method,
            "weights": weights_json_rows,
            "warnings": response.warnings,
        },
    )
    write_weights_csv(weights_csv, weights_csv_rows)
    write_json(
        matrix_json,
        {
            "run_label": args.run_label,
            **SAMPLE_FLAGS,
            "criteria": [criterion.model_dump() for criterion in criteria],
            "fuzzy_pairwise_matrix": [
                [tfn_to_dict(value) for value in row]
                for row in response.fuzzy_pairwise_matrix
            ],
            "modal_crisp_matrix": response.modal_crisp_matrix,
        },
    )
    write_json(
        consistency_json,
        {
            "run_label": args.run_label,
            **SAMPLE_FLAGS,
            "consistency_ratio_modal": response.consistency_ratio_modal,
            "consistency_threshold": response.consistency_threshold,
            "is_consistent_modal": response.is_consistent_modal,
            "warnings": response.warnings,
        },
    )
    write_json(
        summary_json,
        {
            "run_label": args.run_label,
            **SAMPLE_FLAGS,
            "methodology_note": (
                "Sample development output for pipeline validation only. "
                "This is not final expert judgement and must not be used as a thesis ranking."
            ),
            "criteria_json": str(criteria_path),
            "input": str(input_path),
            "output_dir": str(output_dir),
            "figure": str(figure_path),
            "criteria_count": len(criteria),
            "pairwise_comparison_count": len(comparisons),
            "defuzzification_method": response.defuzzification_method,
            "consistency_ratio_modal": response.consistency_ratio_modal,
            "is_consistent_modal": response.is_consistent_modal,
            "generated_at": datetime.now(UTC).isoformat(),
        },
    )
    save_weight_figure(figure_path, weights_csv_rows)

    print(f"Fuzzy AHP sample weights written to: {weights_json}")
    print(f"Fuzzy AHP sample modal CR: {response.consistency_ratio_modal:.10f}")
    print(f"Fuzzy AHP sample figure written to: {figure_path}")


if __name__ == "__main__":
    main()
