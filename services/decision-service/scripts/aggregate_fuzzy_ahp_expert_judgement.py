"""Aggregate validated Fuzzy AHP expert judgement CSV files."""

from __future__ import annotations

import argparse
import csv
import json
import math
from datetime import UTC, datetime
from pathlib import Path
from typing import Any

from validate_fuzzy_ahp_expert_judgement import (
    load_criteria,
    load_csv_rows,
    parse_bool,
    validate_fuzzy_ahp_expert_judgement,
)
SCRIPT_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = SCRIPT_DIR.parent.parent.parent

AGGREGATION_METHOD = "component_wise_geometric_mean"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Aggregate validated Fuzzy AHP expert pairwise judgements."
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
        help="Path to filled Fuzzy AHP pairwise judgement CSV.",
    )
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=PROJECT_ROOT / "datasets/outputs/eda/07_fuzzy_ahp/aggregated",
        help="Directory for aggregated Fuzzy AHP judgement outputs.",
    )
    parser.add_argument(
        "--run-label",
        default="sample_development_only",
        help="Run label recorded in generated outputs.",
    )
    parser.add_argument(
        "--allow-sample",
        type=parse_bool,
        default=True,
        help="Allow sample/development inputs.",
    )
    return parser.parse_args()


def geometric_mean(values: list[float]) -> float:
    if not values:
        raise ValueError("At least one value is required for geometric mean.")
    if any(value <= 0 for value in values):
        raise ValueError("Geometric mean values must be positive.")
    return math.exp(sum(math.log(value) for value in values) / len(values))


def expected_pairs(criteria: list[dict[str, str]]) -> list[tuple[str, str]]:
    return [
        (criteria[index_a]["criterion_name"], criteria[index_b]["criterion_name"])
        for index_a in range(len(criteria))
        for index_b in range(index_a + 1, len(criteria))
    ]


def _tfn_for_expected_orientation(
    row: dict[str, str],
    expected_pair: tuple[str, str],
) -> tuple[float, float, float]:
    criterion_a = row["criterion_a"].strip()
    criterion_b = row["criterion_b"].strip()
    fuzzy_l = float(row["fuzzy_l"])
    fuzzy_m = float(row["fuzzy_m"])
    fuzzy_u = float(row["fuzzy_u"])
    if (criterion_a, criterion_b) == expected_pair:
        return fuzzy_l, fuzzy_m, fuzzy_u
    if (criterion_b, criterion_a) == expected_pair:
        return 1.0 / fuzzy_u, 1.0 / fuzzy_m, 1.0 / fuzzy_l
    raise ValueError(f"Row does not match expected pair: {expected_pair}")


def aggregate_fuzzy_rows(
    rows: list[dict[str, str]],
    criteria: list[dict[str, str]],
) -> list[dict[str, Any]]:
    respondent_ids = sorted({row["respondent_id"].strip() for row in rows})
    aggregated_rows = []

    for index, expected_pair in enumerate(expected_pairs(criteria), start=1):
        pair_values = [
            _tfn_for_expected_orientation(row, expected_pair)
            for row in rows
            if set((row["criterion_a"].strip(), row["criterion_b"].strip()))
            == set(expected_pair)
        ]
        if len(pair_values) != len(respondent_ids):
            raise ValueError(
                f"Expected {len(respondent_ids)} TFNs for pair {expected_pair}, "
                f"found {len(pair_values)}."
            )
        fuzzy_l = geometric_mean([value[0] for value in pair_values])
        fuzzy_m = geometric_mean([value[1] for value in pair_values])
        fuzzy_u = geometric_mean([value[2] for value in pair_values])
        if fuzzy_l > fuzzy_m or fuzzy_m > fuzzy_u:
            raise ValueError(f"Aggregated TFN is invalid for pair {expected_pair}.")
        aggregated_rows.append(
            {
                "comparison_id": f"P{index:02d}",
                "criterion_a": expected_pair[0],
                "criterion_b": expected_pair[1],
                "fuzzy_l": fuzzy_l,
                "fuzzy_m": fuzzy_m,
                "fuzzy_u": fuzzy_u,
                "fuzzy_value_a_over_b": f"({fuzzy_l}, {fuzzy_m}, {fuzzy_u})",
                "respondent_count": len(pair_values),
                "aggregation_method": AGGREGATION_METHOD,
            }
        )
    return aggregated_rows


