"""
AHP/Fuzzy AHP Aggregation & Ranking from Valid Expert Judgement.

Computes geometric-mean aggregation of valid-respondent pairwise matrices,
calculates AHP weights/CR, Fuzzy AHP (TFN-based) weights, and ranking
comparison. Outputs to datasets/outputs/eda/{06_ahp,07_fuzzy_ahp,08_ranking_comparison}.

Input : datasets/processed/expert_judgement/expert_judgement_pairwise_matrices.json
        datasets/processed/expert_judgement/expert_judgement_validation_summary.json
Output: datasets/outputs/eda/06_ahp/
        datasets/outputs/eda/07_fuzzy_ahp/
        datasets/outputs/eda/08_ranking_comparison/final/   (bridge to report-service)

Usage:
    python services/decision-service/scripts/compute_expert_judgement_ranking.py

Requires running from project root.
"""

from __future__ import annotations

import csv
import json
import math
import sys
from datetime import UTC, datetime
from pathlib import Path
from typing import Any

# --- path setup: add decision-service so we can import its calculators directly ---
DECISION_ROOT = Path(__file__).resolve().parents[1]
PROJECT_ROOT = DECISION_ROOT.parent.parent
if str(DECISION_ROOT) not in sys.path:
    sys.path.insert(0, str(DECISION_ROOT))

from app.schemas.ahp import (
    AhpCriterionWeight,
    AhpPairwiseComparison,
    Criterion,
    FuzzyAhpCriterionWeight,
    FuzzyAhpPairwiseComparison,
    FuzzyTriangularNumber,
)
from app.services.ahp_calculator import (
    build_ahp_matrix,
    calculate_ahp_weights,
    calculate_consistency_ratio,
    rank_weights,
)
from app.services.fuzzy_ahp_calculator import (
    build_fuzzy_ahp_matrix,
    calculate_fuzzy_weights,
    reciprocal_tfn,
)

# =========================================================================
# Constants
# =========================================================================
EXPECTED_CRITERIA_COUNT = 5
EXPECTED_COMPARISON_COUNT = 10
CR_THRESHOLD = 0.10

TFN_SCALE: dict[float, tuple[float, float, float]] = {
    1.0: (1.0, 1.0, 1.0),
    2.0: (1.0, 2.0, 3.0),
    3.0: (2.0, 3.0, 4.0),
    4.0: (3.0, 4.0, 5.0),
    5.0: (4.0, 5.0, 6.0),
    6.0: (5.0, 6.0, 7.0),
    7.0: (6.0, 7.0, 8.0),
    8.0: (7.0, 8.0, 9.0),
    9.0: (8.0, 9.0, 9.0),
}

CRITERIA_NAMES = [
    "Features, Content & Audio Experience",
    "Ads Experience",
    "Subscription & Pricing",
    "Account/Login",
    "App Reliability & Usability",
]
CRITERIA = [
    Criterion(id=f"C{i+1}", name=name)
    for i, name in enumerate(CRITERIA_NAMES)
]

# =========================================================================
# I/O helpers
# =========================================================================
DATA_DIR = PROJECT_ROOT / "datasets" / "processed" / "expert_judgement"
_AHP_DIR = PROJECT_ROOT / "datasets" / "outputs" / "eda" / "06_ahp"
_FUZZY_DIR = PROJECT_ROOT / "datasets" / "outputs" / "eda" / "07_fuzzy_ahp"
_RANKING_DIR = PROJECT_ROOT / "datasets" / "outputs" / "eda" / "08_ranking_comparison" / "final"


def _ensure_dirs() -> None:
    for d in [_AHP_DIR / "aggregated", _AHP_DIR / "validation",
              _FUZZY_DIR / "aggregated", _RANKING_DIR]:
        d.mkdir(parents=True, exist_ok=True)


def _write_json(path: Path, payload: dict[str, Any]) -> None:
    path.write_text(
        json.dumps(payload, indent=2, ensure_ascii=False),
        encoding="utf-8",
    )


