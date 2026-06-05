import type { AhpRankingComparisonDatum } from "@/components/charts/AhpRankingComparisonChart";
import type { AspectRankingDatum } from "@/components/charts/AspectRankingChart";
import type { SentimentStageComparisonDatum } from "@/components/charts/SentimentStageComparisonChart";
import { aspectRankingData, reviewSamplesToReviews } from "@/lib/gateway-display";
import { getAspectSummary } from "@/services/aspect-service";
import { getDatasetSummary } from "@/services/dataset-service";
import { getEvaluationSummary as fetchEvaluationSummary } from "@/services/evaluation-service";
import { getPreprocessingSummary } from "@/services/preprocessing-service";
import { getRankingComparison as fetchRankingComparison } from "@/services/report-service";
import { getLatestNegativeReviews } from "@/services/review-service";
import { getScrapingSummary } from "@/services/scraping-service";
import { getSentimentSummary } from "@/services/sentiment-service";
import type {
  GatewayAspectSummary,
  GatewayDatasetSummary,
  GatewayEvaluationSummary,
  GatewayPreprocessingSummary,
  GatewayRankingComparisonItem,
  GatewayRankingComparisonResponse,
  GatewayRandomReviewsResponse,
  GatewayScrapingSummary,
  GatewaySentimentSummary,
  Review,
} from "@/types";

const DATA_UNAVAILABLE = "Data belum tersedia";

const COUNT_FORMATTER = new Intl.NumberFormat("id-ID");
const PERCENT_FORMATTER = new Intl.NumberFormat("id-ID", {
  maximumFractionDigits: 1,
});
const SCORE_FORMATTER = new Intl.NumberFormat("id-ID", {
  maximumFractionDigits: 4,
});

type CardTone = "default" | "primary" | "positive" | "neutral" | "negative";

interface DashboardSources {
  scraping: GatewayScrapingSummary | null;
  dataset: GatewayDatasetSummary | null;
  preprocessing: GatewayPreprocessingSummary | null;
  sentiment: GatewaySentimentSummary | null;
  aspect: GatewayAspectSummary | null;
  evaluation: GatewayEvaluationSummary | null;
  ranking: GatewayRankingComparisonResponse | null;
  reviews: GatewayRandomReviewsResponse | null;
}

export interface DashboardDatasetCard {
  id: string;
  label: string;
  value: string;
  description: string;
  tone?: CardTone;
}

export interface DashboardModelMetric {
  id: string;
  label: string;
  value: string;
  description: string;
}

export interface DashboardRankingRow {
  id: string;
  rank: string;
  aspect: string;
  ahpScore: string;
  ahpRank: string;
  fuzzyScore: string;
  fuzzyRank: string;
  status: string;
}

export interface DashboardData {
  datasetCards: DashboardDatasetCard[];
  modelMetrics: DashboardModelMetric[];
  sentimentStages: SentimentStageComparisonDatum[];
  topAspects: AspectRankingDatum[];
  priorityComparison: AhpRankingComparisonDatum[];
  priorityRows: DashboardRankingRow[];
  latestNegativeReviews: Review[];
  rankingCsvAvailable: boolean;
}

export async function getDashboardSummary(): Promise<DashboardData> {
  const [
    scrapingResult,
    datasetResult,
    preprocessingResult,
    sentimentResult,
    aspectResult,
    evaluationResult,
    rankingResult,
    reviewsResult,
  ] = await Promise.allSettled([
    getScrapingSummary(),
    getDatasetSummary(),
    getPreprocessingSummary(),
    getSentimentSummary(),
    getAspectSummary(),
    fetchEvaluationSummary(),
    fetchRankingComparison(),
    getLatestNegativeReviews({ limit: 10, sort: "word_count_desc" }),
  ]);

  const sources: DashboardSources = {
    scraping: settledValue(scrapingResult),
    dataset: settledValue(datasetResult),
    preprocessing: settledValue(preprocessingResult),
    sentiment: settledValue(sentimentResult),
    aspect: settledValue(aspectResult),
    evaluation: settledValue(evaluationResult),
    ranking: settledValue(rankingResult),
    reviews: settledValue(reviewsResult),
  };

  return {
    datasetCards: buildDatasetCards(sources),
    modelMetrics: buildEvaluationMetrics(sources.evaluation),
    sentimentStages: buildSentimentStageComparison(sources),
    topAspects: buildTopAspects(sources.aspect, 5),
    priorityComparison: buildPriorityComparison(sources.ranking),
    priorityRows: buildPriorityRows(sources.ranking),
    latestNegativeReviews: reviewSamplesToReviews(sources.reviews?.reviews ?? []),
    rankingCsvAvailable: Boolean(sources.ranking?.items.length),
  };
}

