import type { AhpCriterion } from "./ahp";

export type FuzzyAhpStatus = "prototype" | "ready" | "needs_review";

export interface FuzzyTriangularNumber {
  lower: number;
  middle: number;
  upper: number;
}

export interface FuzzyScaleOption {
  id: string;
  label: string;
  value: FuzzyTriangularNumber;
}

export interface FuzzyAhpRankedCriterion {
  criterionId: string;
  label: string;
  fuzzyWeight: FuzzyTriangularNumber;
  normalizedWeight: number;
  rank: number;
  interpretation: string;
}

export interface FuzzyAhpResult {
  id: string;
  criteria: AhpCriterion[];
  scaleOptions: FuzzyScaleOption[];
  ranking: FuzzyAhpRankedCriterion[];
  status: FuzzyAhpStatus;
  generatedAt: string;
  methodVersion: string;
  methodNote: string;
}
