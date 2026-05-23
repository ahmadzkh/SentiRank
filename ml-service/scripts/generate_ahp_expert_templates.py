"""Generate blank AHP and Fuzzy AHP expert judgement templates.

This script prepares expert data-collection templates only. It does not
calculate AHP weights, Fuzzy AHP weights, priority scores, or rankings.
"""

from __future__ import annotations

import argparse
import csv
import json
from itertools import combinations
from pathlib import Path
from typing import Any


AHP_FIELDS = [
    "respondent_id",
    "respondent_role",
    "comparison_id",
    "criterion_a",
    "criterion_b",
    "preferred_criterion",
    "intensity_saaty",
    "ahp_value_a_over_b",
    "justification",
]

FUZZY_AHP_FIELDS = [
    "respondent_id",
    "respondent_role",
    "comparison_id",
    "criterion_a",
    "criterion_b",
    "preferred_criterion",
    "linguistic_scale",
    "fuzzy_l",
    "fuzzy_m",
    "fuzzy_u",
    "fuzzy_value_a_over_b",
    "justification",
]

EXPERT_METADATA_FIELDS = [
    "respondent_id",
    "expert_name_or_code",
    "role",
    "institution_or_background",
    "experience_years",
    "relevance_to_application_quality",
    "relevance_to_software_engineering",
    "relevance_to_user_experience",
    "notes",
]


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Generate blank AHP and Fuzzy AHP expert judgement templates."
    )
    parser.add_argument(
        "--criteria-json",
        type=Path,
        default=Path("../docs/templates/ahp/final_criteria_for_ahp.json"),
        help="Path to final criteria JSON with a top-level criteria array.",
    )
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=Path("../docs/templates/ahp"),
        help="Directory where expert judgement templates will be written.",
    )
    return parser.parse_args()


def load_criteria(criteria_json: Path) -> list[dict[str, Any]]:
    if not criteria_json.exists():
        raise FileNotFoundError(f"Criteria JSON not found: {criteria_json}")

    with criteria_json.open("r", encoding="utf-8") as file:
        payload = json.load(file)

    criteria = payload.get("criteria")
    if not isinstance(criteria, list):
        raise ValueError("Criteria JSON must contain a top-level 'criteria' list.")
    if len(criteria) != 5:
        raise ValueError(f"Expected exactly 5 criteria, found {len(criteria)}.")

    required_fields = {
        "criterion_id",
        "criterion_name",
        "description",
        "source_labels",
        "use_in_ahp",
        "expert_validation_required",
    }
    for criterion in criteria:
        missing = required_fields - set(criterion)
        if missing:
            raise ValueError(
                f"Criterion {criterion.get('criterion_id', '<unknown>')} "
                f"is missing fields: {sorted(missing)}"
            )

    return criteria


def build_pairwise_rows(
    criteria: list[dict[str, Any]], fields: list[str]
) -> list[dict[str, str]]:
    rows: list[dict[str, str]] = []
    for index, (criterion_a, criterion_b) in enumerate(combinations(criteria, 2), start=1):
        row = {field: "" for field in fields}
        row["comparison_id"] = f"P{index:02d}"
        row["criterion_a"] = criterion_a["criterion_name"]
        row["criterion_b"] = criterion_b["criterion_name"]
        rows.append(row)

    if len(rows) != 10:
        raise ValueError(f"Expected exactly 10 pairwise comparisons, found {len(rows)}.")

    return rows


def write_csv(path: Path, rows: list[dict[str, str]], fields: list[str]) -> None:
    with path.open("w", encoding="utf-8", newline="") as file:
        writer = csv.DictWriter(file, fieldnames=fields)
        writer.writeheader()
        writer.writerows(rows)


def write_json_records(path: Path, rows: list[dict[str, str]]) -> None:
    path.write_text(json.dumps(rows, indent=2, ensure_ascii=False), encoding="utf-8")


def main() -> None:
    args = parse_args()
    criteria = load_criteria(args.criteria_json)
    output_dir = args.output_dir
    output_dir.mkdir(parents=True, exist_ok=True)

    ahp_rows = build_pairwise_rows(criteria, AHP_FIELDS)
    fuzzy_rows = build_pairwise_rows(criteria, FUZZY_AHP_FIELDS)
    expert_rows: list[dict[str, str]] = []

    write_csv(output_dir / "ahp_pairwise_template.csv", ahp_rows, AHP_FIELDS)
    write_json_records(output_dir / "ahp_pairwise_template.json", ahp_rows)

    write_csv(
        output_dir / "fuzzy_ahp_pairwise_template.csv",
        fuzzy_rows,
        FUZZY_AHP_FIELDS,
    )
    write_json_records(output_dir / "fuzzy_ahp_pairwise_template.json", fuzzy_rows)

    write_csv(
        output_dir / "expert_metadata_template.csv",
        expert_rows,
        EXPERT_METADATA_FIELDS,
    )

    print(f"Loaded criteria: {len(criteria)}")
    print(f"Generated pairwise comparisons: {len(ahp_rows)}")
    print(f"Output directory: {output_dir.resolve()}")


if __name__ == "__main__":
    main()
