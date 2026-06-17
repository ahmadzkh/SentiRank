import type { AhpRankingComparisonDatum } from "@/components/charts/AhpRankingComparisonChart";
import { normalizeApiGatewayError } from "@/lib/api-status";
import { getAhpCriteria } from "@/services/ahp-service";
import { getEvaluationSummary } from "@/services/evaluation-service";
import { getRankingComparison as fetchRankingComparison } from "@/services/report-service";
import type {
  ApiGatewayFailure,
  GatewayCriterion,
  GatewayEvaluationSummary,
  GatewayRankingComparisonItem,
  GatewayRankingComparisonResponse,
} from "@/types";

const DATA_UNAVAILABLE = "-";
const ZERO_VALUE = "0";

const COUNT_FORMATTER = new Intl.NumberFormat("id-ID");
const WEIGHT_FORMATTER = new Intl.NumberFormat("id-ID", {
  maximumFractionDigits: 4,
});
const PERCENT_FORMATTER = new Intl.NumberFormat("id-ID", {
  maximumFractionDigits: 2,
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

export interface CriteriaOverviewRow {
  id: string;
  no: string;
  criterion: string;
  description: string;
  negativeReviewCount: string;
  complaintExample: string;
}

export interface MethodWeightRow {
  id: string;
  rank: string;
  rankValue: number | null;
  criterion: string;
  weight: string;
  percent: string;
  status: string;
}

export interface MethodSummary {
  topCriterion: string;
  consistencyRatio: string;
  consistencyStatus: string;
  criteriaCount: string;
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

export interface PriorityRow {
  id: string;
  rank: string;
  criterion: string;
  ahpWeight: string;
  fuzzyWeight: string;
  priority: string;
  recommendation: string;
}

export interface AhpFuzzyAhpOverview {
  apiError: ApiGatewayFailure | null;
  notice: AhpFuzzyAhpNotice;
  dataStatus: AhpFuzzyAhpDataStatus;
  dataStatusLabel: string;
  isServiceUnavailable: boolean;
  summaryCards: AhpFuzzyAhpSummaryCard[];
  criteriaRows: CriteriaOverviewRow[];
  ahpSummary: MethodSummary;
  fuzzySummary: MethodSummary;
  ahpRows: MethodWeightRow[];
  fuzzyRows: MethodWeightRow[];
  chartData: AhpRankingComparisonDatum[];
  comparisonRows: ComparisonRow[];
  priorityRows: PriorityRow[];
  recommendationTitle: string;
  recommendationText: string;
  recommendationBasis: string[];
  interpretationNotes: string[];
}

interface CriterionSeed {
  id?: string | null;
  name?: string | null;
  description?: string | null;
  negativeReviewCount?: unknown;
  complaintExample?: unknown;
}

interface CriterionDisplayMeta {
  matchers: string[];
  description: string;
  recommendation: string;
}

const CRITERION_DISPLAY_META: CriterionDisplayMeta[] = [
  {
    matchers: [
      "Features, Content & Audio Experience",
      "Features Content Audio Experience",
    ],
    description:
      "Keluhan terkait fitur aplikasi, ketersediaan konten, playlist, rekomendasi, lirik, podcast, dan kualitas pengalaman audio.",
    recommendation:
      "Evaluasi kualitas audio, ketersediaan konten, fitur playlist, rekomendasi, dan pengalaman mendengarkan.",
  },
  {
    matchers: ["Ads Experience"],
    description:
      "Keluhan terkait frekuensi, penempatan, gangguan, dan pengalaman mendengarkan yang terinterupsi oleh iklan.",
    recommendation:
      "Evaluasi intensitas dan penempatan iklan yang mengganggu pengalaman pengguna.",
  },
  {
    matchers: ["App Reliability & Usability", "App Reliability Usability"],
    description:
      "Keluhan terkait bug, crash, lag, loading, responsivitas, navigasi, dan hambatan penggunaan aplikasi.",
    recommendation:
      "Prioritaskan perbaikan bug, crash, lag, dan hambatan penggunaan aplikasi.",
  },
  {
    matchers: ["Subscription & Pricing", "Subscription Pricing"],
    description:
      "Keluhan terkait harga, paket langganan, pembayaran, batasan fitur premium, dan persepsi nilai layanan.",
    recommendation:
      "Tinjau keluhan terkait harga, paket langganan, dan batasan fitur.",
  },
  {
    matchers: ["Account/Login", "Account Login"],
    description:
      "Keluhan terkait akses akun, login, registrasi, kata sandi, verifikasi, dan sinkronisasi pengguna.",
    recommendation:
      "Perbaiki kendala login, akses akun, dan sinkronisasi pengguna.",
  },
  {
    matchers: ["Content & Audio Experience", "Content Audio Experience"],
    description:
      "Keluhan terkait kualitas audio, ketersediaan konten, podcast, playlist, rekomendasi, dan pengalaman mendengarkan.",
    recommendation:
      "Evaluasi kualitas audio, ketersediaan konten, dan pengalaman mendengarkan.",
  },
  {
    matchers: ["Features"],
    description:
      "Keluhan terkait fitur aplikasi yang sering dikeluhkan, membingungkan, atau belum memenuhi kebutuhan pengguna.",
    recommendation:
      "Tinjau fitur yang sering dikeluhkan atau dianggap membingungkan pengguna.",
  },
];

export async function getAhpFuzzyAhpOverview(): Promise<AhpFuzzyAhpOverview> {
  const [criteriaResult, evaluationResult, rankingResult] = await Promise.allSettled([
    getAhpCriteria(),
    getEvaluationSummary(),
    fetchRankingComparison(),
  ]);

  const criteria = settledValue(criteriaResult) ?? [];
  const evaluation = settledValue(evaluationResult);
  const ranking = settledValue(rankingResult);
  const apiError = firstRejectedGatewayError([
    criteriaResult,
    evaluationResult,
    rankingResult,
  ]);
  const allSourcesUnavailable =
    criteriaResult.status === "rejected" &&
    evaluationResult.status === "rejected" &&
    rankingResult.status === "rejected";

  const criteriaRows = buildCriteriaRows(criteria, evaluation, ranking);
  const rankingItems = sortedPriorityItems(ranking?.items);
  const dataStatus = deriveDataStatus(evaluation, ranking, allSourcesUnavailable);
  const dataStatusLabel = statusLabel(dataStatus);
  const criteriaCount =
    finiteNumber(ranking?.summary.total_criteria) ?? criteriaRows.length;
  const topPriority = rankingItems[0]?.criterion_name ?? DATA_UNAVAILABLE;
  const ahpTop = topRankingItem(rankingItems, "ahp_rank")?.criterion_name;
  const fuzzyTop = topRankingItem(rankingItems, "fuzzy_ahp_rank")?.criterion_name;
  const notice = buildNotice(dataStatus);
  const isServiceUnavailable = allSourcesUnavailable;
  const samplePrefix = dataStatus === "sample" ? "sample " : "";
  const consistencyFallback =
    dataStatus === "unavailable" ? ZERO_VALUE : DATA_UNAVAILABLE;

  return {
    apiError,
    notice,
    dataStatus,
    dataStatusLabel,
    isServiceUnavailable,
    summaryCards: [
      {
        id: "top-priority",
        label: "Kriteria Prioritas Tertinggi",
        value: topPriority,
        description:
          topPriority === DATA_UNAVAILABLE
            ? "Menunggu hasil prioritas dari layanan analisis."
            : `Berdasarkan ranking ${samplePrefix}yang tersedia.`,
        tone: "primary",
      },
      {
        id: "criteria-count",
        label: "Jumlah Kriteria",
        value: formatCount(criteriaCount),
        description: "Mengikuti daftar kriteria yang diterima dari layanan.",
      },
      {
        id: "data-status",
        label: "Status Data",
        value: dataStatusLabel,
        description: statusDescription(dataStatus),
        tone: dataStatus === "final" ? "positive" : "neutral",
      },
      {
        id: "ahp-consistency",
        label: "Status Konsistensi AHP",
        value: consistencyFallback,
        description:
          "Status konsistensi akan ditampilkan jika ringkasan analisis menyediakannya.",
      },
    ],
    criteriaRows,
    ahpSummary: {
      topCriterion: ahpTop ?? DATA_UNAVAILABLE,
      consistencyRatio: consistencyFallback,
      consistencyStatus: "Menunggu data",
      criteriaCount: formatCount(criteriaCount),
    },
    fuzzySummary: {
      topCriterion: fuzzyTop ?? DATA_UNAVAILABLE,
      consistencyRatio: consistencyFallback,
      consistencyStatus: dataStatusLabel,
      criteriaCount: formatCount(criteriaCount),
    },
    ahpRows: buildAhpRows(rankingItems, dataStatus),
    fuzzyRows: buildFuzzyRows(rankingItems, dataStatus),
    chartData: buildChartData(rankingItems),
    comparisonRows: buildComparisonRows(rankingItems),
    priorityRows: buildPriorityRows(rankingItems),
    recommendationTitle:
      dataStatus === "sample"
        ? "Ringkasan Rekomendasi Sample"
        : "Ringkasan Rekomendasi Prioritas",
    recommendationText:
      topPriority === DATA_UNAVAILABLE
        ? "Maaf, data AHP dan Fuzzy AHP belum dapat ditampilkan saat ini. Silakan coba kembali setelah layanan analisis tersedia."
        : `${topPriority} menjadi prioritas tertinggi pada data ${dataStatusLabel.toLowerCase()} yang tersedia. Interpretasi ini harus dibaca sebagai arahan awal sampai seluruh expert judgement final terkumpul.`,
    recommendationBasis: [
      `Prioritas AHP tertinggi: ${ahpTop ?? DATA_UNAVAILABLE}`,
      `Prioritas Fuzzy AHP tertinggi: ${fuzzyTop ?? DATA_UNAVAILABLE}`,
      `Jumlah kriteria: ${formatCount(criteriaCount)}`,
      `Status data: ${dataStatusLabel}`,
    ],
    interpretationNotes: [
      "Frontend hanya membaca data dari layanan backend melalui API Gateway.",
      "Halaman ini tidak menjalankan perhitungan AHP atau Fuzzy AHP.",
      "Jumlah dan nama kriteria mengikuti data yang diterima agar tidak mengunci struktur final.",
      "Jika data masih sample, interpretasi ranking perlu dikonfirmasi ulang setelah expert judgement final tersedia.",
    ],
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

function buildCriteriaRows(
  criteria: readonly GatewayCriterion[],
  evaluation: GatewayEvaluationSummary | null,
  ranking: GatewayRankingComparisonResponse | null,
): CriteriaOverviewRow[] {
  const seeds = new Map<string, CriterionSeed>();

  criteria.forEach((criterion) => {
    addCriterionSeed(seeds, {
      id: criterion.id,
      name: criterion.name,
      description: criterion.description,
    });
  });

  evaluation?.final_aspect_criteria.forEach((item, index) => {
    addCriterionSeed(seeds, criterionSeedFromRecord(item, `E${index + 1}`));
  });

  ranking?.items.forEach((item, index) => {
    addCriterionSeed(seeds, {
      id: item.criterion_id || `R${index + 1}`,
      name: item.criterion_name,
    });
  });

  return Array.from(seeds.values()).map((criterion, index) => {
    const name = criterion.name?.trim() || DATA_UNAVAILABLE;
    return {
      id: criterion.id?.trim() || `criterion-${index + 1}`,
      no: formatCount(index + 1),
      criterion: name,
      description: descriptionForCriterion(name),
      negativeReviewCount: formatOptionalCount(criterion.negativeReviewCount),
      complaintExample: textOrUnavailable(criterion.complaintExample),
    };
  });
}

function addCriterionSeed(seeds: Map<string, CriterionSeed>, criterion: CriterionSeed) {
  const name = criterion.name?.trim();
  if (!name) {
    return;
  }

  const key = normalizeCriterion(name);
  const existing = seeds.get(key);
  seeds.set(key, {
    id: existing?.id ?? criterion.id,
    name: existing?.name ?? name,
    description: existing?.description ?? criterion.description,
    negativeReviewCount:
      existing?.negativeReviewCount ?? criterion.negativeReviewCount,
    complaintExample: existing?.complaintExample ?? criterion.complaintExample,
  });
}

function criterionSeedFromRecord(
  record: Record<string, unknown>,
  fallbackId: string,
): CriterionSeed {
  return {
    id: stringFromRecord(record, ["id", "criterion_id", "code"]) ?? fallbackId,
    name: stringFromRecord(record, ["name", "criterion_name", "criteria", "aspect"]),
    description: stringFromRecord(record, ["description", "desc"]),
    negativeReviewCount: valueFromRecord(record, [
      "negative_review_count",
      "negative_count",
      "review_count",
      "jumlah_ulasan_negatif",
      "count",
    ]),
    complaintExample: valueFromRecord(record, [
      "example_complaint",
      "contoh_keluhan",
      "sample_complaint",
      "example",
    ]),
  };
}

function buildAhpRows(
  items: readonly GatewayRankingComparisonItem[],
  dataStatus: AhpFuzzyAhpDataStatus,
): MethodWeightRow[] {
  return sortedByRank(items, "ahp_rank").map((item, index) => ({
    id: item.criterion_id || `${item.criterion_name}-ahp-${index}`,
    rank: formatRank(item.ahp_rank),
    rankValue: finiteNumber(item.ahp_rank),
    criterion: item.criterion_name,
    weight: formatWeight(item.ahp_weight),
    percent: formatWeightPercent(item.ahp_weight),
    status: weightStatus(item.ahp_rank, dataStatus),
  }));
}

function buildFuzzyRows(
  items: readonly GatewayRankingComparisonItem[],
  dataStatus: AhpFuzzyAhpDataStatus,
): MethodWeightRow[] {
  return sortedByRank(items, "fuzzy_ahp_rank").map((item, index) => ({
    id: item.criterion_id || `${item.criterion_name}-fuzzy-${index}`,
    rank: formatRank(item.fuzzy_ahp_rank),
    rankValue: finiteNumber(item.fuzzy_ahp_rank),
    criterion: item.criterion_name,
    weight: formatWeight(item.fuzzy_ahp_weight),
    percent: formatWeightPercent(item.fuzzy_ahp_weight),
    status: weightStatus(item.fuzzy_ahp_rank, dataStatus),
  }));
}

function buildComparisonRows(
  items: readonly GatewayRankingComparisonItem[],
): ComparisonRow[] {
  return sortedPriorityItems(items).map((item, index) => {
    const movement = rankMovement(item.ahp_rank, item.fuzzy_ahp_rank);
    return {
      id: item.criterion_id || `${item.criterion_name}-comparison-${index}`,
      criterion: item.criterion_name,
      ahpRank: formatRank(item.ahp_rank),
      fuzzyRank: formatRank(item.fuzzy_ahp_rank),
      ahpWeight: formatWeight(item.ahp_weight),
      fuzzyWeight: formatWeight(item.fuzzy_ahp_weight),
      rankChange: movement.label,
      interpretation: movement.interpretation,
    };
  });
}

function buildPriorityRows(
  items: readonly GatewayRankingComparisonItem[],
): PriorityRow[] {
  return sortedPriorityItems(items).map((item, index) => {
    const rank = finiteNumber(item.final_rank ?? item.ahp_rank ?? item.fuzzy_ahp_rank);
    return {
      id: item.criterion_id || `${item.criterion_name}-priority-${index}`,
      rank: formatRank(rank),
      criterion: item.criterion_name,
      ahpWeight: formatWeight(item.ahp_weight),
      fuzzyWeight: formatWeight(item.fuzzy_ahp_weight),
      priority: priorityLabel(rank),
      recommendation: recommendationForCriterion(item.criterion_name),
    };
  });
}

function buildChartData(
  items: readonly GatewayRankingComparisonItem[],
): AhpRankingComparisonDatum[] {
  return sortedPriorityItems(items).flatMap((item, index) => {
    const ahpWeight = finiteNumber(item.ahp_weight);
    const fuzzyAhpWeight = finiteNumber(item.fuzzy_ahp_weight);

    if (ahpWeight === null || fuzzyAhpWeight === null) {
      return [];
    }

    return [
      {
        criterionId: item.criterion_id || `C${index + 1}`,
        label: item.criterion_name,
        shortLabel: shortCriterionLabel(item.criterion_name, index),
        ahpWeight,
        fuzzyAhpWeight,
      },
    ];
  });
}

function deriveDataStatus(
  evaluation: GatewayEvaluationSummary | null,
  ranking: GatewayRankingComparisonResponse | null,
  allSourcesUnavailable: boolean,
): AhpFuzzyAhpDataStatus {
  const sampleStatus = evaluation?.ahp_fuzzy_ahp_sample_status;
  const status = stringFromRecord(sampleStatus, ["status"]);
  const isSample = booleanFromRecord(sampleStatus, ["is_sample"]);

  if (status === "final_available" || (ranking?.items.length && ranking.is_sample === false)) {
    return "final";
  }

  if (ranking?.is_sample || isSample || status === "sample_development_only") {
    return "sample";
  }

  if (allSourcesUnavailable) {
    return "unavailable";
  }

  return "pending";
}

function buildNotice(dataStatus: AhpFuzzyAhpDataStatus): AhpFuzzyAhpNotice {
  if (dataStatus === "final") {
    return {
      tone: "final",
      text: "Data AHP dan Fuzzy AHP menggunakan hasil expert judgement final yang tersedia.",
    };
  }

  if (dataStatus === "unavailable") {
    return {
      tone: "info",
      text: "Data AHP dan Fuzzy AHP belum tersedia karena API Gateway belum aktif.",
    };
  }

  if (dataStatus === "pending") {
    return {
      tone: "info",
      text: "Data AHP dan Fuzzy AHP belum lengkap. Hasil final akan diperbarui setelah seluruh expert judgement terkumpul.",
    };
  }

  return {
    tone: "sample",
    text: "Data AHP dan Fuzzy AHP masih menggunakan data sample. Hasil final akan diperbarui setelah seluruh expert judgement terkumpul.",
  };
}

function statusLabel(dataStatus: AhpFuzzyAhpDataStatus): string {
  if (dataStatus === "final") {
    return "Final";
  }
  if (dataStatus === "sample") {
    return "Sample";
  }
  if (dataStatus === "unavailable") {
    return DATA_UNAVAILABLE;
  }
  return "Menunggu data";
}

function statusDescription(dataStatus: AhpFuzzyAhpDataStatus): string {
  if (dataStatus === "final") {
    return "Hasil expert judgement final tersedia.";
  }
  if (dataStatus === "sample") {
    return "Belum menjadi hasil akhir penelitian.";
  }
  if (dataStatus === "unavailable") {
    return "Data belum tersedia karena API Gateway belum aktif.";
  }
  return "Menunggu kelengkapan expert judgement.";
}

function sortedByRank(
  items: readonly GatewayRankingComparisonItem[],
  rankKey: "ahp_rank" | "fuzzy_ahp_rank",
): GatewayRankingComparisonItem[] {
  return [...items].sort((first, second) => {
    const firstRank = finiteNumber(first[rankKey]) ?? 9999;
    const secondRank = finiteNumber(second[rankKey]) ?? 9999;
    return firstRank - secondRank;
  });
}

function sortedPriorityItems(
  items: readonly GatewayRankingComparisonItem[] | undefined,
): GatewayRankingComparisonItem[] {
  return [...(items ?? [])].sort((first, second) => {
    const firstRank =
      finiteNumber(first.final_rank ?? first.ahp_rank ?? first.fuzzy_ahp_rank) ?? 9999;
    const secondRank =
      finiteNumber(second.final_rank ?? second.ahp_rank ?? second.fuzzy_ahp_rank) ?? 9999;
    return firstRank - secondRank;
  });
}

function topRankingItem(
  items: readonly GatewayRankingComparisonItem[],
  rankKey: "ahp_rank" | "fuzzy_ahp_rank",
): GatewayRankingComparisonItem | null {
  return sortedByRank(
    items.filter((item) => finiteNumber(item[rankKey]) !== null),
    rankKey,
  )[0] ?? null;
}

function rankMovement(
  ahpRank: number | null | undefined,
  fuzzyRank: number | null | undefined,
): { label: string; interpretation: string } {
  const ahp = finiteNumber(ahpRank);
  const fuzzy = finiteNumber(fuzzyRank);

  if (ahp === null || fuzzy === null) {
    return {
      label: DATA_UNAVAILABLE,
      interpretation: "Perlu ditinjau setelah data expert final tersedia",
    };
  }

  const delta = fuzzy - ahp;

  if (delta === 0) {
    return {
      label: "Stabil",
      interpretation: "Stabil pada kedua metode",
    };
  }

  if (delta < 0) {
    return {
      label: `Naik ${formatCount(Math.abs(delta))} tingkat`,
      interpretation: "Naik pada Fuzzy AHP",
    };
  }

  return {
    label: `Turun ${formatCount(delta)} tingkat`,
    interpretation: "Turun pada Fuzzy AHP",
  };
}

function weightStatus(
  rank: number | null | undefined,
  dataStatus: AhpFuzzyAhpDataStatus,
): string {
  if (finiteNumber(rank) === null) {
    return DATA_UNAVAILABLE;
  }
  if (dataStatus === "sample") {
    return "Bobot sample";
  }
  return rank === 1 ? "Bobot tertinggi" : "Bobot tersedia";
}

function priorityLabel(rank: number | null): string {
  if (rank === null) {
    return DATA_UNAVAILABLE;
  }
  if (rank === 1) {
    return "Prioritas utama";
  }
  if (rank === 2) {
    return "Prioritas tinggi";
  }
  if (rank === 3) {
    return "Prioritas menengah";
  }
  return "Prioritas lanjutan";
}

function descriptionForCriterion(name: string): string {
  return (
    metaForCriterion(name)?.description ??
    "Deskripsi kriteria akan diperbarui setelah data final tersedia."
  );
}

function recommendationForCriterion(name: string): string {
  return (
    metaForCriterion(name)?.recommendation ??
    "Rekomendasi akan diperbarui setelah data final tersedia."
  );
}

function metaForCriterion(name: string): CriterionDisplayMeta | null {
  const normalizedName = normalizeCriterion(name);
  return (
    CRITERION_DISPLAY_META.find((meta) =>
      meta.matchers.some((matcher) => normalizedName === normalizeCriterion(matcher)),
    ) ??
    CRITERION_DISPLAY_META.find((meta) =>
      meta.matchers.some((matcher) => normalizedName.includes(normalizeCriterion(matcher))),
    ) ??
    null
  );
}

function normalizeCriterion(value: string): string {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function shortCriterionLabel(label: string, index: number): string {
  const words = label
    .replace(/[,&/]/g, " ")
    .split(/\s+/)
    .filter(Boolean);

  if (words.length <= 2) {
    return label;
  }

  return `${words.slice(0, 2).join(" ")} ${index + 1}`;
}

function valueFromRecord(
  record: Record<string, unknown> | undefined,
  keys: readonly string[],
): unknown {
  if (!record) {
    return undefined;
  }

  const normalizedEntries = Object.fromEntries(
    Object.entries(record).map(([key, value]) => [normalizeRecordKey(key), value]),
  );

  for (const key of keys) {
    const value = normalizedEntries[normalizeRecordKey(key)];
    if (value !== null && typeof value !== "undefined" && value !== "") {
      return value;
    }
  }

  return undefined;
}

function stringFromRecord(
  record: Record<string, unknown> | undefined,
  keys: readonly string[],
): string | null {
  const value = valueFromRecord(record, keys);
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function booleanFromRecord(
  record: Record<string, unknown> | undefined,
  keys: readonly string[],
): boolean {
  const value = valueFromRecord(record, keys);
  if (typeof value === "boolean") {
    return value;
  }
  if (typeof value === "string") {
    return ["true", "1", "yes", "y"].includes(value.toLowerCase());
  }
  return false;
}

function normalizeRecordKey(value: string): string {
  return value.trim().toLowerCase().replace(/[\s-]+/g, "_");
}

function finiteNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function formatOptionalCount(value: unknown): string {
  if (typeof value === "number" && Number.isFinite(value)) {
    return formatCount(value);
  }
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? formatCount(parsed) : value.trim();
  }
  return DATA_UNAVAILABLE;
}

function formatCount(value: number | null | undefined): string {
  return value === null || typeof value === "undefined"
    ? DATA_UNAVAILABLE
    : COUNT_FORMATTER.format(value);
}

function formatRank(value: number | null | undefined): string {
  return formatCount(finiteNumber(value));
}

function formatWeight(value: number | null | undefined): string {
  return finiteNumber(value) === null
    ? DATA_UNAVAILABLE
    : WEIGHT_FORMATTER.format(Number(value));
}

function formatWeightPercent(value: number | null | undefined): string {
  const numberValue = finiteNumber(value);
  return numberValue === null
    ? DATA_UNAVAILABLE
    : `${PERCENT_FORMATTER.format(numberValue * 100)}%`;
}

function textOrUnavailable(value: unknown): string {
  return typeof value === "string" && value.trim()
    ? value.trim()
    : DATA_UNAVAILABLE;
}
