export type ReviewSentimentLabel = "positive" | "neutral" | "negative";

export interface SentimentResult {
  id: string;
  reviewId: string;
  reviewText: string;
  label: ReviewSentimentLabel;
  confidence: number;
  probabilities: Record<ReviewSentimentLabel, number>;
  modelName: string;
  modelVersion: string;
  analyzedAt: string;
}

export interface SentimentSummary {
  totalReviews: number;
  counts: Record<ReviewSentimentLabel, number>;
  percentages: Record<ReviewSentimentLabel, number>;
  dominantLabel: ReviewSentimentLabel;
  averageConfidence: number;
  modelName: string;
  modelVersion: string;
  generatedAt: string;
}
