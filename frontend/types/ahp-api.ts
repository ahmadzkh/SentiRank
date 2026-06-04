export const AHP_DEMO_RUN_LABEL =
  "sample_development_only__not_final_expert_judgement" as const;

export type AhpDemoRunLabel = typeof AHP_DEMO_RUN_LABEL;

export interface BackendAhpCriterion {
  id: string;
  name: string;
  description?: string | null;
}

export interface BackendAhpPairwiseComparison {
  criterion_a: string;
  criterion_b: string;
  value_a_over_b: number;
  justification?: string | null;
}

export interface BackendAhpCalculateRequest {
  run_label?: string;
  criteria: BackendAhpCriterion[];
  comparisons: BackendAhpPairwiseComparison[];
  consistency_threshold?: number;
}

export interface BackendAhpCriterionWeight {
  criterion_id: string;
  criterion_name: string;
  weight: number;
  rank: number;
}

export interface BackendAhpCalculateResponse {
  method: "AHP";
  run_label: string;
  criteria_count: number;
  pairwise_matrix: number[][];
  weights: BackendAhpCriterionWeight[];
  lambda_max: number;
  consistency_index: number;
  consistency_ratio: number;
  consistency_threshold: number;
  is_consistent: boolean;
  warnings: string[];
}

export interface BackendFuzzyTriangularNumber {
  l: number;
  m: number;
  u: number;
}

export interface BackendFuzzyAhpPairwiseComparison {
  criterion_a: string;
  criterion_b: string;
  fuzzy_value_a_over_b: BackendFuzzyTriangularNumber;
  linguistic_scale?: string | null;
  justification?: string | null;
}

export interface BackendFuzzyAhpCalculateRequest {
  run_label?: string;
  criteria: BackendAhpCriterion[];
  comparisons: BackendFuzzyAhpPairwiseComparison[];
  consistency_threshold?: number;
  defuzzification_method?: "centroid";
}

export interface BackendFuzzyAhpCriterionWeight {
  criterion_id: string;
  criterion_name: string;
  fuzzy_weight: BackendFuzzyTriangularNumber;
  defuzzified_weight: number;
  normalized_weight: number;
  rank: number;
}

export interface BackendFuzzyAhpCalculateResponse {
  method: "Fuzzy AHP";
  run_label: string;
  criteria_count: number;
  fuzzy_pairwise_matrix: BackendFuzzyTriangularNumber[][];
  modal_crisp_matrix: number[][];
  weights: BackendFuzzyAhpCriterionWeight[];
  consistency_ratio_modal: number;
  consistency_threshold: number;
  is_consistent_modal: boolean;
  defuzzification_method: string;
  warnings: string[];
}

export interface BackendAhpComparisonRequest {
  run_label?: string;
  ahp_weights: BackendAhpCriterionWeight[];
  fuzzy_ahp_weights: BackendFuzzyAhpCriterionWeight[];
}

export interface BackendAhpComparisonItem {
  criterion_id: string;
  criterion_name: string;
  ahp_weight: number;
  fuzzy_ahp_weight: number;
  ahp_rank: number;
  fuzzy_ahp_rank: number;
  weight_delta: number;
  rank_delta: number;
}

export interface BackendAhpComparisonSummary {
  total_criteria: number;
  max_absolute_weight_delta: number;
  changed_rank_count: number;
  identical_top_rank: boolean;
}

export interface BackendAhpComparisonResponse {
  run_label: string;
  items: BackendAhpComparisonItem[];
  summary: BackendAhpComparisonSummary;
  warnings: string[];
}
