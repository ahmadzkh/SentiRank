export interface GatewayCriterion {
  id: string;
  name: string;
  description?: string | null;
}

export interface GatewayAhpPairwiseComparison {
  criterion_a: string;
  criterion_b: string;
  value_a_over_b: number;
  justification?: string;
}

export interface GatewayAhpCalculateRequest {
  run_label: string;
  criteria: GatewayCriterion[];
  comparisons: GatewayAhpPairwiseComparison[];
  consistency_threshold?: number;
}

export interface GatewayAhpCriterionWeight {
  criterion_id: string;
  criterion_name: string;
  weight: number;
  rank: number;
}

export interface GatewayAhpCalculateResponse {
  method: "AHP";
  run_label: string;
  criteria_count: number;
  pairwise_matrix: number[][];
  weights: GatewayAhpCriterionWeight[];
  lambda_max: number;
  consistency_index: number;
  consistency_ratio: number;
  consistency_threshold: number;
  is_consistent: boolean;
  warnings: string[];
}

export interface GatewayFuzzyTriangularNumber {
  l: number;
  m: number;
  u: number;
}

export interface GatewayFuzzyAhpPairwiseComparison {
  criterion_a: string;
  criterion_b: string;
  fuzzy_value_a_over_b: GatewayFuzzyTriangularNumber;
  linguistic_scale?: string;
  justification?: string;
}

export interface GatewayFuzzyAhpCalculateRequest {
  run_label: string;
  criteria: GatewayCriterion[];
  comparisons: GatewayFuzzyAhpPairwiseComparison[];
  consistency_threshold?: number;
  defuzzification_method?: "centroid";
}

export interface GatewayFuzzyAhpCriterionWeight {
  criterion_id: string;
  criterion_name: string;
  fuzzy_weight: GatewayFuzzyTriangularNumber;
  defuzzified_weight: number;
  normalized_weight: number;
  rank: number;
}

export interface GatewayFuzzyAhpCalculateResponse {
  method: "Fuzzy AHP";
  run_label: string;
  criteria_count: number;
  fuzzy_pairwise_matrix: GatewayFuzzyTriangularNumber[][];
  modal_crisp_matrix: number[][];
  weights: GatewayFuzzyAhpCriterionWeight[];
  consistency_ratio_modal: number;
  consistency_threshold: number;
  is_consistent_modal: boolean;
  defuzzification_method: "centroid";
  warnings: string[];
}

export interface GatewayRankingComparisonRequest {
  run_label: string;
  ahp_weights: GatewayAhpCriterionWeight[];
  fuzzy_ahp_weights: GatewayFuzzyAhpCriterionWeight[];
}

export interface GatewayRankingComparisonItem {
  criterion_id: string;
  criterion_name: string;
  ahp_weight: number;
  fuzzy_ahp_weight: number;
  ahp_rank: number;
  fuzzy_ahp_rank: number;
  weight_delta: number;
  rank_delta: number;
}

export interface GatewayRankingComparisonResponse {
  run_label: string;
  items: GatewayRankingComparisonItem[];
  summary: {
    total_criteria: number;
    max_absolute_weight_delta: number;
    changed_rank_count: number;
    identical_top_rank: boolean;
  };
  warnings: string[];
}

export interface GatewayHealthStatus {
  service: string;
  status: string;
  version?: string;
}

export interface GatewayServicesHealthStatus {
  api_gateway: string;
  services: Record<
    string,
    {
      status: string;
      url: string;
      status_code?: number;
      error?: {
        code: string;
        message: string;
      };
    }
  >;
}

