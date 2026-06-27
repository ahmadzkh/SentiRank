"""Validate AHP expert judgement CSV files before aggregation or calculation."""

from __future__ import annotations

import argparse
import csv
import json
import math
from datetime import UTC, datetime
from pathlib import Path
from typing import Any

SCRIPT_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = SCRIPT_DIR.parent.parent.parent

EXPECTED_CRITERIA_COUNT = 5
EXPECTED_COMPARISON_COUNT = 10
VALID_PREFERENCES = {"criterion_a", "criterion_b", "equal"}
REQUIRED_COLUMNS = [
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
FLOAT_TOLERANCE = 1e-6


def parse_bool(value: str | bool) -> bool:
    if isinstance(value, bool):
        return value
    normalized = value.strip().lower()
    if normalized in {"1", "true", "yes", "y"}:
        return True
    if normalized in {"0", "false", "no", "n"}:
        return False
    raise argparse.ArgumentTypeError(f"Invalid boolean value: {value}")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Validate AHP expert judgement CSV before aggregation."
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
            "../docs/templates/ahp/sample_development/ahp_pairwise_sample_development.csv"
        ),
        help="Path to filled AHP pairwise judgement CSV.",
    )
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=PROJECT_ROOT / "datasets/outputs/eda/06_ahp/validation",
        help="Directory for validation report outputs.",
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


def is_sample_run(run_label: str, input_path: Path, rows: list[dict[str, str]] | None = None) -> bool:
    text = f"{run_label} {input_path}".lower()
    if "sample" in text or "development" in text:
        return True
    for row in rows or []:
        row_label = str(row.get("run_label", "")).lower()
        row_flag = str(row.get("not_final_expert_judgement", "")).lower()
        if "sample" in row_label or row_flag in {"true", "1", "yes"}:
            return True
    return False


def load_criteria(criteria_json: Path) -> list[dict[str, str]]:
    if not criteria_json.exists():
        raise FileNotFoundError(f"Criteria JSON not found: {criteria_json}")

    payload = json.loads(criteria_json.read_text(encoding="utf-8"))
    criteria = payload.get("criteria")
    if not isinstance(criteria, list):
        raise ValueError("Criteria JSON must contain a top-level 'criteria' list.")
    if len(criteria) != EXPECTED_CRITERIA_COUNT:
        raise ValueError(
            f"Expected {EXPECTED_CRITERIA_COUNT} criteria, found {len(criteria)}."
        )

    result = []
    for criterion in criteria:
        criterion_id = str(criterion.get("criterion_id", "")).strip()
        criterion_name = str(criterion.get("criterion_name", "")).strip()
        if not criterion_id or not criterion_name:
            raise ValueError("Each criterion must have criterion_id and criterion_name.")
        result.append({"criterion_id": criterion_id, "criterion_name": criterion_name})
    return result


def load_csv_rows(input_path: Path) -> tuple[list[dict[str, str]], list[str]]:
    if not input_path.exists():
        raise FileNotFoundError(f"AHP expert judgement CSV not found: {input_path}")

    with input_path.open("r", encoding="utf-8", newline="") as file:
        reader = csv.DictReader(file)
        return list(reader), list(reader.fieldnames or [])


def expected_pair_keys(criteria: list[dict[str, str]]) -> dict[tuple[str, str], tuple[str, str]]:
    result = {}
    for index_a in range(len(criteria)):
        for index_b in range(index_a + 1, len(criteria)):
            pair = (criteria[index_a]["criterion_name"], criteria[index_b]["criterion_name"])
            result[tuple(sorted(pair))] = pair
    return result


def issue(
    respondent_id: str,
    comparison_id: str,
    issue_type: str,
    message: str,
) -> dict[str, str]:
    return {
        "respondent_id": respondent_id,
        "comparison_id": comparison_id,
        "issue_type": issue_type,
        "message": message,
    }


def _parse_intensity(value: str) -> int | None:
    try:
        parsed = float(value)
    except (TypeError, ValueError):
        return None
    if not parsed.is_integer():
        return None
    return int(parsed)