export async function getSentimentStageComparison(): Promise<
  SentimentStageComparisonDatum[]
> {
  const [datasetResult, preprocessingResult, sentimentResult] = await Promise.allSettled([
    getDatasetSummary(),
    getPreprocessingSummary(),
    getSentimentSummary(),
  ]);

  return buildSentimentStageComparison({
    dataset: settledValue(datasetResult),
    preprocessing: settledValue(preprocessingResult),
    sentiment: settledValue(sentimentResult),
  });
}

export async function getTopAspects(limit = 5): Promise<AspectRankingDatum[]> {
  const result = await Promise.allSettled([getAspectSummary()]);
  return buildTopAspects(settledValue(result[0]), limit);
}

export async function getEvaluationSummary(): Promise<DashboardModelMetric[]> {
  const result = await Promise.allSettled([fetchEvaluationSummary()]);
  return buildEvaluationMetrics(settledValue(result[0]));
}

export async function getRankingComparison(): Promise<{
  chartData: AhpRankingComparisonDatum[];
  rows: DashboardRankingRow[];
}> {
  const result = await Promise.allSettled([fetchRankingComparison()]);
  const ranking = settledValue(result[0]);
  return {
    chartData: buildPriorityComparison(ranking),
    rows: buildPriorityRows(ranking),
  };
}

function settledValue<T>(result: PromiseSettledResult<T>): T | null {
  return result.status === "fulfilled" ? result.value : null;
}

function buildDatasetCards(sources: DashboardSources): DashboardDatasetCard[] {
  const scrapingTarget = sumRecord(sources.scraping?.target_quota_per_rating);
  const scrapingRows =
    finiteNumber(sources.scraping?.total_achieved_rows) ??
    finiteNumber(sources.dataset?.total_review_count);
  const rawTotal = finiteNumber(sources.dataset?.total_review_count);
  const processedTotal = finiteNumber(sources.preprocessing?.total_rows);
  const criteriaCount =
    finiteNumber(sources.ranking?.summary.total_criteria) ??
    sources.evaluation?.final_aspect_criteria.length ??
    sources.aspect?.final_aspect_labels.length ??
    null;
  const ahpTop = topRankingItem(sources.ranking?.items, "ahp_rank");
  const fuzzyTop = topRankingItem(sources.ranking?.items, "fuzzy_ahp_rank");

  return [
    {
      id: "scraping-request",
      label: "Request Scraping",
      value: formatCount(scrapingTarget > 0 ? scrapingTarget : scrapingRows),
      description:
        scrapingTarget > 0
          ? "Target pengambilan data."
          : "Jumlah data hasil scraping.",
    },
    {
      id: "total-dataset",
      label: "Total Dataset",
      value: formatCount(rawTotal),
      description: "Total ulasan sebelum prapemrosesan.",
    },
    {
      id: "preprocessing-dataset",
      label: "Dataset Preprocessing",
      value: formatCount(processedTotal),
      description: retainedRateDescription(rawTotal, processedTotal),
    },
    {
      id: "priority-criteria",
      label: "Kriteria Prioritas",
      value: formatCount(criteriaCount),
      description: "Jumlah aspek final untuk AHP dan Fuzzy AHP.",
    },
    {
      id: "top-ahp-priority",
      label: "Prioritas Tertinggi AHP",
      value: ahpTop?.criterion_name ?? DATA_UNAVAILABLE,
      description: rankingSubtitle("Skor AHP", ahpTop?.ahp_weight, ahpTop?.ahp_rank),
      tone: "primary",
    },
    {
      id: "top-fuzzy-priority",
      label: "Prioritas Tertinggi Fuzzy AHP",
      value: fuzzyTop?.criterion_name ?? DATA_UNAVAILABLE,
      description: rankingSubtitle(
        "Skor Fuzzy AHP",
        fuzzyTop?.fuzzy_ahp_weight,
        fuzzyTop?.fuzzy_ahp_rank,
      ),
      tone: "primary",
    },
  ];
}

