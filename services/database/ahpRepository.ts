import { prisma } from "@/lib/prisma/client";

export interface AhpWeightRecord {
  readonly id: string;
  readonly runLabel: string;
  readonly criterion: string;
  readonly weight: number;
  readonly consistencyRatio: number | null;
  readonly computedAt: Date;
}

export async function getAhpWeights(
  runLabel = "default",
): Promise<AhpWeightRecord[]> {
  return prisma.ahpWeight.findMany({
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
      consistencyRatio: true,
      computedAt: true,
    },
  });
}
