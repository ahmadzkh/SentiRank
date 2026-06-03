from __future__ import annotations

import csv
import math
import sys
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parents[2]
SCRIPTS_DIR = PROJECT_ROOT / "ml-service" / "scripts"
if str(SCRIPTS_DIR) not in sys.path:
    sys.path.insert(0, str(SCRIPTS_DIR))

from aggregate_fuzzy_ahp_expert_judgement import aggregate_fuzzy_rows, geometric_mean
from validate_fuzzy_ahp_expert_judgement import (
    load_criteria,
    load_csv_rows,
    validate_fuzzy_ahp_expert_judgement,
)


CRITERIA_JSON = PROJECT_ROOT / "docs" / "templates" / "ahp" / "final_criteria_for_ahp.json"
SAMPLE_FUZZY = (
    PROJECT_ROOT
    / "docs"
    / "templates"
    / "ahp"
    / "sample_development"
    / "fuzzy_ahp_pairwise_sample_development.csv"
)


def _read_rows(path: Path) -> tuple[list[dict[str, str]], list[str]]:
    with path.open("r", encoding="utf-8", newline="") as file:
        reader = csv.DictReader(file)
        return list(reader), list(reader.fieldnames or [])


def _write_rows(path: Path, rows: list[dict[str, str]], fields: list[str]) -> None:
    with path.open("w", encoding="utf-8", newline="") as file:
        writer = csv.DictWriter(file, fieldnames=fields)
        writer.writeheader()
        writer.writerows(rows)


def test_valid_sample_fuzzy_ahp_judgement_passes_validation() -> None:
    report = validate_fuzzy_ahp_expert_judgement(
        CRITERIA_JSON,
        SAMPLE_FUZZY,
        "sample_development_only",
        True,
    )

    assert report["can_calculate"] is True
    assert report["total_rows"] == 10
    assert report["total_respondents"] == 1
    assert report["valid_respondents"] == ["SAMPLE_DEV"]
    assert report["issues"] == []


def test_missing_fuzzy_comparison_fails_validation(tmp_path: Path) -> None:
    rows, fields = _read_rows(SAMPLE_FUZZY)
    invalid_path = tmp_path / "missing_fuzzy.csv"
    _write_rows(invalid_path, rows[:-1], fields)

    report = validate_fuzzy_ahp_expert_judgement(
        CRITERIA_JSON,
        invalid_path,
        "sample_development_only",
        True,
    )

    assert report["can_calculate"] is False
    assert any(issue["issue_type"] == "missing_pair" for issue in report["issues"])


def test_duplicate_fuzzy_comparison_fails_validation(tmp_path: Path) -> None:
    rows, fields = _read_rows(SAMPLE_FUZZY)
    rows[-1] = rows[0].copy()
    rows[-1]["comparison_id"] = "P10"
    invalid_path = tmp_path / "duplicate_fuzzy.csv"
    _write_rows(invalid_path, rows, fields)

    report = validate_fuzzy_ahp_expert_judgement(
        CRITERIA_JSON,
        invalid_path,
        "sample_development_only",
        True,
    )

    assert report["can_calculate"] is False
    assert any(issue["issue_type"] == "duplicate_pair" for issue in report["issues"])


def test_invalid_tfn_fails_validation(tmp_path: Path) -> None:
    rows, fields = _read_rows(SAMPLE_FUZZY)
    rows[0]["fuzzy_l"] = "2"
    invalid_path = tmp_path / "invalid_tfn.csv"
    _write_rows(invalid_path, rows, fields)

    report = validate_fuzzy_ahp_expert_judgement(
        CRITERIA_JSON,
        invalid_path,
        "sample_development_only",
        True,
    )

    assert report["can_calculate"] is False
    assert any(issue["issue_type"] == "invalid_tfn" for issue in report["issues"])


def test_fuzzy_geometric_aggregation_returns_expected_simple_value() -> None:
    assert math.isclose(geometric_mean([2.0, 8.0]), 4.0)


def test_fuzzy_pairwise_aggregation_uses_component_wise_geometric_mean() -> None:
    rows, _ = load_csv_rows(SAMPLE_FUZZY)
    criteria = load_criteria(CRITERIA_JSON)

    expert_one = [row.copy() for row in rows]
    expert_two = [row.copy() for row in rows]
    for row in expert_one:
        row["respondent_id"] = "E1"
    for row in expert_two:
        row["respondent_id"] = "E2"
        if row["comparison_id"] == "P02":
            row["fuzzy_l"] = "8"
            row["fuzzy_m"] = "12"
            row["fuzzy_u"] = "16"

    aggregated = aggregate_fuzzy_rows([*expert_one, *expert_two], criteria)
    p02 = next(row for row in aggregated if row["comparison_id"] == "P02")

    assert math.isclose(p02["fuzzy_l"], 4.0)
    assert math.isclose(p02["fuzzy_m"], 6.0)
    assert math.isclose(p02["fuzzy_u"], 8.0)
    assert p02["respondent_count"] == 2