def _write_csv(path: Path, rows: list[dict[str, Any]]) -> None:
    if not rows:
        path.write_text("")
        return
    with path.open("w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
        w.writeheader()
        w.writerows(rows)


# =========================================================================
# Phase 1 — Load & validate inputs
# =========================================================================
def _check_inputs() -> None:
    """Verify all required MS-17A output files exist."""
    required = [
        DATA_DIR / "expert_judgement_pairwise_matrices.json",
        DATA_DIR / "expert_judgement_validation_summary.json",
        DATA_DIR / "expert_judgement_valid_responses.csv",
    ]
    for p in required:
        if not p.exists():
            raise FileNotFoundError(
                f"Required MS-17A output not found: {p}\n"
                "Run services/decision-service/scripts/prepare_expert_judgement_dataset.py first."
            )


def _count_invalid() -> int:
    """Re-read validation summary for invalid count."""
    val = json.loads(
        (DATA_DIR / "expert_judgement_validation_summary.json").read_text("utf-8")
    )
    return sum(1 for r in val.get("respondents", []) if not r.get("is_consistent", False))


def load_valid_respondent_data() -> dict[str, Any]:
    """Return {respondent_id: {pairwise_values: {...}, pairwise_matrix: [[...]]}} for valid respondents only."""
    matrices = json.loads(
        (DATA_DIR / "expert_judgement_pairwise_matrices.json").read_text("utf-8")
    )
    validation = json.loads(
        (DATA_DIR / "expert_judgement_validation_summary.json").read_text("utf-8")
    )

    # Build valid-respondent lookup
    valid_ids: set[str] = set()
    for r in validation.get("respondents", []):
        if r.get("is_consistent", False):
            valid_ids.add(r["respondent_id"])
        else:
            print(f"  ℹ️  Skipping invalid: {r['respondent_id']} — CR = {r.get('cr', 'N/A')}")

    # Build respondent dict from pairwise_matrices.json
    resp_map: dict[str, Any] = {}
    for r in matrices.get("respondents", []):
        rid = r["respondent_id"]
        if rid in valid_ids:
            resp_map[rid] = r

    print(f"\n  Valid respondents used: {sorted(valid_ids)}")
    print(f"  Total valid count: {len(resp_map)}")

    return resp_map


# =========================================================================
# Phase 2 — Aggregation via geometric mean
# =========================================================================
def geometric_mean_of_matrices(
    matrices: list[list[list[float]]],
) -> list[list[float]]:
    """Cell-wise geometric mean across a list of 5×5 matrices."""
    n = len(matrices[0])
    aggregated = [[0.0] * n for _ in range(n)]
    for i in range(n):
        for j in range(n):
            product = 1.0
            for m in matrices:
                product *= m[i][j]
            aggregated[i][j] = product ** (1.0 / len(matrices))
    return aggregated


def aggregate_pairwise(
    resp_map: dict[str, Any],
) -> tuple[list[list[float]], list[str]]:
    """Aggregate valid-respondent pairwise matrices via geometric mean."""
    matrices = [r["pairwise_matrix"] for r in resp_map.values()]
    used_ids = sorted(resp_map.keys())

    if not matrices:
        raise ValueError("No valid respondent matrices to aggregate.")

    # Validate matrix dimensions
    for idx, m in enumerate(matrices):
        if len(m) != EXPECTED_CRITERIA_COUNT:
            raise ValueError(
                f"Respondent {used_ids[idx]}: expected {EXPECTED_CRITERIA_COUNT}"
                f" criteria, got {len(m)}"
            )
        for row in m:
            if len(row) != EXPECTED_CRITERIA_COUNT:
                raise ValueError(f"Respondent {used_ids[idx]}: non-square matrix")

    agg = geometric_mean_of_matrices(matrices)
    return agg, used_ids


# =========================================================================
# Phase 3 — AHP Calculation
# =========================================================================
def calculate_ahp_from_aggregated(
    agg_matrix: list[list[float]],
    used_ids: list[str],
) -> dict[str, Any]:
    """Compute AHP weights, CR, ranking from aggregated pairwise matrix."""
    weights = calculate_ahp_weights(agg_matrix)
    lambda_max, ci, cr = calculate_consistency_ratio(agg_matrix, weights)
    ranks = rank_weights(weights)

    weight_rows = []
    for i, name in enumerate(CRITERIA_NAMES):
        weight_rows.append({
            "criterion_id": f"C{i+1}",
            "criterion_name": name,
            "weight": round(weights[i], 6),
            "rank": int(ranks[i]),
            "data_source": "aggregated_expert_judgement",
        })

    # Validation
    validation_checks = {
        "criteria_count": len(CRITERIA_NAMES),
        "valid_respondent_count": len(used_ids),
        "respondent_ids_used": used_ids,
        "aggregation_method": "geometric_mean",
        "consistency_ratio": round(cr, 6),
        "consistency_threshold": CR_THRESHOLD,
        "is_consistent": cr <= CR_THRESHOLD,
        "total_weight": round(sum(weights), 6),
        "all_diagonal_one": all(
            abs(agg_matrix[i][i] - 1.0) < 1e-9
            for i in range(len(agg_matrix))
        ),
        "source_type_summary": _source_summary(used_ids),
    }

    result = {
        "generated_at": datetime.now(UTC).isoformat(),
        "data_source": "aggregated_from_valid_expert_judgement",
        "aggregation": validation_checks,
        "pairwise_matrix": [
            [round(v, 6) for v in row] for row in agg_matrix
        ],
        "weights": weight_rows,
        "lambda_max": round(lambda_max, 6),
        "consistency_index": round(ci, 6),
        "consistency_ratio": round(cr, 6),
        "is_consistent": cr <= CR_THRESHOLD,
    }

    print(f"\n  AHP Consistency Ratio: {cr:.6f} {'✅' if cr <= CR_THRESHOLD else '❌'}")
    print(f"  AHP Lambda Max: {lambda_max:.6f}")
    for wr in weight_rows:
        print(f"    {wr['criterion_name']}: weight={wr['weight']}, rank={wr['rank']}")

    return result


# =========================================================================
# Phase 4 — Fuzzy AHP
# =========================================================================
def _saaty_to_tfn(value: float) -> FuzzyTriangularNumber:
    """Convert Saaty crisp value to TFN. Supports reciprocals."""
    if value == 0:
        raise ValueError("Cannot convert zero to TFN.")
    if value < 1.0:
        # Reciprocal: 1/3 → reciprocal of scale 3
        reciprocal_crisp = 1.0 / value
        # Find nearest scale value
        closest = min(TFN_SCALE.keys(), key=lambda k: abs(k - reciprocal_crisp))
        l, m, u = TFN_SCALE[closest]
        return reciprocal_tfn(FuzzyTriangularNumber(l=l, m=m, u=u))
    closest = min(TFN_SCALE.keys(), key=lambda k: abs(k - value))
    l, m, u = TFN_SCALE[closest]
    return FuzzyTriangularNumber(l=l, m=m, u=u)


def calculate_fuzzy_from_aggregated(
    agg_matrix: list[list[float]],
    used_ids: list[str],
) -> dict[str, Any]:
    """Convert aggregated crisp matrix to TFN, compute Fuzzy AHP weights & ranking."""
    n = len(agg_matrix)
    fuzzy_matrix = [
        [
            _saaty_to_tfn(agg_matrix[i][j])
            for j in range(n)
        ]
        for i in range(n)
    ]

    fuzzy_weights_tfn, defuzzified_weights, normalized_weights = \
        calculate_fuzzy_weights(fuzzy_matrix)
    ranks = rank_weights(normalized_weights)

    weight_rows = []
    for i, name in enumerate(CRITERIA_NAMES):
        fw = fuzzy_weights_tfn[i]
        weight_rows.append({
            "criterion_id": f"C{i+1}",
            "criterion_name": name,
            "fuzzy_weight_l": round(fw.l, 6),
            "fuzzy_weight_m": round(fw.m, 6),
            "fuzzy_weight_u": round(fw.u, 6),
            "defuzzified_weight": round(defuzzified_weights[i], 6),
            "normalized_weight": round(normalized_weights[i], 6),
            "rank": int(ranks[i]),
        })

    result = {
        "generated_at": datetime.now(UTC).isoformat(),
        "data_source": "aggregated_from_valid_expert_judgement",
        "method": "fuzzy_geometric_mean + centroid_defuzzification",
        "tfn_scale": {k: list(v) for k, v in TFN_SCALE.items()},
        "valid_respondent_count": len(used_ids),
        "respondent_ids_used": used_ids,
        "weights": weight_rows,
    }

    print(f"\n  Fuzzy AHP weights (normalized):")
    for wr in weight_rows:
        print(f"    {wr['criterion_name']}: norm={wr['normalized_weight']}, rank={wr['rank']}")

    return result


# =========================================================================
# Phase 5 — Comparison AHP vs Fuzzy AHP
# =========================================================================
def build_comparison(
    ahp_result: dict[str, Any],
    fuzzy_result: dict[str, Any],
    used_ids: list[str],
) -> dict[str, Any]:
    """Compare AHP and Fuzzy AHP rankings, compute rank differences."""
    ahp_rows = {r["criterion_name"]: r for r in ahp_result["weights"]}
    fuzzy_rows = {r["criterion_name"]: r for r in fuzzy_result["weights"]}

    criteria_names = sorted(set(ahp_rows.keys()) & set(fuzzy_rows.keys()),
                           key=lambda n: ahp_rows[n]["rank"])

    comparison_rows = []
    for name in criteria_names:
        a = ahp_rows[name]
        f = fuzzy_rows[name]
        rank_diff = a["rank"] - f["rank"]
        if rank_diff > 0:
            interp = "Fuzzy ranks higher"
        elif rank_diff < 0:
            interp = "AHP ranks higher"
        else:
            interp = "Same rank"

        comparison_rows.append({
            "criteria": name,
            "ahp_weight": a["weight"],
            "ahp_rank": a["rank"],
            "fuzzy_weight": f["normalized_weight"],
            "fuzzy_rank": f["rank"],
            "rank_difference": rank_diff,
            "interpretation": interp,
        })

    comparison_rows.sort(key=lambda r: r["ahp_rank"])

    comparison = {
        "generated_at": datetime.now(UTC).isoformat(),
        "data_source": "aggregated_from_valid_expert_judgement",
        "valid_respondent_count": len(used_ids),
        "respondent_ids_used": used_ids,
        "ahp_consistency_ratio": ahp_result["consistency_ratio"],
        "ahp_is_consistent": ahp_result["is_consistent"],
        "ranking_comparison": comparison_rows,
    }

    print(f"\n  AHP vs Fuzzy AHP Ranking:")
    for cr in comparison_rows:
        arrow = "=" if cr["rank_difference"] == 0 else (
            "↑" if cr["rank_difference"] < 0 else "↓"
        )
        print(f"    {cr['criteria']:40s} AHP={cr['ahp_rank']} {arrow} Fuzzy={cr['fuzzy_rank']} ({cr['interpretation']})")

    return comparison


# =========================================================================
# Utilities
# =========================================================================
def _source_summary(used_ids: list[str]) -> dict[str, int]:
    """Tally actual vs synthetic source types."""
    matrices = json.loads(
        (DATA_DIR / "expert_judgement_pairwise_matrices.json").read_text("utf-8")
    )
    resp_by_id = {r["respondent_id"]: r for r in matrices.get("respondents", [])}
    counts: dict[str, int] = {"actual": 0, "synthetic": 0, "unknown": 0}
    for rid in used_ids:
        st = resp_by_id.get(rid, {}).get("source_type", "unknown")
        if st in counts:
            counts[st] += 1
        else:
            counts[st] = 1
    return counts


# =========================================================================
# Main
# =========================================================================
def main() -> None:
    _ensure_dirs()
    _check_inputs()

    print("=" * 60)
    print("AHP/Fuzzy AHP Aggregation & Ranking from Expert Judgement")
    print("=" * 60)

    # Phase 1: Load valid respondent data
    print("\n[Phase 1] Loading valid respondent data...")
    resp_map = load_valid_respondent_data()
    if not resp_map:
        print("❌ No valid respondents found. Aborting.")
        sys.exit(1)

    # Phase 2: Aggregate pairwise matrices
    print("\n[Phase 2] Aggregating pairwise matrices (geometric mean)...")
    agg_matrix, used_ids = aggregate_pairwise(resp_map)

    # Write aggregated matrix
    agg_json = _AHP_DIR / "aggregated" / "ahp_aggregated_pairwise_judgement.json"
    agg_csv = _AHP_DIR / "aggregated" / "ahp_aggregated_pairwise_judgement.csv"
    _write_json(agg_json, {
        "generated_at": datetime.now(UTC).isoformat(),
        "aggregation_method": "geometric_mean",
        "valid_respondent_count": len(used_ids),
        "respondent_ids_used": used_ids,
        "source_type_summary": _source_summary(used_ids),
        "criteria": [{"id": c.id, "name": c.name} for c in CRITERIA],
        "aggregated_pairwise_matrix": [
            [round(v, 6) for v in row] for row in agg_matrix
        ],
    })
    _write_csv(agg_csv, [
        {"criterion_name": CRITERIA_NAMES[i],
         **{f"C{j+1}": round(agg_matrix[i][j], 6)
            for j in range(EXPECTED_CRITERIA_COUNT)}}
        for i in range(EXPECTED_CRITERIA_COUNT)
    ])
    print(f"  ✅ Aggregated matrix → {agg_json}")

    # Convert aggregated matrix to TFN for fuzzy output
    n = len(agg_matrix)
    fuzzy_agg_matrix = [
        [_saaty_to_tfn(agg_matrix[i][j]) for j in range(n)]
        for i in range(n)
    ]
    fuzzy_agg_json = _FUZZY_DIR / "aggregated" / "fuzzy_ahp_aggregated_pairwise_judgement.json"
    fuzzy_agg_csv = _FUZZY_DIR / "aggregated" / "fuzzy_ahp_aggregated_pairwise_judgement.csv"
    _write_json(fuzzy_agg_json, {
        "generated_at": datetime.now(UTC).isoformat(),
        "aggregation_method": "geometric_mean",
        "tfn_conversion": "saaty_scale_mapping",
        "tfn_scale": {k: list(v) for k, v in TFN_SCALE.items()},
        "valid_respondent_count": len(used_ids),
        "respondent_ids_used": used_ids,
        "source_type_summary": _source_summary(used_ids),
        "criteria": [{"id": c.id, "name": c.name} for c in CRITERIA],
        "aggregated_fuzzy_pairwise_matrix": [
            [
                {"l": round(fuzzy_agg_matrix[i][j].l, 6),
                 "m": round(fuzzy_agg_matrix[i][j].m, 6),
                 "u": round(fuzzy_agg_matrix[i][j].u, 6)}
                for j in range(n)
            ]
            for i in range(n)
        ],
    })
    _write_csv(fuzzy_agg_csv, [
        {"criterion_name": CRITERIA_NAMES[i],
         **{f"C{j+1}_l": round(fuzzy_agg_matrix[i][j].l, 6)
            for j in range(n)},
         **{f"C{j+1}_m": round(fuzzy_agg_matrix[i][j].m, 6)
            for j in range(n)},
         **{f"C{j+1}_u": round(fuzzy_agg_matrix[i][j].u, 6)
            for j in range(n)}}
        for i in range(n)
    ])
    print(f"  ✅ Fuzzy aggregated matrix → {fuzzy_agg_json}")

    # Phase 3: AHP calculation
    print("\n[Phase 3] Calculating AHP weights...")
    ahp_result = calculate_ahp_from_aggregated(agg_matrix, used_ids)

    _write_json(_AHP_DIR / "ahp_calculation_result.json", ahp_result)
    _write_csv(_AHP_DIR / "ahp_criteria_weights.csv",
               [{"criterion_id": w["criterion_id"],
                 "criterion_name": w["criterion_name"],
                 "weight": w["weight"],
                 "rank": w["rank"]}
                for w in ahp_result["weights"]])
    _write_csv(_AHP_DIR / "ahp_ranking.csv",
               [{"rank": w["rank"],
                 "criterion_name": w["criterion_name"],
                 "weight": w["weight"]}
                for w in sorted(ahp_result["weights"], key=lambda x: x["rank"])])
    print(f"  ✅ AHP results → {_AHP_DIR}")

    # Phase 4: Fuzzy AHP
    print("\n[Phase 4] Calculating Fuzzy AHP weights...")
    fuzzy_result = calculate_fuzzy_from_aggregated(agg_matrix, used_ids)

    _write_json(_FUZZY_DIR / "fuzzy_ahp_calculation_result.json", fuzzy_result)
    _write_csv(_FUZZY_DIR / "fuzzy_ahp_criteria_weights.csv",
               [{"criterion_id": w["criterion_id"],
                 "criterion_name": w["criterion_name"],
                 "normalized_weight": w["normalized_weight"],
                 "rank": w["rank"]}
                for w in fuzzy_result["weights"]])
    _write_csv(_FUZZY_DIR / "fuzzy_ahp_ranking.csv",
               [{"rank": w["rank"],
                 "criterion_name": w["criterion_name"],
                 "normalized_weight": w["normalized_weight"]}
                for w in sorted(fuzzy_result["weights"], key=lambda x: x["rank"])])
    print(f"  ✅ Fuzzy AHP results → {_FUZZY_DIR}")

    # Phase 5: Comparison
    print("\n[Phase 5] Comparing AHP vs Fuzzy AHP rankings...")
    comparison = build_comparison(ahp_result, fuzzy_result, used_ids)

    _write_json(_FUZZY_DIR / "ahp_fuzzy_ahp_ranking_comparison.json", comparison)
    _write_csv(_FUZZY_DIR / "ahp_fuzzy_ahp_ranking_comparison.csv",
               comparison["ranking_comparison"])
    print(f"  ✅ Comparison results → {_FUZZY_DIR}")

    # Phase 6: Bridge to report-service (08_ranking_comparison/final/)
    print("\n[Phase 6] Bridging to report-service output...")
    invalid_count = _count_invalid()
    total_respondents = len(used_ids) + invalid_count

    # CSV for report-service ranking-comparison endpoint
    bridge_csv = _RANKING_DIR / "08_ranking_comparison.csv"
    bridge_rows = []
    for row in comparison["ranking_comparison"]:
        weight_delta = round(row["ahp_weight"] - row["fuzzy_weight"], 6)
        bridge_rows.append({
            "criterion_name": row["criteria"],
            "ahp_weight": row["ahp_weight"],
            "ahp_rank": row["ahp_rank"],
            "fuzzy_ahp_weight": row["fuzzy_weight"],
            "fuzzy_ahp_rank": row["fuzzy_rank"],
            "weight_delta": weight_delta,
            "rank_delta": row["rank_difference"],
            "final_rank": row["ahp_rank"],
            "status": "synthetic_expert_judgement",
        })
    _write_csv(bridge_csv, bridge_rows)
    print(f"  ✅ Ranking comparison CSV → {bridge_csv}")

    # Summary JSON for report-service
    src = _source_summary(used_ids)
    summary_json = _RANKING_DIR / "ranking_comparison_summary.json"
    _write_json(summary_json, {
        "generated_at": datetime.now(UTC).isoformat(),
        "data_source": "aggregated_from_valid_expert_judgement",
        "aggregation_method": "geometric_mean",
        "total_respondents": total_respondents,
        "valid_respondent_count": len(used_ids),
        "invalid_respondent_count": invalid_count,
        "respondent_ids_used": used_ids,
        "source_type_summary": src,
        "ahp_method": "geometric_mean + eigenvalue",
        "fuzzy_ahp_method": "TFN geometric_mean + centroid_defuzzification",
        "ahp_consistency_ratio": ahp_result["consistency_ratio"],
        "ahp_is_consistent": ahp_result["is_consistent"],
        "ahp_lambda_max": ahp_result["lambda_max"],
        "consistency_index": ahp_result["consistency_index"],
        "note": "Results from synthetic expert judgement (simulated data).",
    })
    print(f"  ✅ Summary JSON → {summary_json}")

    # Summary
    print("\n" + "=" * 60)
    print("✅ Complete — AHP/Fuzzy AHP ranking from expert judgement")
    print("=" * 60)
    print(f"  Valid respondents : {len(used_ids)} (actual={src.get('actual',0)}, synthetic={src.get('synthetic',0)})")
    print(f"  Aggregation method: geometric_mean")
    print(f"  AHP CR            : {ahp_result['consistency_ratio']:.6f}")
    print(f"  AHP consistent    : {'✅' if ahp_result['is_consistent'] else '❌'}")
    print(f"\n  Output files:")
    print(f"    06_ahp/          : {_AHP_DIR}")
    print(f"    07_fuzzy_ahp/    : {_FUZZY_DIR}")
    print(f"    08_ranking_comparison/ : {_RANKING_DIR}")
    print(f"  Top AHP rank      : {ahp_result['weights'][0]['criterion_name']} ({ahp_result['weights'][0]['weight']:.4f})")
    print(f"  Top Fuzzy AHP rank: {fuzzy_result['weights'][0]['criterion_name']} ({fuzzy_result['weights'][0]['normalized_weight']:.4f})")


if __name__ == "__main__":
    main()
