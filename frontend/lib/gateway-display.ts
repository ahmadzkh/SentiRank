import { ASPECT_META } from "@/constants/aspect";
import { SENTIMENT_LABELS, SENTIMENT_META } from "@/constants/sentiment";
import type { AspectRankingDatum } from "@/components/charts/AspectRankingChart";
import type { SentimentDistributionDatum } from "@/components/charts/SentimentDistributionChart";
import type {
  GatewayAspectEvaluation,
  GatewayAspectSummary,
  GatewayDatasetSummary,
  GatewayEvaluationSummary,
  GatewayPreprocessingSummary,
  GatewayRandomReviewsResponse,
  GatewayReportSummary,
  GatewayReviewSample,
  GatewayScrapingSummary,
  GatewaySentimentEvaluation,
  GatewaySentimentSummary,
  Review,
} from "@/types";
import type { AspectLabel } from "@/types/aspect";
import type { ReviewSentimentLabel } from "@/types/sentiment";

export const EMPTY_TEXT = "Data belum tersedia";

export const EMPTY_DATASET_SUMMARY: GatewayDatasetSummary = {
  dataset_availability: {},
  total_review_count: 0,
  rating_distribution: {},
  sentiment_distribution: {},
  source_application: {},
  review_period: {
    reviewed_at_min: null,
    reviewed_at_max: null,
  },
  missing_value_summary: {},
  text_length_summary: {},
  evaluation_summary_available: false,
  warnings: [],
};

export const EMPTY_SCRAPING_SUMMARY: GatewayScrapingSummary = {
  app_id: null,
  source_name: null,
  app_title: null,
  country: null,
  lang: null,
  target_quota_per_rating: {},
  achieved_count_per_rating: {},
  total_achieved_rows: 0,
  rating_results: {},
  rating_3_limitation_note: null,
  generated_at: null,
  warnings: [],
};

export const EMPTY_PREPROCESSING_SUMMARY: GatewayPreprocessingSummary = {
  total_rows: 0,
  relabeling_changes: {},
  sentiment_distribution_before: {},
  sentiment_distribution_after: {},
  text_cleaning_summary: {},
  aspect_weak_label_summary: {},
  aspect_taxonomy_summary_available: false,
  general_fallback_limitation: {},
  warnings: [],
};

export const EMPTY_RANDOM_REVIEWS: GatewayRandomReviewsResponse = {
  reviews: [],
  count: 0,
  filters: {
    limit: 0,
    applied_limit: 0,
  },
  warnings: [],
};

export const EMPTY_SENTIMENT_SUMMARY: GatewaySentimentSummary = {
  selected_model: "run_3_weighted_loss_lr_1e-5",
  sentiment_labels: ["Negative", "Neutral", "Positive"],
  model_status: "unavailable",
  final_sentiment_distribution: {},
  raw_sentiment_distribution: {},
  output_source_availability: {},
  warnings: [],
};

export const EMPTY_SENTIMENT_EVALUATION: GatewaySentimentEvaluation = {
  selected_candidate: "run_3_weighted_loss_lr_1e-5",
  run_comparison: [],
  selected_metrics: {},
  limitations: [],
  output_source_availability: {},
  warnings: [],
};

export const EMPTY_ASPECT_SUMMARY: GatewayAspectSummary = {
  selected_classifier: "merged_5class",
  final_aspect_labels: [],
  model_status: "unavailable",
  original_7class_baseline: {},
  merged_5class_taxonomy: [],
  aspect_distribution: {},
  negative_aspect_distribution: {},
  weak_label_limitation: "",
  output_source_availability: {},
  warnings: [],
};

export const EMPTY_ASPECT_EVALUATION: GatewayAspectEvaluation = {
  selected_candidate: "merged_5class",
  scenario_comparison: [],
  selected_metrics: {},
  classification_report: {},
  limitations: [],
  output_source_availability: {},
  warnings: [],
};

export const EMPTY_EVALUATION_SUMMARY: GatewayEvaluationSummary = {
  selected_indobert_model: "run_3_weighted_loss_lr_1e-5",
  selected_svm_model: "merged_5class",
  indobert_run_comparison: [],
  svm_scenario_comparison: [],
  model_evaluation_records: [],
  final_aspect_criteria: [],
  ahp_fuzzy_ahp_sample_status: {},
  limitations: [],
  expert_judgement_note: "",
  output_source_availability: {},
  warnings: [],
};

export const EMPTY_REPORT_SUMMARY: GatewayReportSummary = {
  project_name: "SentiRank",
  application: "Spotify Google Play Reviews",
  pipeline_status: {},
  selected_models: {
    sentiment: "run_3_weighted_loss_lr_1e-5",
    aspect: "merged_5class",
  },
  final_criteria: [],
  demo_notes: [],
  limitations: [],
  expert_judgement_note: "",
  output_source_availability: {},
  warnings: [],
};

