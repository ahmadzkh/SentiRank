from typing import Literal

from pydantic import BaseModel, Field, model_validator


class Criterion(BaseModel):
    id: str
    name: str
    description: str | None = None


class AhpPairwiseComparison(BaseModel):
    criterion_a: str
    criterion_b: str
    value_a_over_b: float = Field(gt=0)
    justification: str | None = None


class AhpCalculateRequest(BaseModel):
    run_label: str = "default"
    criteria: list[Criterion]
    comparisons: list[AhpPairwiseComparison]
    consistency_threshold: float = 0.10


class AhpCriterionWeight(BaseModel):
    criterion_id: str
    criterion_name: str
    weight: float
    rank: int


class AhpCalculateResponse(BaseModel):
    method: Literal["AHP"] = "AHP"
    run_label: str
    criteria_count: int
    pairwise_matrix: list[list[float]]
    weights: list[AhpCriterionWeight]
    lambda_max: float
    consistency_index: float
    consistency_ratio: float
    consistency_threshold: float
    is_consistent: bool
    warnings: list[str] = Field(default_factory=list)


class FuzzyTriangularNumber(BaseModel):
    l: float = Field(gt=0)
    m: float = Field(gt=0)
    u: float = Field(gt=0)

    @model_validator(mode="after")
    def validate_order(self) -> "FuzzyTriangularNumber":
        if self.l > self.m or self.m > self.u:
            raise ValueError("Triangular fuzzy number must satisfy l <= m <= u.")
        return self


class FuzzyAhpPairwiseComparison(BaseModel):
    criterion_a: str
    criterion_b: str
    fuzzy_value_a_over_b: FuzzyTriangularNumber
    linguistic_scale: str | None = None
    justification: str | None = None


class FuzzyAhpCalculateRequest(BaseModel):
    run_label: str = "default"
    criteria: list[Criterion]
    comparisons: list[FuzzyAhpPairwiseComparison]
    consistency_threshold: float = 0.10
    defuzzification_method: str = "centroid"


class FuzzyAhpCriterionWeight(BaseModel):
    criterion_id: str
    criterion_name: str
    fuzzy_weight: FuzzyTriangularNumber
    defuzzified_weight: float
    normalized_weight: float
    rank: int


class FuzzyAhpCalculateResponse(BaseModel):
    method: Literal["Fuzzy AHP"] = "Fuzzy AHP"
    run_label: str
    criteria_count: int
    fuzzy_pairwise_matrix: list[list[FuzzyTriangularNumber]]
    modal_crisp_matrix: list[list[float]]
    weights: list[FuzzyAhpCriterionWeight]
    consistency_ratio_modal: float
    consistency_threshold: float
    is_consistent_modal: bool
    defuzzification_method: str
    warnings: list[str] = Field(default_factory=list)


class RankingComparisonRequest(BaseModel):
    run_label: str = "default"
    ahp_weights: list[AhpCriterionWeight]
    fuzzy_ahp_weights: list[FuzzyAhpCriterionWeight]


class RankingComparisonItem(BaseModel):
    criterion_id: str
    criterion_name: str
    ahp_weight: float
    fuzzy_ahp_weight: float
    ahp_rank: int
    fuzzy_ahp_rank: int
    weight_delta: float
    rank_delta: int


class RankingComparisonResponse(BaseModel):
    run_label: str
    items: list[RankingComparisonItem]
    summary: dict[str, int | float | bool]
    warnings: list[str] = Field(default_factory=list)