def _parse_float(value: str) -> float | None:
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def validate_ahp_rows(
    rows: list[dict[str, str]],
    fieldnames: list[str],
    criteria: list[dict[str, str]],
    run_label: str,
    input_path: Path,
    allow_sample: bool,
) -> dict[str, Any]:
    issues: list[dict[str, str]] = []
    sample = is_sample_run(run_label, input_path, rows)
    if sample and not allow_sample:
        issues.append(
            issue(
                "<all>",
                "",
                "sample_not_allowed",
                "Sample/development input is not allowed for this run.",
            )
        )

    missing_columns = [column for column in REQUIRED_COLUMNS if column not in fieldnames]
    for column in missing_columns:
        issues.append(
            issue("<all>", "", "missing_column", f"Required column is missing: {column}")
        )

    respondent_groups: dict[str, list[dict[str, str]]] = {}
    for row_index, row in enumerate(rows, start=1):
        respondent_id = str(row.get("respondent_id", "")).strip()
        comparison_id = str(row.get("comparison_id", "")).strip()
        if not respondent_id:
            respondent_id = f"<missing-row-{row_index}>"
            issues.append(
                issue(respondent_id, comparison_id, "missing_respondent_id", "respondent_id is required.")
            )
        respondent_groups.setdefault(respondent_id, []).append(row)

    valid_criteria = {criterion["criterion_name"] for criterion in criteria}
    expected_pairs = expected_pair_keys(criteria)
    invalid_respondents: set[str] = {
        item["respondent_id"] for item in issues if item["respondent_id"] != "<all>"
    }

    for respondent_id, respondent_rows in respondent_groups.items():
        respondent_issue_count = len(issues)
        if len(respondent_rows) != EXPECTED_COMPARISON_COUNT:
            issues.append(
                issue(
                    respondent_id,
                    "",
                    "invalid_comparison_count",
                    (
                        f"Expected {EXPECTED_COMPARISON_COUNT} comparisons, "
                        f"found {len(respondent_rows)}."
                    ),
                )
            )

        seen_pairs: set[tuple[str, str]] = set()
        for row in respondent_rows:
            comparison_id = str(row.get("comparison_id", "")).strip()
            criterion_a = str(row.get("criterion_a", "")).strip()
            criterion_b = str(row.get("criterion_b", "")).strip()
            preferred = str(row.get("preferred_criterion", "")).strip()
            intensity = _parse_intensity(str(row.get("intensity_saaty", "")).strip())
            value = _parse_float(str(row.get("ahp_value_a_over_b", "")).strip())

            if not comparison_id:
                issues.append(
                    issue(respondent_id, comparison_id, "missing_comparison_id", "comparison_id is required.")
                )
            if criterion_a not in valid_criteria:
                issues.append(
                    issue(respondent_id, comparison_id, "unknown_criterion", f"Unknown criterion_a: {criterion_a}")
                )
            if criterion_b not in valid_criteria:
                issues.append(
                    issue(respondent_id, comparison_id, "unknown_criterion", f"Unknown criterion_b: {criterion_b}")
                )
            if criterion_a and criterion_b and criterion_a == criterion_b:
                issues.append(
                    issue(respondent_id, comparison_id, "same_criterion", "criterion_a and criterion_b must differ.")
                )

            if criterion_a in valid_criteria and criterion_b in valid_criteria and criterion_a != criterion_b:
                pair_key = tuple(sorted((criterion_a, criterion_b)))
                if pair_key in seen_pairs:
                    issues.append(
                        issue(respondent_id, comparison_id, "duplicate_pair", f"Duplicate pair: {pair_key}")
                    )
                seen_pairs.add(pair_key)

            if preferred not in VALID_PREFERENCES:
                issues.append(
                    issue(
                        respondent_id,
                        comparison_id,
                        "invalid_preferred_criterion",
                        "preferred_criterion must be criterion_a, criterion_b, or equal.",
                    )
                )
            if intensity is None or intensity < 1 or intensity > 9:
                issues.append(
                    issue(
                        respondent_id,
                        comparison_id,
                        "invalid_intensity_saaty",
                        "intensity_saaty must be an integer from 1 to 9.",
                    )
                )
            if value is None or value <= 0:
                issues.append(
                    issue(
                        respondent_id,
                        comparison_id,
                        "invalid_ahp_value",
                        "ahp_value_a_over_b must be positive.",
                    )
                )

            if preferred in VALID_PREFERENCES and intensity is not None and value is not None and value > 0:
                if preferred == "equal":
                    expected_value = 1.0
                elif preferred == "criterion_a":
                    expected_value = float(intensity)
                else:
                    expected_value = 1.0 / float(intensity)
                if not math.isclose(value, expected_value, rel_tol=FLOAT_TOLERANCE, abs_tol=FLOAT_TOLERANCE):
                    issues.append(
                        issue(
                            respondent_id,
                            comparison_id,
                            "inconsistent_preference_value",
                            (
                                "preferred_criterion, intensity_saaty, and "
                                f"ahp_value_a_over_b are inconsistent; expected {expected_value}."
                            ),
                        )
                    )

        missing_pairs = sorted(set(expected_pairs) - seen_pairs)
        for pair_key in missing_pairs:
            criterion_a, criterion_b = expected_pairs[pair_key]
            issues.append(
                issue(
                    respondent_id,
                    "",
                    "missing_pair",
                    f"Missing comparison pair: {criterion_a} vs {criterion_b}",
                )
            )

        if len(issues) > respondent_issue_count:
            invalid_respondents.add(respondent_id)

    invalid_respondents.update(
        item["respondent_id"]
        for item in issues
        if item["respondent_id"] not in {"<all>"} and item["respondent_id"]
    )
    valid_respondents = [
        respondent_id
        for respondent_id in sorted(respondent_groups)
        if respondent_id not in invalid_respondents
    ]
    invalid_respondent_list = sorted(
        respondent_id for respondent_id in invalid_respondents if respondent_id in respondent_groups
    )

    report = {
        "run_label": run_label,
        "is_sample": sample,
        "not_final_expert_judgement": sample,
        "total_rows": len(rows),
        "total_respondents": len(respondent_groups),
        "valid_respondents": valid_respondents,
        "valid_respondent_count": len(valid_respondents),
        "invalid_respondents": invalid_respondent_list,
        "invalid_respondent_count": len(invalid_respondent_list),
        "issues": issues,
        "issue_count": len(issues),
        "can_calculate": len(issues) == 0,
        "generated_at": datetime.now(UTC).isoformat(),
    }
    return report