def write_json(path: Path, payload: dict[str, Any]) -> None:
    path.write_text(json.dumps(payload, indent=2, ensure_ascii=False), encoding="utf-8")


def write_csv(path: Path, rows: list[dict[str, Any]], run_label: str, is_sample: bool) -> None:
    fields = [
        "run_label",
        "is_sample",
        "not_final_expert_judgement",
        "comparison_id",
        "criterion_a",
        "criterion_b",
        "fuzzy_l",
        "fuzzy_m",
        "fuzzy_u",
        "fuzzy_value_a_over_b",
        "respondent_count",
        "aggregation_method",
    ]
    with path.open("w", encoding="utf-8", newline="") as file:
        writer = csv.DictWriter(file, fieldnames=fields)
        writer.writeheader()
        for row in rows:
            writer.writerow(
                {
                    "run_label": run_label,
                    "is_sample": is_sample,
                    "not_final_expert_judgement": is_sample,
                    **row,
                }
            )


def aggregate_fuzzy_ahp_expert_judgement(
    criteria_json: Path,
    input_path: Path,
    run_label: str,
    allow_sample: bool,
) -> dict[str, Any]:
    validation_report = validate_fuzzy_ahp_expert_judgement(
        criteria_json,
        input_path,
        run_label,
        allow_sample,
    )
    if not validation_report["can_calculate"]:
        raise ValueError(
            "Fuzzy AHP expert judgement input failed validation; aggregation was not written."
        )

    criteria = load_criteria(criteria_json)
    rows, _ = load_csv_rows(input_path)
    aggregated_rows = aggregate_fuzzy_rows(rows, criteria)
    return {
        "run_label": run_label,
        "is_sample": validation_report["is_sample"],
        "not_final_expert_judgement": validation_report["is_sample"],
        "total_respondents": validation_report["total_respondents"],
        "aggregation_method": AGGREGATION_METHOD,
        "criteria_count": len(criteria),
        "pairwise_comparison_count": len(aggregated_rows),
        "aggregated_comparisons": aggregated_rows,
        "methodology_note": (
            "Aggregated fuzzy pairwise judgement only. This script does not "
            "calculate Fuzzy AHP weights or final rankings."
        ),
        "generated_at": datetime.now(UTC).isoformat(),
    }


def write_aggregation_outputs(payload: dict[str, Any], output_dir: Path) -> tuple[Path, Path]:
    output_dir.mkdir(parents=True, exist_ok=True)
    json_path = output_dir / "fuzzy_ahp_aggregated_pairwise_judgement.json"
    csv_path = output_dir / "fuzzy_ahp_aggregated_pairwise_judgement.csv"
    write_json(json_path, payload)
    write_csv(
        csv_path,
        payload["aggregated_comparisons"],
        payload["run_label"],
        payload["is_sample"],
    )
    return json_path, csv_path


def main() -> None:
    args = parse_args()
    payload = aggregate_fuzzy_ahp_expert_judgement(
        args.criteria_json.resolve(),
        args.input.resolve(),
        args.run_label,
        args.allow_sample,
    )
    json_path, csv_path = write_aggregation_outputs(payload, args.output_dir.resolve())
    print(f"Fuzzy AHP aggregated judgement JSON: {json_path}")
    print(f"Fuzzy AHP aggregated judgement CSV: {csv_path}")
    print(f"Total respondents: {payload['total_respondents']}")
    print(f"Aggregated comparisons: {payload['pairwise_comparison_count']}")


if __name__ == "__main__":
    main()
