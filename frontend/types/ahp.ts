import type { AspectLabel } from "./aspect";

export type AhpCriterionSource =
  | "aspect_classification"
  | "manual_research_input"
  | "expert_judgement";

export type AhpConsistencyStatus = "consistent" | "needs_review" | "not_available";

export interface AhpCriterion {
  id: string;
  label: string;
  description: string;
  source: AhpCriterionSource;
  sourceAspect?: AspectLabel;
  evidenceCount: number;
  negativeReviewCount: number;
  isActive: boolean;
}

export interface PairwiseComparison {
  id: string;
  criterionAId: string;
  criterionBId: string;
  value: number;
  reciprocalValue: number;
  scaleLabel: string;
  note?: string;
}

export interface AhpRankedCriterion {
  criterionId: string;
  label: string;
  weight: number;
  rank: number;
  interpretation: string;
  evidenceCount: number;
}

export interface AhpResult {
  id: string;
  criteria: AhpCriterion[];
  pairwiseComparisons: PairwiseComparison[];
  ranking: AhpRankedCriterion[];
  consistencyRatio: number | null;
  consistencyStatus: AhpConsistencyStatus;
  generatedAt: string;
  methodVersion: string;
  methodNote: string;
}
