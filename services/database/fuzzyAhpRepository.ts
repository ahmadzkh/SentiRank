import { prisma } from "@/lib/prisma/client";

export interface FuzzyAhpWeightRecord {
  readonly id: string;
  readonly runLabel: string;
  readonly criterion: string;
  readonly weight: number;
  readonly lowerBound: number | null;
  readonly upperBound: number | null;
  readonly computedAt: Date;
}

export async function getFuzzyAhpWeights(
  runLabel = "default",
): Promise<FuzzyAhpWeightRecord[]> {
  return prisma.fuzzyAhpWeight.findMany({
    where: {
      runLabel,
    },
    orderBy: {
      criterion: "asc",
    },
    select: {
      id: true,
      runLabel: true,
      criterion: true,
      weight: true,
      lowerBound: true,
      upperBound: true,
      computedAt: true,
    },
  });
}
