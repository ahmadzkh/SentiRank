import type { AspectLabel } from "./aspect";
import type { ReviewSentimentLabel } from "./sentiment";

export interface ReportSummary {
  id: string;
  title: string;
  generatedAt: string;
  dataset: {
    totalReviews: number;
    source: string;
    dateRange: {
      start: string;
      end: string;
    };
  };
  sentiment: {
    dominantLabel: ReviewSentimentLabel;
    negativeRate: number;
    positiveRate: number;
    neutralRate: number;
  };
  aspect: {
    topNegativeAspect: AspectLabel;
    topNegativeAspectCount: number;
  };
  prioritization: {
    recommendedAspect: AspectLabel;
    ahpWeight: number;
    fuzzyAhpWeight: number;
    interpretation: string;
  };
  evaluation: {
    sentimentMacroF1: number;
    aspectMacroF1: number;
  };
  highlights: string[];
  recommendations: string[];
}
