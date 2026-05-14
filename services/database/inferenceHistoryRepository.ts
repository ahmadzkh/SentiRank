import { prisma } from "@/lib/prisma/client";

const DEFAULT_INFERENCE_HISTORY_LIMIT = 20;
const MAX_INFERENCE_HISTORY_LIMIT = 100;

export interface InferenceHistoryRecord {
  readonly id: string;
  readonly inputText: string;
  readonly cleanText: string | null;
  readonly taskType: string;
  readonly modelUsed: string;
  readonly modelVersion: string | null;
  readonly predictedLabel: string | null;
  readonly confidence: number | null;
  readonly probPositive: number | null;
  readonly probNeutral: number | null;
  readonly probNegative: number | null;
  readonly predictedAspect: string | null;
  readonly aspectConfidence: number | null;
  readonly executionTimeMs: number | null;
  readonly createdAt: Date;
}

function normalizeLimit(limit: number): number {
  return Math.min(Math.max(limit, 1), MAX_INFERENCE_HISTORY_LIMIT);
}

export async function getRecentInferenceHistory(
  limit = DEFAULT_INFERENCE_HISTORY_LIMIT,
): Promise<InferenceHistoryRecord[]> {
  return prisma.inferenceHistory.findMany({
    take: normalizeLimit(limit),
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      inputText: true,
      cleanText: true,
      taskType: true,
      modelUsed: true,
      modelVersion: true,
      predictedLabel: true,
      confidence: true,
      probPositive: true,
      probNeutral: true,
      probNegative: true,
      predictedAspect: true,
      aspectConfidence: true,
      executionTimeMs: true,
      createdAt: true,
    },
  });
}