export function formatPercent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

export function formatWholePercent(value: number): string {
  return `${Math.round(value)}%`;
}

export function numberValue(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

export function stringValue(value: unknown, fallback = EMPTY_TEXT): string {
  return typeof value === "string" && value.trim() ? value : fallback;
}

export function recordNumber(
  record: Record<string, unknown>,
  key: string,
  fallback = 0,
): number {
  return numberValue(record[key], fallback);
}

export function distributionTotal(distribution: Record<string, number>): number {
  return Object.values(distribution).reduce((total, value) => total + value, 0);
}

export function sentimentDistributionData(
  distribution: Record<string, number>,
): SentimentDistributionDatum[] {
  const normalizedCounts = SENTIMENT_LABELS.reduce(
    (accumulator, label) => {
      accumulator[label] =
        distribution[label] ??
        distribution[label.toUpperCase()] ??
        distribution[label[0].toUpperCase() + label.slice(1)] ??
        0;
      return accumulator;
    },
    {} as Record<ReviewSentimentLabel, number>,
  );
  const total = distributionTotal(normalizedCounts);

  if (total === 0) {
    return [];
  }

  return SENTIMENT_LABELS.map((label) => ({
    label,
    name: SENTIMENT_META[label].label,
    count: normalizedCounts[label],
    percentage: Math.round((normalizedCounts[label] / total) * 100),
    color: SENTIMENT_META[label].chartColor,
  }));
}

export function ratingDistributionRows(
  distribution: Record<string, number>,
): Array<{ rating: string; count: number; share: number }> {
  const total = distributionTotal(distribution);

  return Object.entries(distribution)
    .map(([rating, count]) => ({
      rating,
      count,
      share: total > 0 ? Math.round((count / total) * 100) : 0,
    }))
    .sort((first, second) => Number(first.rating) - Number(second.rating));
}

export function aspectRankingData(
  distribution: Record<string, number>,
): AspectRankingDatum[] {
  return Object.entries(distribution)
    .map(([label, count]) => ({
      aspect: aspectKeyFromGatewayLabel(label),
      label,
      count,
    }))
    .filter((item) => item.count > 0)
    .sort((first, second) => second.count - first.count);
}

export function aspectKeyFromGatewayLabel(label: string): AspectLabel {
  const normalized = label.toLowerCase();

  if (normalized.includes("ads")) {
    return "ads";
  }
  if (normalized.includes("subscription") || normalized.includes("pricing")) {
    return "subscription";
  }
  if (normalized.includes("account") || normalized.includes("login")) {
    return "account_login";
  }
  if (normalized.includes("reliability") || normalized.includes("usability")) {
    return "app_performance";
  }
  return "playlist_library";
}

export function aspectDisplayLabel(value?: string | null): string {
  if (!value) {
    return "-";
  }

  const mapped = aspectKeyFromGatewayLabel(value);
  return value in ASPECT_META ? ASPECT_META[value as AspectLabel].label : value || ASPECT_META[mapped].label;
}

export function reviewSamplesToReviews(
  samples: readonly GatewayReviewSample[],
): Review[] {
  return samples.map((sample, index) => ({
    id: sample.external_id ?? `gateway-review-${index + 1}`,
    source: "spotify_play_store",
    userName:
      sample.user_name ??
      sample.user_id ??
      sample.external_id ??
      `Reviewer ${index + 1}`,
    rating: reviewRating(sample.rating),
    text: sample.content ?? EMPTY_TEXT,
    wordCount: sample.word_count ?? countWords(sample.content),
    language: "id",
    reviewDate: sample.reviewed_at ?? "1970-01-01",
    sentimentLabel: sentimentLabel(sample.final_sentiment ?? sample.initial_sentiment),
    aspectLabels: sample.aspect_label ? [aspectKeyFromGatewayLabel(sample.aspect_label)] : [],
    isProcessed: true,
  }));
}

function countWords(value?: string | null): number {
  return value?.split(/\s+/).filter((word) => word.trim()).length ?? 0;
}

function reviewRating(value?: number | null): 1 | 2 | 3 | 4 | 5 {
  if (value === 2 || value === 3 || value === 4 || value === 5) {
    return value;
  }
  return 1;
}

function sentimentLabel(value?: string | null): ReviewSentimentLabel | undefined {
  const normalized = value?.toLowerCase();
  if (
    normalized === "positive" ||
    normalized === "neutral" ||
    normalized === "negative"
  ) {
    return normalized;
  }
  return undefined;
}

export function selectedRecord(
  records: readonly Record<string, unknown>[],
  selectedName: string,
): Record<string, unknown> {
  return (
    records.find((record) => record.status === "selected") ??
    records.find((record) => record.candidate_name === selectedName) ??
    records.find((record) => record.scenario === selectedName) ??
    {}
  );
}