def write_validation_report(report: dict[str, Any], output_dir: Path) -> tuple[Path, Path]:
    output_dir.mkdir(parents=True, exist_ok=True)
    json_path = output_dir / "ahp_expert_judgement_validation_report.json"
    csv_path = output_dir / "ahp_expert_judgement_validation_report.csv"
    json_path.write_text(json.dumps(report, indent=2, ensure_ascii=False), encoding="utf-8")

    fields = [
        "run_label",
        "is_sample",
        "can_calculate",
        "total_rows",
        "total_respondents",
        "valid_respondent_count",
        "invalid_respondent_count",
        "respondent_id",
        "comparison_id",
        "issue_type",
        "message",
    ]
    issue_rows = report["issues"] or [
        {
            "respondent_id": "",
            "comparison_id": "",
            "issue_type": "none",
            "message": "No validation issues found.",
        }
    ]
    with csv_path.open("w", encoding="utf-8", newline="") as file:
        writer = csv.DictWriter(file, fieldnames=fields)
        writer.writeheader()
        for item in issue_rows:
            writer.writerow(
                {
                    "run_label": report["run_label"],
                    "is_sample": report["is_sample"],
                    "can_calculate": report["can_calculate"],
                    "total_rows": report["total_rows"],
                    "total_respondents": report["total_respondents"],
                    "valid_respondent_count": report["valid_respondent_count"],
                    "invalid_respondent_count": report["invalid_respondent_count"],
                    **item,
                }
            )
    return json_path, csv_path


def validate_ahp_expert_judgement(
    criteria_json: Path,
    input_path: Path,
    run_label: str,
    allow_sample: bool,
) -> dict[str, Any]:
    criteria = load_criteria(criteria_json)
    rows, fieldnames = load_csv_rows(input_path)
    return validate_ahp_rows(rows, fieldnames, criteria, run_label, input_path, allow_sample)


def main() -> None:
    args = parse_args()
    report = validate_ahp_expert_judgement(
        args.criteria_json.resolve(),
        args.input.resolve(),
        args.run_label,
        args.allow_sample,
    )
    json_path, csv_path = write_validation_report(report, args.output_dir.resolve())
    print(f"AHP validation report JSON: {json_path}")
    print(f"AHP validation report CSV: {csv_path}")
    print(f"Can calculate: {report['can_calculate']}")
    print(f"Valid respondents: {report['valid_respondent_count']}")
    print(f"Invalid respondents: {report['invalid_respondent_count']}")


if __name__ == "__main__":
    main()
