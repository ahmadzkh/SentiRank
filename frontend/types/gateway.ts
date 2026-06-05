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
  ahp_weight?: number | null;
  fuzzy_ahp_weight?: number | null;
  ahp_rank?: number | null;
  fuzzy_ahp_rank?: number | null;
  weight_delta?: number | null;
  rank_delta?: number | null;
  final_rank?: number | null;
  status?: string | null;
}

export interface GatewayRankingComparisonResponse {
  run_label: string;
  source_file?: string | null;
  is_sample?: boolean | null;
  items: GatewayRankingComparisonItem[];
  summary: {
    total_criteria: number;
    max_absolute_weight_delta?: number | null;
    changed_rank_count: number;
    identical_top_rank?: boolean | null;
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

export interface GatewayReviewSample {
  external_id?: string | null;
  rating?: number | null;
  content?: string | null;
  initial_sentiment?: string | null;
  final_sentiment?: string | null;
  aspect_label?: string | null;
  reviewed_at?: string | null;
  source?: string | null;
}

export interface GatewayRandomReviewFilters {
  limit: number;
  applied_limit: number;
  sentiment?: string | null;
  rating?: number | null;
  seed?: number | null;
}

export interface GatewayRandomReviewsResponse {
  reviews: GatewayReviewSample[];
  count: number;
  filters: GatewayRandomReviewFilters;
  warnings: string[];
}

export interface GatewayDatasetSummary {
  dataset_availability: Record<string, boolean>;
  total_review_count?: number | null;
  rating_distribution: Record<string, number>;
  sentiment_distribution: Record<string, number>;
  source_application: Record<string, unknown>;
  review_period: Record<string, string | null>;
  missing_value_summary: unknown;
  text_length_summary: unknown;
  evaluation_summary_available: boolean;
  warnings: string[];
}

export interface GatewayScrapingSummary {
  app_id?: string | null;
  source_name?: string | null;
  app_title?: string | null;
  country?: string | null;
  lang?: string | null;
  target_quota_per_rating: Record<string, number>;
  achieved_count_per_rating: Record<string, number>;
  total_achieved_rows?: number | null;
  rating_results: Record<string, unknown>;
  rating_3_limitation_note?: string | null;
  generated_at?: string | null;
  warnings: string[];
}

export interface GatewayPreprocessingSummary {
  total_rows?: number | null;
  relabeling_changes: Record<string, number | null>;
  sentiment_distribution_before: Record<string, number>;
  sentiment_distribution_after: Record<string, number>;
  text_cleaning_summary: unknown;
  aspect_weak_label_summary: unknown;
  aspect_taxonomy_summary_available: boolean;
  general_fallback_limitation: Record<string, unknown>;
  warnings: string[];
}

export interface GatewaySentimentSummary {
  selected_model: string;
  sentiment_labels: string[];
  model_status: string;
  final_sentiment_distribution: Record<string, number>;
  raw_sentiment_distribution: Record<string, number>;
  output_source_availability: Record<string, boolean>;
  warnings: string[];
}

export interface GatewaySentimentEvaluation {
  selected_candidate: string;
  run_comparison: Record<string, unknown>[];
  selected_metrics: Record<string, unknown>;
  limitations: string[];
  output_source_availability: Record<string, boolean>;
  warnings: string[];
}

export interface GatewayAspectSummary {
  selected_classifier: string;
  final_aspect_labels: string[];
  model_status: string;
  original_7class_baseline: Record<string, unknown>;
  merged_5class_taxonomy: Record<string, unknown>[];
  aspect_distribution: Record<string, number>;
  negative_aspect_distribution: Record<string, number>;
  weak_label_limitation: string;
  output_source_availability: Record<string, boolean>;
  warnings: string[];
}

export interface GatewayAspectEvaluation {
  selected_candidate: string;
  scenario_comparison: Record<string, unknown>[];
  selected_metrics: Record<string, unknown>;
  classification_report: Record<string, unknown>;
  limitations: string[];
  output_source_availability: Record<string, boolean>;
  warnings: string[];
}

export interface GatewayEvaluationSummary {
  selected_indobert_model: string;
  selected_svm_model: string;
  indobert_run_comparison: Record<string, unknown>[];
  svm_scenario_comparison: Record<string, unknown>[];
  model_evaluation_records: Record<string, unknown>[];
  final_aspect_criteria: Record<string, unknown>[];
  ahp_fuzzy_ahp_sample_status: Record<string, unknown>;
  limitations: string[];
  expert_judgement_note: string;
  output_source_availability: Record<string, boolean>;
  warnings: string[];
}

export interface GatewayReportSummary {
  project_name: string;
  application: string;
  pipeline_status: Record<string, string>;
  selected_models: Record<string, string>;
  final_criteria: Record<string, unknown>[];
  demo_notes: string[];
  limitations: string[];
  expert_judgement_note: string;
  output_source_availability: Record<string, boolean>;
  warnings: string[];
}