function buildEvaluationMetrics(
  evaluation: GatewayEvaluationSummary | null,
): DashboardModelMetric[] {
  const selectedSentiment = selectedRecord(
    evaluation?.indobert_run_comparison,
    evaluation?.selected_indobert_model,
  );
  const selectedAspect = selectedRecord(
    evaluation?.svm_scenario_comparison,
    evaluation?.selected_svm_model,
  );

  return [
    {
      id: "sentiment-f1",
      label: "Macro F1 Sentimen",
      value: formatPercent(numberFromRecord(selectedSentiment, "f1_macro")),
      description: "Rata-rata F1 untuk klasifikasi sentimen.",
    },
    {
      id: "sentiment-accuracy",
      label: "Akurasi Sentimen",
      value: formatPercent(numberFromRecord(selectedSentiment, "accuracy")),
      description: "Akurasi model sentimen pada data uji.",
    },
    {
      id: "aspect-f1",
      label: "Macro F1 Aspek",
      value: formatPercent(numberFromRecord(selectedAspect, "f1_macro")),
      description: "Rata-rata F1 untuk klasifikasi aspek.",
    },
    {
      id: "aspect-accuracy",
      label: "Akurasi Aspek",
      value: formatPercent(numberFromRecord(selectedAspect, "accuracy")),
      description: "Akurasi model aspek pada data uji.",
    },
  ];
}

function buildSentimentStageComparison(
  sources: Pick<DashboardSources, "dataset" | "preprocessing" | "sentiment">,
): SentimentStageComparisonDatum[] {
  const raw = sentimentCounts(
    sources.sentiment?.raw_sentiment_distribution ??
      sources.dataset?.sentiment_distribution,
  );
  const processed = sentimentCounts(
    sources.sentiment?.final_sentiment_distribution ??
      sources.preprocessing?.sentiment_distribution_after,
  );
  const prediction = sentimentCounts(predictionDistribution(sources.sentiment));

  return [
    stageDatum("Raw", raw),
    stageDatum("Preprocessing", processed),
    prediction.total > 0 ? stageDatum("IndoBERT", prediction) : null,
  ].filter((item): item is SentimentStageComparisonDatum => Boolean(item && stageTotal(item) > 0));
}

function buildTopAspects(
  aspect: GatewayAspectSummary | null,
  limit: number,
): AspectRankingDatum[] {
  return aspectRankingData(aspect?.negative_aspect_distribution ?? {}).slice(0, limit);
}

function buildPriorityComparison(
  ranking: GatewayRankingComparisonResponse | null,
): AhpRankingComparisonDatum[] {
  return sortedRankingItems(ranking?.items).flatMap((item, index) => {
    const ahpWeight = finiteNumber(item.ahp_weight);
    const fuzzyAhpWeight = finiteNumber(item.fuzzy_ahp_weight);
    if (ahpWeight === null || fuzzyAhpWeight === null) {
      return [];
    }
    return [
      {
        criterionId: item.criterion_id || `C${index + 1}`,
        label: item.criterion_name,
        shortLabel: shortAspectLabel(item.criterion_name, index),
        ahpWeight,
        fuzzyAhpWeight,
      },
    ];
  });
}

function buildPriorityRows(
  ranking: GatewayRankingComparisonResponse | null,
): DashboardRankingRow[] {
  return sortedRankingItems(ranking?.items).map((item, index) => ({
    id: item.criterion_id || `${item.criterion_name}-${index}`,
    rank: formatRank(item.final_rank ?? item.ahp_rank ?? index + 1),
    aspect: item.criterion_name,
    ahpScore: formatScore(item.ahp_weight),
    ahpRank: formatRank(item.ahp_rank),
    fuzzyScore: formatScore(item.fuzzy_ahp_weight),
    fuzzyRank: formatRank(item.fuzzy_ahp_rank),
    status: statusText(item),
  }));
}

function selectedRecord(
  records: readonly Record<string, unknown>[] | undefined,
  selectedName: string | undefined,
): Record<string, unknown> | null {
  return (
    records?.find((record) => record.status === "selected") ??
    records?.find((record) => record.candidate_name === selectedName) ??
    records?.find((record) => record.scenario === selectedName) ??
    null
  );
}

function sortedRankingItems(
  items: readonly GatewayRankingComparisonItem[] | undefined,
): GatewayRankingComparisonItem[] {
  return [...(items ?? [])].sort((first, second) => {
    const firstRank = first.final_rank ?? first.ahp_rank ?? first.fuzzy_ahp_rank ?? 9999;
    const secondRank =
      second.final_rank ?? second.ahp_rank ?? second.fuzzy_ahp_rank ?? 9999;
    return firstRank - secondRank;
  });
}

