import type { AhpRankingComparisonDatum } from "@/components/charts/AhpRankingComparisonChart";
import { normalizeApiGatewayError } from "@/lib/api-status";
import { getEvaluationSummary } from "@/services/evaluation-service";
import { getRankingComparison as fetchRankingComparison } from "@/services/report-service";
import type {
  ApiGatewayFailure,
  GatewayEvaluationSummary,
  GatewayRankingComparisonItem,
  GatewayRankingComparisonResponse,
} from "@/types";

const DATA_UNAVAILABLE = "-";
const COUNT_FORMATTER = new Intl.NumberFormat("id-ID");
const WEIGHT_FORMATTER = new Intl.NumberFormat("id-ID", {
  maximumFractionDigits: 4,
});

export type AhpFuzzyAhpDataStatus =
  | "sample"
  | "final"
  | "pending"
  | "unavailable";

export type AhpFuzzyAhpNoticeTone = "sample" | "final" | "info";

export interface AhpFuzzyAhpNotice {
  tone: AhpFuzzyAhpNoticeTone;
  text: string;
}

export interface AhpFuzzyAhpSummaryCard {
  id: string;
  label: string;
  value: string;
  description: string;
  tone?: "default" | "primary" | "positive" | "neutral" | "negative";
}

export interface ComparisonRow {
  id: string;
  criterion: string;
  ahpRank: string;
  fuzzyRank: string;
  ahpWeight: string;
  fuzzyWeight: string;
  rankChange: string;
  interpretation: string;
}

export interface RespondentSummaryView {
  totalRespondents: number;
  validCount: number;
  invalidCount: number;
  actualCount: number;
  syntheticCount: number;
  ahpConsistencyRatio: string;
  note: string;
}

export interface AhpFuzzyAhpOverview {
  apiError: ApiGatewayFailure | null;
  notice: AhpFuzzyAhpNotice;
  dataStatus: AhpFuzzyAhpDataStatus;
  dataStatusLabel: string;
  isServiceUnavailable: boolean;
  summaryCards: AhpFuzzyAhpSummaryCard[];
  chartData: AhpRankingComparisonDatum[];
  comparisonRows: ComparisonRow[];
  respondentSummary: RespondentSummaryView;
}

export async function getAhpFuzzyAhpOverview(): Promise<AhpFuzzyAhpOverview> {
  const [evaluationResult, rankingResult] = await Promise.allSettled([
    getEvaluationSummary(),
    fetchRankingComparison(),
  ]);

  const evaluation = settledValue(evaluationResult);
  const ranking = settledValue(rankingResult);
  const apiError = firstRejectedGatewayError([
    evaluationResult,
    rankingResult,
  ]);
  const allSourcesUnavailable =
    evaluationResult.status === "rejected" &&
    rankingResult.status === "rejected";

  const rankingItems = sortedByAhpRank(ranking?.items);
  const dataStatus = deriveDataStatus(evaluation, ranking, allSourcesUnavailable);
  const rs = ranking?.respondent_summary;
  const dataStatusLabel = statusLabel(dataStatus, rs);
  const criteriaCount = finiteNumber(ranking?.summary.total_criteria) ?? 5;
  const topPriority = rankingItems[0]?.criterion_name ?? DATA_UNAVAILABLE;
  const notice = buildNotice(dataStatus, rs);

  const respondentSummary: RespondentSummaryView = {
    totalRespondents: rs?.total_respondents ?? 0,
    validCount: rs?.valid_respondent_count ?? 0,
    invalidCount: rs?.invalid_respondent_count ?? 0,
    actualCount: rs?.source_type_summary?.actual ?? 0,
    syntheticCount: rs?.source_type_summary?.synthetic ?? 0,
    ahpConsistencyRatio: rs?.ahp_consistency_ratio != null ? String(rs.ahp_consistency_ratio) : DATA_UNAVAILABLE,
    note: rs?.note ?? "",
  };

  return {
    apiError,
    notice,
    dataStatus,
    dataStatusLabel,
    isServiceUnavailable: allSourcesUnavailable,
    summaryCards: [
      {
        id: "top-priority",
        label: "Prioritas Tertinggi",
        value: topPriority,
        description:
          topPriority === DATA_UNAVAILABLE
            ? "Menunggu hasil prioritas."
            : "Berdasarkan ranking AHP & Fuzzy AHP.",
        tone: "primary",
      },
      {
        id: "criteria-count",
        label: "Jumlah Kriteria",
        value: formatCount(criteriaCount),
        description: "Lima aspek ulasan negatif Spotify.",
      },
      {
        id: "respondent-summary",
        label: "Responden",
        value: `${respondentSummary.validCount}/${respondentSummary.totalRespondents} valid`,
        description:
          respondentSummary.totalRespondents === 0
            ? "Data responden belum tersedia."
            : `${respondentSummary.actualCount} aktual, ${respondentSummary.syntheticCount} simulasi. ${respondentSummary.invalidCount} tidak konsisten.`,
        tone: "neutral",
      },
      {
        id: "ahp-consistency",
        label: "Consistency Ratio AHP",
        value: respondentSummary.ahpConsistencyRatio,
        description: "CR ≤ 0,10 = konsisten. Semakin kecil semakin baik.",
      },
    ],
    chartData: buildChartData(rankingItems),
    comparisonRows: buildComparisonRows(rankingItems),
    respondentSummary,
  };
}

