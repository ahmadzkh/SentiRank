from pydantic import BaseModel, Field


class EvaluationSummaryData(BaseModel):
    model_data_status: dict[str, str]
    selected_indobert_model: str
    selected_svm_model: str
    indobert_run_comparison: list[dict] = Field(default_factory=list)
    svm_scenario_comparison: list[dict] = Field(default_factory=list)
    model_evaluation_records: list[dict] = Field(default_factory=list)
    final_aspect_criteria: list[dict] = Field(default_factory=list)
    ahp_fuzzy_ahp_sample_status: dict
    limitations: list[str] = Field(default_factory=list)
    expert_judgement_note: str
    warnings: list[str] = Field(default_factory=list)


class ReportSummaryData(BaseModel):
    project_name: str
    application: str
    pipeline_status: dict[str, str]
    selected_models: dict[str, str]
    model_data_status: dict[str, str]
    final_criteria: list[dict] = Field(default_factory=list)
    demo_notes: list[str] = Field(default_factory=list)
    limitations: list[str] = Field(default_factory=list)
    expert_judgement_note: str
    warnings: list[str] = Field(default_factory=list)


class RankingComparisonItem(BaseModel):
    criterion_id: str
    criterion_name: str
    ahp_weight: float | None = None
    fuzzy_ahp_weight: float | None = None
    ahp_rank: int | None = None
    fuzzy_ahp_rank: int | None = None
    weight_delta: float | None = None
    rank_delta: int | None = None
    final_rank: int | None = None
    status: str | None = None


class RespondentSummary(BaseModel):
    total_respondents: int = 0
    valid_respondent_count: int = 0
    invalid_respondent_count: int = 0
    respondent_ids_used: list[str] = Field(default_factory=list)
    source_type_summary: dict[str, int] = Field(default_factory=dict)
    ahp_consistency_ratio: float | None = None
    note: str = ""


class RankingComparisonData(BaseModel):
    run_label: str
    is_sample: bool = False
    items: list[RankingComparisonItem] = Field(default_factory=list)
    summary: dict = Field(default_factory=dict)
    respondent_summary: RespondentSummary = Field(default_factory=RespondentSummary)
    warnings: list[str] = Field(default_factory=list)
