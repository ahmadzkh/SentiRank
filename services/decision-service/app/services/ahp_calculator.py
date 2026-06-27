from __future__ import annotations

import math

from app.schemas.ahp import (
    AhpCalculateRequest,
    AhpCalculateResponse,
    AhpCriterionWeight,
    AhpPairwiseComparison,
    Criterion,
)


RANDOM_INDEX_BY_SIZE = {
    1: 0.00,
    2: 0.00,
    3: 0.58,
    4: 0.90,
    5: 1.12,
    6: 1.24,
    7: 1.32,
    8: 1.41,
    9: 1.45,
    10: 1.49,
}


def validate_criteria(criteria: list[Criterion]) -> None:
    if len(criteria) < 2:
        raise ValueError("At least 2 criteria are required.")
    if len(criteria) > 10:
        raise ValueError("AHP consistency RI is only supported for up to 10 criteria.")

    criterion_ids = [criterion.id.strip() for criterion in criteria]
    criterion_names = [criterion.name.strip() for criterion in criteria]

    if any(not criterion_id for criterion_id in criterion_ids):
        raise ValueError("Criterion id must not be empty.")
    if any(not criterion_name for criterion_name in criterion_names):
        raise ValueError("Criterion name must not be empty.")
    if len(set(criterion_ids)) != len(criterion_ids):
        raise ValueError("Criterion ids must be unique.")
    if len(set(criterion_names)) != len(criterion_names):
        raise ValueError("Criterion names must be unique.")


def _criterion_lookup(criteria: list[Criterion]) -> dict[str, int]:
    lookup: dict[str, int] = {}
    for index, criterion in enumerate(criteria):
        lookup[criterion.id] = index
        lookup[criterion.name] = index
    return lookup


def _resolve_criterion_token(token: str, lookup: dict[str, int]) -> int:
    if token not in lookup:
        raise ValueError(f"Unknown criterion in comparison: {token}")
    return lookup[token]


def build_ahp_matrix(
    criteria: list[Criterion],
    comparisons: list[AhpPairwiseComparison],
) -> list[list[float]]:
    validate_criteria(criteria)

    criteria_count = len(criteria)
    expected_comparison_count = criteria_count * (criteria_count - 1) // 2
    lookup = _criterion_lookup(criteria)
    matrix = [[1.0 if row == column else 0.0 for column in range(criteria_count)] for row in range(criteria_count)]
    seen_pairs: set[tuple[int, int]] = set()

    for comparison in comparisons:
        if comparison.value_a_over_b <= 0:
            raise ValueError("AHP comparison values must be positive.")

        index_a = _resolve_criterion_token(comparison.criterion_a, lookup)
        index_b = _resolve_criterion_token(comparison.criterion_b, lookup)

        if index_a == index_b:
            raise ValueError("AHP comparison criteria must be different.")

        pair_key = tuple(sorted((index_a, index_b)))
        if pair_key in seen_pairs:
            raise ValueError(
                f"Duplicate pairwise comparison for {criteria[pair_key[0]].name} "
                f"and {criteria[pair_key[1]].name}."
            )
        seen_pairs.add(pair_key)

        matrix[index_a][index_b] = comparison.value_a_over_b
        matrix[index_b][index_a] = 1.0 / comparison.value_a_over_b

    if len(seen_pairs) != expected_comparison_count:
        missing_pairs = []
        for index_a in range(criteria_count):
            for index_b in range(index_a + 1, criteria_count):
                if (index_a, index_b) not in seen_pairs:
                    missing_pairs.append(
                        f"{criteria[index_a].name} vs {criteria[index_b].name}"
                    )
        raise ValueError(
            f"Expected {expected_comparison_count} comparisons, found "
            f"{len(seen_pairs)}. Missing comparisons: {missing_pairs}"
        )

    return matrix


def calculate_ahp_weights(matrix: list[list[float]]) -> list[float]:
    matrix_size = len(matrix)
    geometric_means = [
        math.prod(row) ** (1.0 / matrix_size)
        for row in matrix
    ]
    total = sum(geometric_means)
    if total <= 0:
        raise ValueError("AHP geometric mean total must be positive.")
    return [value / total for value in geometric_means]


def calculate_consistency_ratio(
    matrix: list[list[float]],
    weights: list[float],
) -> tuple[float, float, float]:
    matrix_size = len(matrix)
    if matrix_size <= 2:
        return float(matrix_size), 0.0, 0.0
    if matrix_size not in RANDOM_INDEX_BY_SIZE:
        raise ValueError("AHP consistency RI is only supported for up to 10 criteria.")

    weighted_sum = [
        sum(value * weight for value, weight in zip(row, weights))
        for row in matrix
    ]
    lambda_max = sum(
        weighted_sum_value / weight
        for weighted_sum_value, weight in zip(weighted_sum, weights)
    ) / matrix_size
    consistency_index = (lambda_max - matrix_size) / (matrix_size - 1)
    random_index = RANDOM_INDEX_BY_SIZE[matrix_size]
    consistency_ratio = 0.0 if random_index == 0 else consistency_index / random_index

    return lambda_max, consistency_index, consistency_ratio


def rank_weights(weights: list[float]) -> list[int]:
    sorted_indexes = sorted(range(len(weights)), key=lambda index: (-weights[index], index))
    ranks = [0] * len(weights)
    for rank, index in enumerate(sorted_indexes, start=1):
        ranks[index] = rank
    return ranks


def calculate_ahp(request: AhpCalculateRequest) -> AhpCalculateResponse:
    matrix = build_ahp_matrix(request.criteria, request.comparisons)
    raw_weights = calculate_ahp_weights(matrix)
    ranks = rank_weights(raw_weights)
    lambda_max, consistency_index, consistency_ratio = calculate_consistency_ratio(
        matrix,
        raw_weights,
    )

    weights = [
        AhpCriterionWeight(
            criterion_id=criterion.id,
            criterion_name=criterion.name,
            weight=raw_weights[index],
            rank=ranks[index],
        )
        for index, criterion in enumerate(request.criteria)
    ]
    warnings = []
    if consistency_ratio > request.consistency_threshold:
        warnings.append(
            "Consistency ratio exceeds threshold; expert judgement should be reviewed."
        )

    return AhpCalculateResponse(
        run_label=request.run_label,
        criteria_count=len(request.criteria),
        pairwise_matrix=matrix,
        weights=weights,
        lambda_max=lambda_max,
        consistency_index=consistency_index,
        consistency_ratio=consistency_ratio,
        consistency_threshold=request.consistency_threshold,
        is_consistent=consistency_ratio <= request.consistency_threshold,
        warnings=warnings,
    )