function settledValue<T>(result: PromiseSettledResult<T>): T | null {
  return result.status === "fulfilled" ? result.value : null;
}

function firstRejectedGatewayError(
  results: readonly PromiseSettledResult<unknown>[],
): ApiGatewayFailure | null {
  const rejected = results.find(
    (result): result is PromiseRejectedResult => result.status === "rejected",
  );
  return rejected ? normalizeApiGatewayError(rejected.reason) : null;
}

function deriveDataStatus(
  evaluation: GatewayEvaluationSummary | null,
  ranking: GatewayRankingComparisonResponse | null,
  allSourcesUnavailable: boolean,
): AhpFuzzyAhpDataStatus {
  if (allSourcesUnavailable) return "unavailable";
  if (ranking === null) return "pending";
  if (ranking.is_sample === false) return "final";
  if (ranking.is_sample === true) return "sample";
  if (ranking.items.length > 0 && ranking.summary.total_criteria > 0)
    return "final";
  return "pending";
}

function statusLabel(
  dataStatus: AhpFuzzyAhpDataStatus,
  rs?: GatewayRankingComparisonResponse["respondent_summary"],
): string {
  if (dataStatus === "unavailable") return "Tidak tersedia";
  if (dataStatus === "pending") return "Tertunda";
  if (dataStatus === "sample") return "Sample";
  const synCount = rs?.source_type_summary?.synthetic ?? 0;
  const actCount = rs?.source_type_summary?.actual ?? 0;
  if (synCount > 0 && actCount === 0) return "Final (Simulasi)";
  if (actCount > 0 && synCount > 0) return "Final (Aktual + Simulasi)";
  return "Final";
}

function buildNotice(
  dataStatus: AhpFuzzyAhpDataStatus,
  rs?: GatewayRankingComparisonResponse["respondent_summary"],
): AhpFuzzyAhpNotice {
  if (dataStatus === "unavailable" || dataStatus === "pending") {
    return {
      tone: "info",
      text: "Data AHP dan Fuzzy AHP belum tersedia. Silakan coba kembali setelah layanan analisis tersedia.",
    };
  }

  const synCount = rs?.source_type_summary?.synthetic ?? 0;
  const actCount = rs?.source_type_summary?.actual ?? 0;
  const total = rs?.total_respondents ?? 0;

  if (synCount > 0 && actCount === 0) {
    return {
      tone: "sample",
      text: `Data AHP dan Fuzzy AHP berasal dari synthetic expert judgement (${synCount} simulasi, ${total} total responden). Hasil ini bersifat demonstrasi — bukan penilaian expert riil.`,
    };
  }

  return {
    tone: "final",
    text: "Data AHP dan Fuzzy AHP menggunakan hasil expert judgement yang tersedia.",
  };
}

function sortedByAhpRank(
  items: readonly GatewayRankingComparisonItem[] | undefined | null,
): GatewayRankingComparisonItem[] {
  if (!items) return [];
  return [...items].sort(
    (a, b) => (a.ahp_rank ?? 999) - (b.ahp_rank ?? 999),
  );
}

function buildChartData(
  items: readonly GatewayRankingComparisonItem[],
): AhpRankingComparisonDatum[] {
  return items.map((item) => ({
    label: item.criterion_name,
    ahpWeight: item.ahp_weight ?? 0,
    fuzzyWeight: item.fuzzy_ahp_weight ?? 0,
  }));
}

function buildComparisonRows(
  items: readonly GatewayRankingComparisonItem[],
): ComparisonRow[] {
  return items.map((item, index) => ({
    id: item.criterion_id || `comp-${index}`,
    criterion: item.criterion_name,
    ahpRank: formatRank(item.ahp_rank),
    fuzzyRank: formatRank(item.fuzzy_ahp_rank),
    ahpWeight: formatWeight(item.ahp_weight),
    fuzzyWeight: formatWeight(item.fuzzy_ahp_weight),
    rankChange: rankChangeLabel(item.rank_delta),
    interpretation: rankChangeInterpretation(item.rank_delta),
  }));
}

function formatRank(rank: number | null | undefined): string {
  if (rank == null) return DATA_UNAVAILABLE;
  return String(rank);
}

function formatWeight(weight: number | null | undefined): string {
  if (weight == null || !isFinite(weight)) return DATA_UNAVAILABLE;
  return WEIGHT_FORMATTER.format(weight);
}

function formatCount(value: number | null | undefined): string {
  if (value == null || !isFinite(value)) return DATA_UNAVAILABLE;
  return COUNT_FORMATTER.format(value);
}

function rankChangeLabel(delta: number | null | undefined): string {
  if (delta == null) return DATA_UNAVAILABLE;
  if (delta === 0) return "—";
  if (delta < 0) return `Naik ${Math.abs(delta)}`;
  return `Turun ${delta}`;
}

function rankChangeInterpretation(delta: number | null | undefined): string {
  if (delta == null) return "—";
  if (delta === 0) return "Stabil pada kedua metode";
  if (delta < 0) return "Fuzzy AHP ranking lebih tinggi";
  return "AHP ranking lebih tinggi";
}

function finiteNumber(value: number | null | undefined): number | null {
  if (value == null || !isFinite(value)) return null;
  return value;
}
