import pytest

from app.schemas.ahp import (
    Criterion,
    FuzzyAhpCalculateRequest,
    FuzzyAhpPairwiseComparison,
    FuzzyTriangularNumber,
)
from app.services.fuzzy_ahp_calculator import (
    build_fuzzy_ahp_matrix,
    calculate_fuzzy_ahp,
    reciprocal_tfn,
)


def sample_criteria() -> list[Criterion]:
    return [
        Criterion(id="C1", name="Features"),
        Criterion(id="C2", name="Reliability"),
        Criterion(id="C3", name="Ads"),
    ]


def sample_comparisons() -> list[FuzzyAhpPairwiseComparison]:
    return [
        FuzzyAhpPairwiseComparison(
            criterion_a="C1",
            criterion_b="C2",
            fuzzy_value_a_over_b=FuzzyTriangularNumber(l=2, m=3, u=4),
        ),
        FuzzyAhpPairwiseComparison(
            criterion_a="C1",
            criterion_b="C3",
            fuzzy_value_a_over_b=FuzzyTriangularNumber(l=4, m=5, u=6),
        ),
        FuzzyAhpPairwiseComparison(
            criterion_a="C2",
            criterion_b="C3",
            fuzzy_value_a_over_b=FuzzyTriangularNumber(l=2, m=3, u=4),
        ),
    ]


def test_fuzzy_ahp_should_return_normalized_weights_and_modal_cr() -> None:
    request = FuzzyAhpCalculateRequest(
        criteria=sample_criteria(),
        comparisons=sample_comparisons(),
    )

    response = calculate_fuzzy_ahp(request)

    assert response.method == "Fuzzy AHP"
    assert response.criteria_count == 3
    assert sum(weight.normalized_weight for weight in response.weights) == pytest.approx(1.0)
    assert response.weights[0].rank == 1
    assert response.consistency_ratio_modal >= 0
    assert response.defuzzification_method == "centroid"


def test_fuzzy_ahp_matrix_should_use_reciprocal_tfn() -> None:
    matrix = build_fuzzy_ahp_matrix(sample_criteria(), sample_comparisons())

    assert matrix[0][1].l == pytest.approx(2)
    assert matrix[0][1].m == pytest.approx(3)
    assert matrix[0][1].u == pytest.approx(4)
    assert matrix[1][0].l == pytest.approx(1 / 4)
    assert matrix[1][0].m == pytest.approx(1 / 3)
    assert matrix[1][0].u == pytest.approx(1 / 2)


def test_reciprocal_tfn_should_reverse_bounds() -> None:
    reciprocal = reciprocal_tfn(FuzzyTriangularNumber(l=2, m=3, u=4))

    assert reciprocal.l == pytest.approx(1 / 4)
    assert reciprocal.m == pytest.approx(1 / 3)
    assert reciprocal.u == pytest.approx(1 / 2)


def test_fuzzy_ahp_invalid_tfn_should_raise_value_error() -> None:
    comparisons = [
        FuzzyAhpPairwiseComparison.model_construct(
            criterion_a="C1",
            criterion_b="C2",
            fuzzy_value_a_over_b=FuzzyTriangularNumber.model_construct(l=4, m=3, u=2),
            linguistic_scale=None,
            justification=None,
        ),
        *sample_comparisons()[1:],
    ]

    with pytest.raises(ValueError, match="l <= m <= u"):
        build_fuzzy_ahp_matrix(sample_criteria(), comparisons)


def test_fuzzy_ahp_unsupported_defuzzification_should_raise_value_error() -> None:
    request = FuzzyAhpCalculateRequest(
        criteria=sample_criteria(),
        comparisons=sample_comparisons(),
        defuzzification_method="mean_of_maximum",
    )

    with pytest.raises(ValueError, match="centroid"):
        calculate_fuzzy_ahp(request)
