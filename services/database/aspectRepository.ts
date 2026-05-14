import { prisma } from "@/lib/prisma/client";

export interface AspectDistributionItem {
  readonly aspect: string;
  readonly count: number;
}

export async function getAspectDistribution(
  runLabel = "default",
): Promise<AspectDistributionItem[]> {
  const rows = await prisma.aspectClassificationResult.groupBy({
    by: ["aspect"],
    where: {
      runLabel,
    },
    _count: {
      aspect: true,
    },
  });

  return rows
    .map((row) => ({
      aspect: row.aspect,
      count: row._count.aspect,
    }))
    .sort((first, second) => second.count - first.count);
}