function topRankingItem(
  items: readonly GatewayRankingComparisonItem[] | undefined,
  rankKey: "ahp_rank" | "fuzzy_ahp_rank",
): GatewayRankingComparisonItem | null {
  return (
    [...(items ?? [])]
      .filter((item) => finiteNumber(item[rankKey]) !== null)
      .sort((first, second) => Number(first[rankKey]) - Number(second[rankKey]))[0] ??
    null
  );
}

function rankingSubtitle(
  scoreLabel: string,
  score: number | null | undefined,
  rank: number | null | undefined,
): string {
  const parts = [];
  if (finiteNumber(score) !== null) {
    parts.push(`${scoreLabel} ${formatScore(score)}`);
  }
  if (finiteNumber(rank) !== null) {
    parts.push(`Rank ${formatRank(rank)}`);
  }
  return parts.length > 0 ? parts.join(" - ") : DATA_UNAVAILABLE;
}

function retainedRateDescription(
  rawTotal: number | null,
  processedTotal: number | null,
): string {
  if (rawTotal && processedTotal !== null) {
    return `${formatPercent(processedTotal / rawTotal)} dari dataset awal.`;
  }
  return "Total ulasan setelah pembersihan data.";
}

function sentimentCounts(
  distribution: Record<string, number> | undefined,
): { positive: number; neutral: number; negative: number; total: number } {
  const positive = distributionValue(distribution, ["positive", "positif"]);
  const neutral = distributionValue(distribution, ["neutral", "netral"]);
  const negative = distributionValue(distribution, ["negative", "negatif"]);
  return {
    positive,
    neutral,
    negative,
    total: positive + neutral + negative,
  };
}

function distributionValue(
  distribution: Record<string, number> | undefined,
  aliases: string[],
): number {
  if (!distribution) {
    return 0;
  }
  const normalized = Object.fromEntries(
    Object.entries(distribution).map(([key, value]) => [key.toLowerCase(), value]),
  );
  return aliases.reduce((value, alias) => value || normalized[alias] || 0, 0);
}

function predictionDistribution(
  sentiment: GatewaySentimentSummary | null,
): Record<string, number> | undefined {
  const payload = sentiment as unknown as Record<string, unknown> | null;
  const value =
    payload?.indobert_prediction_distribution ??
    payload?.prediction_sentiment_distribution ??
    payload?.model_prediction_distribution;
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return undefined;
  }
  return value as Record<string, number>;
}

function stageDatum(
  stage: string,
  counts: { positive: number; neutral: number; negative: number },
): SentimentStageComparisonDatum {
  return {
    stage,
    positive: counts.positive,
    neutral: counts.neutral,
    negative: counts.negative,
  };
}

function stageTotal(item: SentimentStageComparisonDatum): number {
  return item.positive + item.neutral + item.negative;
}

function sumRecord(record: Record<string, number> | undefined): number {
  return Object.values(record ?? {}).reduce(
    (total, value) => total + (Number.isFinite(value) ? value : 0),
    0,
  );
}

function numberFromRecord(
  record: Record<string, unknown> | null,
  key: string,
): number | null {
  return finiteNumber(record?.[key]);
}

function finiteNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function formatCount(value: number | null | undefined): string {
  return value === null || value === undefined
    ? DATA_UNAVAILABLE
    : COUNT_FORMATTER.format(value);
}

function formatPercent(value: number | null | undefined): string {
  if (value === null || value === undefined) {
    return DATA_UNAVAILABLE;
  }
  const percentValue = value <= 1 ? value * 100 : value;
  return `${PERCENT_FORMATTER.format(percentValue)}%`;
}

function formatScore(value: number | null | undefined): string {
  return value === null || value === undefined
    ? DATA_UNAVAILABLE
    : SCORE_FORMATTER.format(value);
}

function formatRank(value: number | null | undefined): string {
  return value === null || value === undefined ? DATA_UNAVAILABLE : COUNT_FORMATTER.format(value);
}

function statusText(item: GatewayRankingComparisonItem): string {
  if (item.status) {
    return item.status;
  }
  if (finiteNumber(item.weight_delta) !== null) {
    return formatScore(item.weight_delta);
  }
  if (item.rank_delta === 0) {
    return "Stabil";
  }
  if (finiteNumber(item.rank_delta) !== null) {
    return `${Number(item.rank_delta) > 0 ? "+" : ""}${COUNT_FORMATTER.format(Number(item.rank_delta))}`;
  }
  return DATA_UNAVAILABLE;
}

function shortAspectLabel(label: string, index: number): string {
  const words = label
    .replace(/[,&/]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
  if (words.length <= 2) {
    return label;
  }
  return `${words.slice(0, 2).join(" ")} ${index + 1}`;
}
