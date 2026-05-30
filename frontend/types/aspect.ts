import type { ReviewSentimentLabel } from "./sentiment";

export type AspectLabel =
  | "audio_quality"
  | "recommendation"
  | "ads"
  | "subscription"
  | "app_performance"
  | "playlist_library"
  | "lyrics"
  | "offline_download"
  | "account_login"
  | "pricing";

export interface AspectResult {
  id: string;
  reviewId: string;
  reviewText: string;
  label: AspectLabel;
  confidence: number;
  evidenceTerms: string[];
  sentimentLabel?: ReviewSentimentLabel;
  modelName: string;
  modelVersion: string;
  classifiedAt: string;
}

export interface AspectSummary {
  totalClassified: number;
  counts: Record<AspectLabel, number>;
  negativeCounts: Record<AspectLabel, number>;
  topAspect: AspectLabel;
  topNegativeAspect: AspectLabel;
  multiAspectReviewCount: number;
  modelName: string;
  modelVersion: string;
  generatedAt: string;
}
