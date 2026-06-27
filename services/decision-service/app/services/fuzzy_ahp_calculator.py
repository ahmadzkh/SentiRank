from __future__ import annotations

import math

from app.schemas.ahp import (
    Criterion,
    FuzzyAhpCalculateRequest,
    FuzzyAhpCalculateResponse,
    FuzzyAhpCriterionWeight,
    FuzzyAhpPairwiseComparison,
    FuzzyTriangularNumber,
)
from app.services.ahp_calculator import (
    calculate_ahp_weights,
    calculate_consistency_ratio,
    rank_weights,
    validate_criteria,
)


def _criterion_lookup(criteria: list[Criterion]) -> dict[str, int]:
    lookup: dict[str, int] = {}
    for index, criterion in enumerate(criteria):
        lookup[criterion.id] = index
        lookup[criterion.name] = index
    return lookup


def _resolve_criterion_token(token: str, lookup: dict[str, int]) -> int:
    if token not in lookup:
        raise ValueError(f"Unknown criterion in fuzzy comparison: {token}")
    return lookup[token]


def reciprocal_tfn(value: FuzzyTriangularNumber) -> FuzzyTriangularNumber:
    return FuzzyTriangularNumber(l=1.0 / value.u, m=1.0 / value.m, u=1.0 / value.l)


def _validate_tfn(value: FuzzyTriangularNumber) -> None:
    if value.l <= 0 or value.m <= 0 or value.u <= 0:
        raise ValueError("Triangular fuzzy number values must be positive.")
    if value.l > value.m or value.m > value.u:
        raise ValueError("Triangular fuzzy number must satisfy l <= m <= u.")


def build_fuzzy_ahp_matrix(
    criteria: list[Criterion],
    comparisons: list[FuzzyAhpPairwiseComparison],
) -> list[list[FuzzyTriangularNumber]]:
    validate_criteria(criteria)

    criteria_count = len(criteria)
    expected_comparison_count = criteria_count * (criteria_count - 1) // 2
    lookup = _criterion_lookup(criteria)
    matrix = [
        [
            FuzzyTriangularNumber(l=1.0, m=1.0, u=1.0)
            if row == column
            else FuzzyTriangularNumber(l=0.000001, m=0.000001, u=0.000001)
            for column in range(criteria_count)
        ]
        for row in range(criteria_count)
    ]
    seen_pairs: set[tuple[int, int]] = set()

    for comparison in comparisons:
        _validate_tfn(comparison.fuzzy_value_a_over_b)
        index_a = _resolve_criterion_token(comparison.criterion_a, lookup)
        index_b = _resolve_criterion_token(comparison.criterion_b, lookup)

        if index_a == index_b:
            raise ValueError("Fuzzy AHP comparison criteria must be different.")

        pair_key = tuple(sorted((index_a, index_b)))
        if pair_key in seen_pairs:
            raise ValueError(
                f"Duplicate fuzzy pairwise comparison for {criteria[pair_key[0]].name} "
                f"and {criteria[pair_key[1]].name}."
            )
        seen_pairs.add(pair_key)

        matrix[index_a][index_b] = comparison.fuzzy_value_a_over_b
        matrix[index_b][index_a] = reciprocal_tfn(comparison.fuzzy_value_a_over_b)

    if len(seen_pairs) != expected_comparison_count:
        missing_pairs = []
        for index_a in range(criteria_count):
            for index_b in range(index_a + 1, criteria_count):
                if (index_a, index_b) not in seen_pairs:
                    missing_pairs.append(
                        f"{criteria[index_a].name} vs {criteria[index_b].name}"
                    )
        raise ValueError(
            f"Expected {expected_comparison_count} fuzzy comparisons, found "
            f"{len(seen_pairs)}. Missing comparisons: {missing_pairs}"
        )

    return matrix


def _fuzzy_geometric_mean(
    matrix: list[list[FuzzyTriangularNumber]],
) -> list[FuzzyTriangularNumber]:
    matrix_size = len(matrix)
    means = []
    for row in matrix:
        product_l = math.prod(value.l for value in row)
        product_m = math.prod(value.m for value in row)
        product_u = math.prod(value.u for value in row)
        means.append(
            FuzzyTriangularNumber(
                l=product_l ** (1.0 / matrix_size),
                m=product_m ** (1.0 / matrix_size),
                u=product_u ** (1.0 / matrix_size),
            )
        )
    return means


def calculate_fuzzy_weights(
    matrix: list[list[FuzzyTriangularNumber]],
) -> tuple[list[FuzzyTriangularNumber], list[float], list[float]]:
    geometric_means = _fuzzy_geometric_mean(matrix)
    sum_l = sum(value.l for value in geometric_means)
    sum_m = sum(value.m for value in geometric_means)
    sum_u = sum(value.u for value in geometric_means)

    if min(sum_l, sum_m, sum_u) <= 0:
        raise ValueError("Fuzzy geometric mean totals must be positive.")

    fuzzy_weights = [
        FuzzyTriangularNumber(
            l=value.l / sum_u,
            m=value.m / sum_m,
            u=value.u / sum_l,
        )
        for value in geometric_means
    ]
    defuzzified_weights = [
        (value.l + value.m + value.u) / 3.0
        for value in fuzzy_weights
    ]
    total_defuzzified = sum(defuzzified_weights)
    if total_defuzzified <= 0:
        raise ValueError("Defuzzified fuzzy weight total must be positive.")

    normalized_weights = [
        value / total_defuzzified
        for value in defuzzified_weights
    ]

    return fuzzy_weights, defuzzified_weights, normalized_weights


def modal_crisp_matrix(
    matrix: list[list[FuzzyTriangularNumber]],
) -> list[list[float]]:
    return [[value.m for value in row] for row in matrix]


def calculate_fuzzy_ahp(
    request: FuzzyAhpCalculateRequest,
) -> FuzzyAhpCalculateResponse:
    if request.defuzzification_method != "centroid":
        raise ValueError("Only centroid defuzzification is supported in Phase 10B.")

    fuzzy_matrix = build_fuzzy_ahp_matrix(request.criteria, request.comparisons)
    fuzzy_weights, defuzzified_weights, normalized_weights = calculate_fuzzy_weights(
        fuzzy_matrix
    )
    ranks = rank_weights(normalized_weights)

    crisp_matrix = modal_crisp_matrix(fuzzy_matrix)
    crisp_weights = calculate_ahp_weights(crisp_matrix)
    _, _, consistency_ratio_modal = calculate_consistency_ratio(
        crisp_matrix,
        crisp_weights,
    )

    weights = [
        FuzzyAhpCriterionWeight(
            criterion_id=criterion.id,
            criterion_name=criterion.name,
            fuzzy_weight=fuzzy_weights[index],
            defuzzified_weight=defuzzified_weights[index],
            normalized_weight=normalized_weights[index],
            rank=ranks[index],
        )
        for index, criterion in enumerate(request.criteria)
    ]
    warnings = []
    if consistency_ratio_modal > request.consistency_threshold:
        warnings.append(
            "Modal consistency ratio exceeds threshold; expert judgement should be reviewed."
        )

    return FuzzyAhpCalculateResponse(
        run_label=request.run_label,
        criteria_count=len(request.criteria),
        fuzzy_pairwise_matrix=fuzzy_matrix,
        modal_crisp_matrix=crisp_matrix,
        weights=weights,
        consistency_ratio_modal=consistency_ratio_modal,
        consistency_threshold=request.consistency_threshold,
        is_consistent_modal=consistency_ratio_modal <= request.consistency_threshold,
        defuzzification_method=request.defuzzification_method,
        warnings=warnings,
    )
