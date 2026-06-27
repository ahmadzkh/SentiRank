from __future__ import annotations

from app.schemas.ahp import (
    AhpCriterionWeight,
    FuzzyAhpCriterionWeight,
    RankingComparisonItem,
    RankingComparisonRequest,
    RankingComparisonResponse,
)


def _weights_by_id(
    weights: list[AhpCriterionWeight] | list[FuzzyAhpCriterionWeight],
) -> dict[str, AhpCriterionWeight | FuzzyAhpCriterionWeight]:
    result = {}
    for weight in weights:
        if weight.criterion_id in result:
            raise ValueError(f"Duplicate criterion weight: {weight.criterion_id}")
        result[weight.criterion_id] = weight
    return result


def compare_ahp_and_fuzzy_ahp(
    request: RankingComparisonRequest,
) -> RankingComparisonResponse:
    ahp_by_id = _weights_by_id(request.ahp_weights)
    fuzzy_by_id = _weights_by_id(request.fuzzy_ahp_weights)

    missing_from_fuzzy = sorted(set(ahp_by_id) - set(fuzzy_by_id))
    missing_from_ahp = sorted(set(fuzzy_by_id) - set(ahp_by_id))
    if missing_from_fuzzy or missing_from_ahp:
        raise ValueError(
            "AHP and Fuzzy AHP weights must contain the same criteria. "
            f"Missing from fuzzy: {missing_from_fuzzy}. "
            f"Missing from AHP: {missing_from_ahp}."
        )

    items = []
    for ahp_weight in sorted(request.ahp_weights, key=lambda item: item.rank):
        fuzzy_weight = fuzzy_by_id[ahp_weight.criterion_id]
        fuzzy_normalized_weight = getattr(fuzzy_weight, "normalized_weight")
        item = RankingComparisonItem(
            criterion_id=ahp_weight.criterion_id,
            criterion_name=ahp_weight.criterion_name,
            ahp_weight=ahp_weight.weight,
            fuzzy_ahp_weight=fuzzy_normalized_weight,
            ahp_rank=ahp_weight.rank,
            fuzzy_ahp_rank=fuzzy_weight.rank,
            weight_delta=fuzzy_normalized_weight - ahp_weight.weight,
            rank_delta=fuzzy_weight.rank - ahp_weight.rank,
        )
        items.append(item)

    max_absolute_weight_delta = max(
        (abs(item.weight_delta) for item in items),
        default=0.0,
    )
    changed_rank_count = sum(1 for item in items if item.rank_delta != 0)
    ahp_top = min(request.ahp_weights, key=lambda item: item.rank).criterion_id
    fuzzy_top = min(request.fuzzy_ahp_weights, key=lambda item: item.rank).criterion_id

    summary = {
        "total_criteria": len(items),
        "max_absolute_weight_delta": max_absolute_weight_delta,
        "changed_rank_count": changed_rank_count,
        "identical_top_rank": ahp_top == fuzzy_top,
    }

    return RankingComparisonResponse(
        run_label=request.run_label,
        items=items,
        summary=summary,
        warnings=[],
    )
