import { prisma } from "@/lib/prisma/client";

export interface RankingRecord {
  readonly id: string;
  readonly runLabel: string;
  readonly priorityArea: string;
  readonly score: number;
  readonly rank: number;
  readonly generatedAt: Date;
}

export async function getAhpRanking(
  runLabel = "default",
): Promise<RankingRecord[]> {
  return prisma.ahpRankingResult.findMany({
    where: {
      runLabel,
    },
    orderBy: {
      rank: "asc",
    },
    select: {
      id: true,
      runLabel: true,
      priorityArea: true,
      score: true,
      rank: true,
      generatedAt: true,
    },
  });
}

export async function getFuzzyAhpRanking(
  runLabel = "default",
): Promise<RankingRecord[]> {
  return prisma.fuzzyAhpRankingResult.findMany({
    where: {
      runLabel,
    },
    orderBy: {
      rank: "asc",
    },
    select: {
      id: true,
      runLabel: true,
      priorityArea: true,
      score: true,
      rank: true,
      generatedAt: true,
    },
  });
}
