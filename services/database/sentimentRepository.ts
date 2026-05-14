import { prisma } from "@/lib/prisma/client";

export interface SentimentDistributionItem {
  readonly label: string;
  readonly count: number;
}

export async function getSentimentDistribution(
  runLabel = "default",
): Promise<SentimentDistributionItem[]> {
  const rows = await prisma.sentimentAnalysisResult.groupBy({
    by: ["label"],
    where: {
      runLabel,
    },
    _count: {
      label: true,
    },
  });

  return rows
    .map((row) => ({
      label: row.label,
      count: row._count.label,
    }))
    .sort((first, second) => second.count - first.count);
}
