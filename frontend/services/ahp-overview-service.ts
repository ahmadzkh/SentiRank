import type { AhpRankingComparisonDatum } from "@/components/charts/AhpRankingComparisonChart";
import { normalizeApiGatewayError } from "@/lib/api-status";
import { getEvaluationSummary } from "@/services/evaluation-service";
import { getRankingComparison as fetchRankingComparison } from "@/services/report-service";
import type {
  ApiGatewayFailure,
  GatewayEvaluationSummary,
  GatewayFuzzyTriangularNumber,
  GatewayMatrixCriterion,
  GatewayRankingComparisonItem,
  GatewayRankingComparisonResponse,
  GatewayRespondentDetail,
} from "@/types";

const DATA_UNAVAILABLE = "-";
const COUNT_FORMATTER = new Intl.NumberFormat("id-ID");
const WEIGHT_FORMATTER = new Intl.NumberFormat("id-ID", {
  maximumFractionDigits: 4,
});
const MATRIX_FORMATTER = new Intl.NumberFormat("id-ID", {
  maximumFractionDigits: 3,
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

export interface RespondentDetailRow {
  id: string;
  originalCode: string;
  sourceType: string;
  roleCategory: string;
  profile: string;
  spotifyUsage: string;
  criteriaAdequacy: string;
  topCriterion: string;
  consistencyRatio: string;
  consistencyStatus: "Konsisten" | "Tidak Konsisten" | "-";
}

export interface MatrixCriterionView {
  id: string;
  name: string;
}

export interface PairwiseMatrixRow {
  id: string;
  criterion: string;
  values: string[];
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
  respondentRows: RespondentDetailRow[];
  matrixCriteria: MatrixCriterionView[];
  ahpPairwiseRows: PairwiseMatrixRow[];
  fuzzyPairwiseRows: PairwiseMatrixRow[];
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
  const matrixCriteria = buildMatrixCriteria(ranking?.criteria, rankingItems);

  const respondentSummary: RespondentSummaryView = {
    totalRespondents: rs?.total_respondents ?? 0,
    validCount: rs?.valid_respondent_count ?? 0,
    invalidCount: rs?.invalid_respondent_count ?? 0,
    actualCount: rs?.source_type_summary?.actual ?? 0,
    syntheticCount: rs?.source_type_summary?.synthetic ?? 0,
    ahpConsistencyRatio:
      rs?.ahp_consistency_ratio != null
        ? formatWeight(rs.ahp_consistency_ratio)
        : DATA_UNAVAILABLE,
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
    respondentRows: buildRespondentRows(ranking?.respondent_details),
    matrixCriteria,
    ahpPairwiseRows: buildAhpMatrixRows(matrixCriteria, ranking?.ahp_pairwise_matrix),
    fuzzyPairwiseRows: buildFuzzyMatrixRows(
      matrixCriteria,
      ranking?.fuzzy_ahp_pairwise_matrix,
    ),
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
    criterionId: item.criterion_id ?? `criterion-${item.criterion_name}`,
    label: item.criterion_name,
    shortLabel: item.criterion_name,
    ahpWeight: item.ahp_weight ?? 0,
    fuzzyAhpWeight: item.fuzzy_ahp_weight ?? 0,
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

function buildRespondentRows(
  respondents: readonly GatewayRespondentDetail[] | undefined | null,
): RespondentDetailRow[] {
  if (!respondents) return [];
  return respondents.map((respondent) => ({
    id: respondent.respondent_id,
    originalCode: respondent.original_code ?? DATA_UNAVAILABLE,
    sourceType: sourceTypeLabel(respondent.source_type),
    roleCategory: respondent.role_category ?? DATA_UNAVAILABLE,
    profile: compactParts([respondent.education, respondent.experience]),
    spotifyUsage: compactParts([
      respondent.spotify_status,
      respondent.spotify_frequency,
    ]),
    criteriaAdequacy: respondent.criteria_adequacy ?? DATA_UNAVAILABLE,
    topCriterion: respondent.top_criterion ?? DATA_UNAVAILABLE,
    consistencyRatio: formatWeight(respondent.consistency_ratio),
    consistencyStatus: consistencyStatusLabel(respondent.is_consistent),
  }));
}

function buildMatrixCriteria(
  criteria: readonly GatewayMatrixCriterion[] | undefined | null,
  items: readonly GatewayRankingComparisonItem[],
): MatrixCriterionView[] {
  if (criteria?.length) {
    return criteria.map((criterion, index) => ({
      id: criterion.id || `C${index + 1}`,
      name: criterion.name,
    }));
  }

  return items.map((item, index) => ({
    id: item.criterion_id || `C${index + 1}`,
    name: item.criterion_name,
  }));
}

function buildAhpMatrixRows(
  criteria: readonly MatrixCriterionView[],
  matrix: readonly (readonly number[])[] | undefined | null,
): PairwiseMatrixRow[] {
  if (!matrix || matrix.length === 0 || criteria.length === 0) return [];
  return matrix.slice(0, criteria.length).map((row, rowIndex) => ({
    id: criteria[rowIndex]?.id ?? `row-${rowIndex}`,
    criterion: criteria[rowIndex]?.name ?? DATA_UNAVAILABLE,
    values: criteria.map((_, columnIndex) => formatMatrixValue(row[columnIndex])),
  }));
}

function buildFuzzyMatrixRows(
  criteria: readonly MatrixCriterionView[],
  matrix: readonly (readonly GatewayFuzzyTriangularNumber[])[] | undefined | null,
): PairwiseMatrixRow[] {
  if (!matrix || matrix.length === 0 || criteria.length === 0) return [];
  return matrix.slice(0, criteria.length).map((row, rowIndex) => ({
    id: criteria[rowIndex]?.id ?? `row-${rowIndex}`,
    criterion: criteria[rowIndex]?.name ?? DATA_UNAVAILABLE,
    values: criteria.map((_, columnIndex) => formatTfnValue(row[columnIndex])),
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

function formatMatrixValue(value: number | null | undefined): string {
  if (value == null || !isFinite(value)) return DATA_UNAVAILABLE;
  return MATRIX_FORMATTER.format(value);
}

function formatTfnValue(value: GatewayFuzzyTriangularNumber | null | undefined): string {
  if (!value) return DATA_UNAVAILABLE;
  return `(${formatMatrixValue(value.l)}, ${formatMatrixValue(value.m)}, ${formatMatrixValue(value.u)})`;
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

function compactParts(parts: readonly (string | null | undefined)[]): string {
  const value = parts.filter(Boolean).join(" · ");
  return value || DATA_UNAVAILABLE;
}

function sourceTypeLabel(sourceType: string | null | undefined): string {
  if (sourceType === "actual") return "Aktual";
  if (sourceType === "synthetic") return "Sintetis";
  return DATA_UNAVAILABLE;
}

function consistencyStatusLabel(
  isConsistent: boolean | null | undefined,
): RespondentDetailRow["consistencyStatus"] {
  if (isConsistent === true) return "Konsisten";
  if (isConsistent === false) return "Tidak Konsisten";
  return DATA_UNAVAILABLE;
}
