import pytest

from app.schemas.ahp import AhpCalculateRequest, AhpPairwiseComparison, Criterion
from app.services.ahp_calculator import (
    build_ahp_matrix,
    calculate_ahp,
    rank_weights,
)


def sample_criteria() -> list[Criterion]:
    return [
        Criterion(id="C1", name="Features"),
        Criterion(id="C2", name="Reliability"),
        Criterion(id="C3", name="Ads"),
    ]


def sample_comparisons() -> list[AhpPairwiseComparison]:
    return [
        AhpPairwiseComparison(criterion_a="C1", criterion_b="C2", value_a_over_b=3),
        AhpPairwiseComparison(criterion_a="C1", criterion_b="C3", value_a_over_b=5),
        AhpPairwiseComparison(criterion_a="C2", criterion_b="C3", value_a_over_b=2),
    ]


def test_ahp_calculation_should_return_normalized_weights_and_consistency() -> None:
    request = AhpCalculateRequest(
        criteria=sample_criteria(),
        comparisons=sample_comparisons(),
    )

    response = calculate_ahp(request)

    assert response.method == "AHP"
    assert response.criteria_count == 3
    assert sum(weight.weight for weight in response.weights) == pytest.approx(1.0)
    assert response.weights[0].rank == 1
    assert response.lambda_max >= 3
    assert response.consistency_ratio >= 0


def test_ahp_matrix_should_be_reciprocal() -> None:
    matrix = build_ahp_matrix(sample_criteria(), sample_comparisons())

    assert matrix[0][1] == pytest.approx(3)
    assert matrix[1][0] == pytest.approx(1 / 3)
    assert matrix[0][2] == pytest.approx(5)
    assert matrix[2][0] == pytest.approx(1 / 5)


def test_ahp_missing_comparison_should_raise_value_error() -> None:
    with pytest.raises(ValueError, match="Missing comparisons"):
        build_ahp_matrix(sample_criteria(), sample_comparisons()[:2])


def test_ahp_duplicate_comparison_should_raise_value_error() -> None:
    comparisons = [
        *sample_comparisons(),
        AhpPairwiseComparison(criterion_a="C2", criterion_b="C1", value_a_over_b=1 / 3),
    ]

    with pytest.raises(ValueError, match="Duplicate pairwise comparison"):
        build_ahp_matrix(sample_criteria(), comparisons)


def test_ahp_zero_or_negative_comparison_should_raise_value_error() -> None:
    comparisons = [
        AhpPairwiseComparison.model_construct(
            criterion_a="C1",
            criterion_b="C2",
            value_a_over_b=0,
            justification=None,
        ),
        AhpPairwiseComparison(criterion_a="C1", criterion_b="C3", value_a_over_b=5),
        AhpPairwiseComparison(criterion_a="C2", criterion_b="C3", value_a_over_b=2),
    ]

    with pytest.raises(ValueError, match="must be positive"):
        build_ahp_matrix(sample_criteria(), comparisons)


def test_ahp_rank_ordering_should_be_deterministic_for_ties() -> None:
    assert rank_weights([0.5, 0.5, 0.25]) == [1, 2, 3]
