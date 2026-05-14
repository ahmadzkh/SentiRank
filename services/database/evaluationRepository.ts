import { prisma } from "@/lib/prisma/client";

const DEFAULT_EVALUATION_LIMIT = 20;
const MAX_EVALUATION_LIMIT = 100;

export interface ModelEvaluationSummaryRecord {
  readonly id: string;
  readonly runLabel: string;
  readonly modelName: string;
  readonly modelVersion: string | null;
  readonly modelType: string;
  readonly datasetSplit: string | null;
  readonly accuracy: number | null;
  readonly precision: number | null;
  readonly recall: number | null;
  readonly f1Score: number | null;
  readonly notes: string | null;
  readonly evaluatedAt: Date;
}

function normalizeLimit(limit: number): number {
  return Math.min(Math.max(limit, 1), MAX_EVALUATION_LIMIT);
}

export async function getModelEvaluationSummaries(
  runLabel = "default",
  limit = DEFAULT_EVALUATION_LIMIT,
): Promise<ModelEvaluationSummaryRecord[]> {
  return prisma.modelEvaluationSummary.findMany({
    where: {
      runLabel,
    },
    take: normalizeLimit(limit),
    orderBy: {
      evaluatedAt: "desc",
    },
    select: {
      id: true,
      runLabel: true,
      modelName: true,
      modelVersion: true,
      modelType: true,
      datasetSplit: true,
      accuracy: true,
      precision: true,
      recall: true,
      f1Score: true,
      notes: true,
      evaluatedAt: true,
    },
  });
}
