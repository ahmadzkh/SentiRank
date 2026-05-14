import { prisma } from "@/lib/prisma/client";

export interface RankingComparisonRecord {
  readonly id: string;
  readonly runLabel: string;
  readonly priorityArea: string;
  readonly ahpScore: number | null;
  readonly fuzzyAhpScore: number | null;
  readonly ahpRank: number | null;
  readonly fuzzyAhpRank: number | null;
  readonly rankDelta: number | null;
  readonly generatedAt: Date;
}

export async function getRankingComparison(
  runLabel = "default",
): Promise<RankingComparisonRecord[]> {
  return prisma.rankingComparisonResult.findMany({
    where: {
      runLabel,
    },
    orderBy: [
      {
        ahpRank: "asc",
      },
      {
        fuzzyAhpRank: "asc",
      },
      {
        priorityArea: "asc",
      },
    ],
    select: {
      id: true,
      runLabel: true,
      priorityArea: true,
      ahpScore: true,
      fuzzyAhpScore: true,
      ahpRank: true,
      fuzzyAhpRank: true,
      rankDelta: true,
      generatedAt: true,
    },
  });
}
