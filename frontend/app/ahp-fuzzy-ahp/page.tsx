"use client";

import { useMemo, useState } from "react";
import { ConsistencyBadge } from "@/components/badges/ConsistencyBadge";
import { ChartCard } from "@/components/cards/ChartCard";
import { RankingCard } from "@/components/cards/RankingCard";
import type { RankingCardItem } from "@/components/cards/RankingCard";
import { RecommendationCard } from "@/components/cards/RecommendationCard";
import { StatCard } from "@/components/cards/StatCard";
import { SummaryCard } from "@/components/cards/SummaryCard";
import { AhpRankingComparisonChart } from "@/components/charts/AhpRankingComparisonChart";
import type { AhpRankingComparisonDatum } from "@/components/charts/AhpRankingComparisonChart";
import { CriteriaEditor } from "@/components/forms/CriteriaEditor";
import { PairwiseComparisonInput } from "@/components/forms/PairwiseComparisonInput";
import { AppShell, PageHeader } from "@/components/layout";
import { MatrixTable } from "@/components/tables/MatrixTable";
import { SimpleTable } from "@/components/tables/SimpleTable";
import {
  buildAhpDemoPayload,
  buildFuzzyAhpDemoPayload,
  AHP_DEMO_LABELS,
} from "@/lib/ahp-demo-payload";
import {
  mockAhpCriteria,
  mockAhpResult,
  mockFuzzyAhpResult,
} from "@/lib/mock-data";
import {
  calculateAhp,
  compareAhpFuzzy,
  getAhpCriteria,
} from "@/services/ahp-service";
import { calculateFuzzyAhp } from "@/services/fuzzy-ahp-service";
import type {
  ApiResponse,
  BackendAhpCalculateResponse,
  BackendAhpComparisonResponse,
  BackendAhpCriterion,
  BackendAhpCriterionWeight,
  BackendFuzzyAhpCalculateResponse,
  BackendFuzzyAhpCriterionWeight,
  BackendFuzzyTriangularNumber,
} from "@/types";
import type { FuzzyTriangularNumber as UiFuzzyTriangularNumber } from "@/types/fuzzy-ahp";

const CONSISTENCY_THRESHOLD = 0.1;
const SAMPLE_DEVELOPMENT_WARNING =
  "Hasil ini menggunakan sample development judgement dan belum merupakan hasil final expert judgement.";

type DemoStatus =
  | "idle"
  | "checking_backend"
  | "loading_criteria"
  | "calculating"
  | "success"
  | "error";

interface AhpDemoResult {
  criteria: BackendAhpCriterion[];
  ahp: BackendAhpCalculateResponse;
  fuzzyAhp: BackendFuzzyAhpCalculateResponse;
  comparison: BackendAhpComparisonResponse;
}

interface NumberMatrixRow {
  criterionId: string;
  criterionName: string;
  values: readonly number[];
}

interface FuzzyMatrixRow {
  criterionId: string;
  criterionName: string;
  values: readonly BackendFuzzyTriangularNumber[];
}

const demoStatusLabel: Record<DemoStatus, string> = {
  idle: "Belum dijalankan",
  checking_backend: "Memeriksa backend",
  loading_criteria: "Memuat kriteria",
  calculating: "Menghitung di backend",
  success: "Backend aktif",
  error: "Backend offline",
};

function formatWeight(value: number) {
  return `${Math.round(value * 100)}%`;
}

function formatSignedWeight(value: number) {
  const prefix = value > 0 ? "+" : "";

  return `${prefix}${formatWeight(value)}`;
}

function formatDecimal(value: number) {
  return new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 3,
  }).format(value);
}

function isAvailableNumber(value: number | null | undefined): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function formatCrPercentage(value: number | null | undefined) {
  if (!isAvailableNumber(value)) {
    return "Tidak tersedia";
  }

  return `${(value * 100).toFixed(2)}%`;
}

function formatRawCr(value: number | null | undefined) {
  if (!isAvailableNumber(value)) {
    return "Tidak tersedia";
  }

  return value.toFixed(4);
}

function getConsistencyStatus(value: number | null | undefined) {
  if (!isAvailableNumber(value)) {
    return "Tidak tersedia";
  }

  return value <= CONSISTENCY_THRESHOLD ? "Konsisten" : "Tidak konsisten";
}

function getConsistencyTone(value: number | null | undefined) {
  if (!isAvailableNumber(value)) {
    return "neutral" as const;
  }

  return value <= CONSISTENCY_THRESHOLD ? "primary" : "negative";
}

function formatConsistencySummary(value: number | null | undefined) {
  if (!isAvailableNumber(value)) {
    return "Tidak tersedia";
  }

  return `${formatCrPercentage(value)} (raw ${formatRawCr(value)}, ${getConsistencyStatus(value)})`;
}

function ConsistencyRatioValue({
  value,
}: {
  value: number | null | undefined;
}) {
  return (
    <div className="space-y-1">
      <span className="block text-2xl font-semibold tracking-normal text-foreground">
        {formatCrPercentage(value)}
      </span>
      <span className="block text-xs font-medium leading-5 text-muted-foreground">
        Raw CR: {formatRawCr(value)}
      </span>
      <span className="block text-xs font-medium leading-5 text-muted-foreground">
        Status: {getConsistencyStatus(value)}
      </span>
      <span className="block text-xs font-medium leading-5 text-muted-foreground">
        Threshold konsistensi: CR ≤ 10%
      </span>
    </div>
  );
}

function formatUiTfn(value: UiFuzzyTriangularNumber) {
  return `(${formatDecimal(value.lower)}, ${formatDecimal(value.middle)}, ${formatDecimal(value.upper)})`;
}

function formatBackendTfn(value: BackendFuzzyTriangularNumber) {
  return `(${formatDecimal(value.l)}, ${formatDecimal(value.m)}, ${formatDecimal(value.u)})`;
}

function getShortLabel(label: string) {
  return label.split(" ").slice(0, 2).join(" ");
}

function getResponseErrorMessage<TData>(
  response: ApiResponse<TData>,
  fallback: string,
) {
  if (response.error?.message) {
    return response.error.message;
  }

  if (response.message) {
    return response.message;
  }

  return fallback;
}

function toAhpRankingItems(
  weights: readonly BackendAhpCriterionWeight[],
): RankingCardItem[] {
  return [...weights]
    .sort((first, second) => first.rank - second.rank)
    .map((item) => ({
      description: `Bobot backend sample: ${formatDecimal(item.weight)}`,
      id: item.criterion_id,
      label: item.criterion_name,
      rank: item.rank,
      score: formatWeight(item.weight),
    }));
}

function toFuzzyRankingItems(
  weights: readonly BackendFuzzyAhpCriterionWeight[],
): RankingCardItem[] {
  return [...weights]
    .sort((first, second) => first.rank - second.rank)
    .map((item) => ({
      description: `Bobot fuzzy ternormalisasi: ${formatDecimal(item.normalized_weight)}`,
      id: item.criterion_id,
      label: item.criterion_name,
      rank: item.rank,
      score: formatWeight(item.normalized_weight),
    }));
}

function NumberMatrixTable({
  criteria,
  matrix,
}: {
  criteria: readonly BackendAhpCriterion[];
  matrix: readonly (readonly number[])[];
}) {
  const rows = criteria.map((criterion, index) => ({
    criterionId: criterion.id,
    criterionName: criterion.name,
    values: matrix[index] ?? [],
  })) satisfies NumberMatrixRow[];

  const columns = [
    {
      key: "criterion",
      header: "Kriteria",
      render: (row: NumberMatrixRow) => (
        <span className="font-medium text-foreground">{row.criterionId}</span>
      ),
    },
    ...criteria.map((criterion, index) => ({
      align: "right" as const,
      key: criterion.id,
      header: criterion.id,
      render: (row: NumberMatrixRow) => formatDecimal(row.values[index] ?? 0),
    })),
  ];

  return (
    <SimpleTable
      columns={columns}
      data={rows}
      minWidthClassName="min-w-[760px]"
      rowKey={(row) => row.criterionId}
    />
  );
}

function FuzzyMatrixTable({
  criteria,
  matrix,
}: {
  criteria: readonly BackendAhpCriterion[];
  matrix: readonly (readonly BackendFuzzyTriangularNumber[])[];
}) {
  const rows = criteria.map((criterion, index) => ({
    criterionId: criterion.id,
    criterionName: criterion.name,
    values: matrix[index] ?? [],
  })) satisfies FuzzyMatrixRow[];

  const columns = [
    {
      key: "criterion",
      header: "Kriteria",
      render: (row: FuzzyMatrixRow) => (
        <span className="font-medium text-foreground">{row.criterionId}</span>
      ),
    },
    ...criteria.map((criterion, index) => ({
      key: criterion.id,
      header: criterion.id,
      render: (row: FuzzyMatrixRow) => {
        const value = row.values[index];

        return value ? formatBackendTfn(value) : "-";
      },
    })),
  ];

  return (
    <SimpleTable
      columns={columns}
      data={rows}
      minWidthClassName="min-w-[980px]"
      rowKey={(row) => row.criterionId}
    />
  );
}

function DemoLabelBadges() {
  return (
    <div className="flex flex-wrap gap-2">
      {AHP_DEMO_LABELS.map((label) => (
        <span
          className="rounded-md border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700"
          key={label}
        >
          {label}
        </span>
      ))}
    </div>
  );
}

function AhpApiDemoSection({
  errorMessage,
  onRunDemo,
  result,
  status,
}: {
  errorMessage: string | null;
  onRunDemo: () => Promise<void>;
  result: AhpDemoResult | null;
  status: DemoStatus;
}) {
  const isBusy =
    status === "checking_backend" ||
    status === "loading_criteria" ||
    status === "calculating";

  return (
    <ChartCard
      actions={
        <button
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isBusy}
          onClick={() => {
            void onRunDemo();
          }}
          type="button"
        >
          {isBusy ? "Memproses..." : "Jalankan Demo API AHP/Fuzzy AHP"}
        </button>
      }
      description="Mode ini memanggil endpoint FastAPI sample/development. Perhitungan tetap dilakukan backend, bukan frontend."
      insight={SAMPLE_DEVELOPMENT_WARNING}
      title="Demo Integrasi API AHP/Fuzzy AHP"
    >
      <div className="grid gap-4 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)]">
        <div className="rounded-md border border-border bg-background px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-normal text-muted-foreground">
            Status
          </p>
          <p className="mt-1 text-sm font-semibold text-foreground">
            {demoStatusLabel[status]}
          </p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {status === "idle"
              ? "Klik tombol demo untuk memeriksa backend, memuat kriteria, lalu menjalankan AHP, Fuzzy AHP, dan perbandingan ranking."
              : status === "success"
                ? "Backend aktif. Hasil sample backend ditampilkan sebagai output utama."
                : status === "error"
                  ? "Backend offline. Mode Mock/Fallback ditampilkan agar halaman tetap dapat didemokan."
                  : "Request demo API sedang diproses oleh backend."}
          </p>
        </div>

        <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-normal text-amber-700">
            Label demo wajib
          </p>
          <div className="mt-3">
            <DemoLabelBadges />
          </div>
          <p className="mt-3 text-sm leading-6 text-amber-800">
            {SAMPLE_DEVELOPMENT_WARNING}
          </p>
        </div>
      </div>

      {errorMessage ? (
        <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">
          <p className="font-semibold">
            Backend API belum aktif. Jalankan ml-service terlebih dahulu.
          </p>
          <p className="mt-1">{errorMessage}</p>
        </div>
      ) : null}

      {status === "success" && result ? (
        <div className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-800">
          Demo API berhasil. Hasil backend sample ditampilkan sebagai output
          utama. Mock data tetap tersedia secara internal sebagai fallback,
          tetapi tidak ditampilkan bersama hasil backend agar output tidak
          duplikatif.
        </div>
      ) : null}
    </ChartCard>
  );
}

function InitialPreviewSection() {
  return (
    <section className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
      <SummaryCard
        description="Halaman ini menyiapkan demo integrasi API AHP/Fuzzy AHP. Klik tombol demo untuk mengambil kriteria dan hasil perhitungan sample dari backend."
        items={[
          {
            description: "Perhitungan dilakukan backend melalui endpoint `/ahp/calculate`.",
            label: "AHP",
            value: "Backend calculation",
          },
          {
            description:
              "Perhitungan dilakukan backend melalui endpoint `/ahp/fuzzy-calculate`.",
            label: "Fuzzy AHP",
            value: "Backend calculation",
          },
          {
            description: "Demo API belum dipanggil pada sesi halaman ini.",
            label: "Status",
            value: "Belum dijalankan",
          },
          {
            description: SAMPLE_DEVELOPMENT_WARNING,
            label: "Batasan hasil",
            value: "Sample development",
          },
        ]}
        title="Ringkasan Metode"
      />

      <SummaryCard
        description="Preview ini hanya memastikan halaman tetap terbaca sebelum backend dipanggil. Detail mock tidak ditampilkan pada mode awal agar tidak terlihat sebagai output utama."
        items={[
          {
            description:
              "Kriteria mock tetap tersedia internal untuk fallback jika backend offline.",
            label: "Fallback internal",
            value: `${mockAhpCriteria.length} kriteria mock`,
          },
          {
            description:
              "Payload demo akan memakai judgement sample development yang sudah dilabeli bukan final expert judgement.",
            label: "Judgement",
            value: "Sample development",
          },
          {
            description:
              "Jalankan demo API untuk melihat hasil backend sebagai output utama.",
            label: "Aksi berikutnya",
            value: "Jalankan Demo API",
          },
          {
            description: "Label wajib tetap ditampilkan pada hasil demo API.",
            label: "Label",
            value: "sample_development_only",
          },
        ]}
        title="Pratinjau Ringkas"
      />
    </section>
  );
}

function BackendResultSection({ result }: { result: AhpDemoResult }) {
  const ahpRankingItems = toAhpRankingItems(result.ahp.weights);
  const fuzzyRankingItems = toFuzzyRankingItems(result.fuzzyAhp.weights);
  const topAhpRank = result.ahp.weights.find((item) => item.rank === 1);
  const topFuzzyRank = result.fuzzyAhp.weights.find((item) => item.rank === 1);
  const comparisonData = result.comparison.items.map((item) => ({
    ahpWeight: Math.round(item.ahp_weight * 100),
    criterionId: item.criterion_id,
    fuzzyAhpWeight: Math.round(item.fuzzy_ahp_weight * 100),
    label: item.criterion_name,
    shortLabel: getShortLabel(item.criterion_name),
  })) satisfies AhpRankingComparisonDatum[];

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 rounded-lg border border-blue-100 bg-blue-50 p-5 shadow-sm">
        <div>
          <p className="text-xs font-semibold uppercase tracking-normal text-blue-700">
            Hasil backend sample
          </p>
          <h3 className="mt-1 text-lg font-semibold text-blue-950">
            Hasil Backend Sample
          </h3>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-blue-900">
            Data di bawah berasal dari endpoint FastAPI `/ahp`. Frontend hanya
            mengirim payload sample dan menampilkan response backend.
            {` ${SAMPLE_DEVELOPMENT_WARNING}`}
          </p>
        </div>
        <DemoLabelBadges />
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard
          description="Jumlah kriteria dari response backend."
          label="Kriteria Backend"
          tone="primary"
          value={result.ahp.criteria_count}
        />
        <StatCard
          description="Nilai dari response `/ahp/calculate`."
          label="Consistency Ratio AHP"
          tone={getConsistencyTone(result.ahp.consistency_ratio)}
          value={
            <ConsistencyRatioValue value={result.ahp.consistency_ratio} />
          }
        />
        <StatCard
          description="Nilai modal dari response `/ahp/fuzzy-calculate`."
          label="CR Modal Fuzzy AHP"
          tone={getConsistencyTone(result.fuzzyAhp.consistency_ratio_modal)}
          value={
            <ConsistencyRatioValue
              value={result.fuzzyAhp.consistency_ratio_modal}
            />
          }
        />
        <StatCard
          description="Prioritas tertinggi hasil backend AHP."
          label="Prioritas AHP"
          tone="primary"
          value={topAhpRank?.criterion_name ?? "Belum tersedia"}
        />
        <StatCard
          description="Prioritas tertinggi hasil backend Fuzzy AHP."
          label="Prioritas Fuzzy AHP"
          tone="primary"
          value={topFuzzyRank?.criterion_name ?? "Belum tersedia"}
        />
      </section>

      <SummaryCard
        description="Metadata response backend dan label keamanan demo."
        items={[
          {
            description: "Run label dikirim frontend pada semua payload demo.",
            label: "Run label",
            value: result.ahp.run_label,
          },
          {
            description: "Metode Fuzzy AHP yang diterima backend saat ini.",
            label: "Defuzzification",
            value: result.fuzzyAhp.defuzzification_method,
          },
          {
            description: "Jumlah ranking yang dibandingkan backend.",
            label: "Total kriteria comparison",
            value: result.comparison.summary.total_criteria,
          },
          {
            description: "Apakah ranking pertama AHP dan Fuzzy AHP sama.",
            label: "Top rank identik",
            value: result.comparison.summary.identical_top_rank ? "Ya" : "Tidak",
          },
        ]}
        title="Ringkasan Response API"
      />

      <ChartCard
        description="Daftar kriteria berasal dari endpoint `/ahp/criteria`."
        title="Kriteria Backend"
      >
        <SimpleTable
          columns={[
            {
              key: "id",
              header: "ID",
              render: (row) => (
                <span className="font-medium text-foreground">{row.id}</span>
              ),
            },
            {
              key: "name",
              header: "Nama kriteria",
              render: (row) => row.name,
            },
            {
              key: "description",
              header: "Deskripsi",
              render: (row) => row.description ?? "-",
            },
          ]}
          data={result.criteria}
          minWidthClassName="min-w-[860px]"
          rowKey={(row) => row.id}
        />
      </ChartCard>

      <section className="grid gap-6 xl:grid-cols-2">
        <ChartCard
          description="Matriks ini berasal dari response backend `/ahp/calculate`."
          title="Matriks Pairwise AHP Backend"
        >
          <NumberMatrixTable
            criteria={result.criteria}
            matrix={result.ahp.pairwise_matrix}
          />
        </ChartCard>

        <ChartCard
          description="Matriks modal crisp berasal dari response backend `/ahp/fuzzy-calculate`."
          title="Matriks Modal Crisp Fuzzy AHP"
        >
          <NumberMatrixTable
            criteria={result.criteria}
            matrix={result.fuzzyAhp.modal_crisp_matrix}
          />
        </ChartCard>
      </section>

      <ChartCard
        description="Matriks fuzzy ditampilkan sebagai TFN `(l, m, u)` dari response backend."
        title="Matriks Fuzzy AHP Backend"
      >
        <FuzzyMatrixTable
          criteria={result.criteria}
          matrix={result.fuzzyAhp.fuzzy_pairwise_matrix}
        />
      </ChartCard>

      <section className="grid gap-6 xl:grid-cols-2">
        <RankingCard
          description="Bobot AHP berasal dari service backend."
          items={ahpRankingItems}
          title="Hasil Bobot AHP Backend"
        />

        <RankingCard
          description="Bobot Fuzzy AHP berasal dari service backend."
          items={fuzzyRankingItems}
          title="Hasil Bobot Fuzzy AHP Backend"
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <ChartCard
          description="Perbandingan bobot dari endpoint `/ahp/compare`."
          title="Perbandingan Ranking Backend"
        >
          <AhpRankingComparisonChart data={comparisonData} />
        </ChartCard>

        <ChartCard
          description="Delta bobot dan ranking dihitung oleh backend comparison service."
          title="Detail Perbandingan Backend"
        >
          <SimpleTable
            columns={[
              {
                className: "max-w-[280px]",
                key: "criterion",
                header: "Kriteria",
                render: (row) => (
                  <span className="font-medium text-foreground">
                    {row.criterion_name}
                  </span>
                ),
              },
              {
                align: "right",
                key: "ahp",
                header: "AHP",
                render: (row) => formatWeight(row.ahp_weight),
              },
              {
                align: "right",
                key: "fuzzy",
                header: "Fuzzy AHP",
                render: (row) => formatWeight(row.fuzzy_ahp_weight),
              },
              {
                align: "right",
                key: "delta",
                header: "Delta",
                render: (row) => formatSignedWeight(row.weight_delta),
              },
              {
                align: "right",
                key: "rankDelta",
                header: "Delta rank",
                render: (row) => row.rank_delta,
              },
            ]}
            data={result.comparison.items}
            minWidthClassName="min-w-[760px]"
            rowKey={(row) => row.criterion_id}
          />
        </ChartCard>
      </section>

      <RecommendationCard
        basis={[
          `Prioritas AHP backend: ${topAhpRank?.criterion_name ?? "belum tersedia"} (${topAhpRank ? formatWeight(topAhpRank.weight) : "-"})`,
          `Prioritas Fuzzy AHP backend: ${topFuzzyRank?.criterion_name ?? "belum tersedia"} (${topFuzzyRank ? formatWeight(topFuzzyRank.normalized_weight) : "-"})`,
          `Consistency Ratio AHP: ${formatConsistencySummary(result.ahp.consistency_ratio)}`,
          `Consistency Ratio modal Fuzzy AHP: ${formatConsistencySummary(result.fuzzyAhp.consistency_ratio_modal)}`,
        ]}
        note={SAMPLE_DEVELOPMENT_WARNING}
        recommendation={
          <p>
            Berdasarkan response backend sample,{" "}
            <span className="font-semibold">
              {topAhpRank?.criterion_name ?? "prioritas belum tersedia"}
            </span>{" "}
            menjadi prioritas tertinggi AHP demo. Gunakan hanya untuk validasi
            integrasi API dan alur demo skripsi.
          </p>
        }
        title="Ringkasan Rekomendasi Demo API"
      />

      {result.ahp.warnings.length || result.fuzzyAhp.warnings.length ? (
        <SummaryCard
          description="Warning ini berasal dari response backend."
          title="Warning Backend"
        >
          <ul className="space-y-2 text-sm leading-6 text-muted-foreground">
            {[...result.ahp.warnings, ...result.fuzzyAhp.warnings].map(
              (warning) => (
                <li
                  className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-amber-800"
                  key={warning}
                >
                  {warning}
                </li>
              ),
            )}
          </ul>
        </SummaryCard>
      ) : null}
    </section>
  );
}

export default function AhpFuzzyAhpPrototypePage() {
  const [status, setStatus] = useState<DemoStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [demoResult, setDemoResult] = useState<AhpDemoResult | null>(null);

  const priorityComparisonData = useMemo(
    () =>
      mockAhpResult.ranking.map((ahpItem) => {
        const fuzzyItem = mockFuzzyAhpResult.ranking.find(
          (item) => item.criterionId === ahpItem.criterionId,
        );

        return {
          criterionId: ahpItem.criterionId,
          label: ahpItem.label,
          shortLabel: getShortLabel(ahpItem.label),
          ahpWeight: Math.round(ahpItem.weight * 100),
          fuzzyAhpWeight: Math.round((fuzzyItem?.normalizedWeight ?? 0) * 100),
        };
      }) satisfies AhpRankingComparisonDatum[],
    [],
  );

  const ahpRankingItems = useMemo(
    () =>
      mockAhpResult.ranking.map((item) => ({
        description: item.interpretation,
        id: item.criterionId,
        label: item.label,
        rank: item.rank,
        score: formatWeight(item.weight),
      })) satisfies RankingCardItem[],
    [],
  );

  const fuzzyRankingItems = useMemo(
    () =>
      mockFuzzyAhpResult.ranking.map((item) => ({
        description: item.interpretation,
        id: item.criterionId,
        label: item.label,
        rank: item.rank,
        score: formatWeight(item.normalizedWeight),
      })) satisfies RankingCardItem[],
    [],
  );

  const topAhpRank = mockAhpResult.ranking[0];
  const topFuzzyRank = mockFuzzyAhpResult.ranking[0];

  async function handleRunDemo() {
    setStatus("checking_backend");
    setErrorMessage(null);
    setDemoResult(null);

    try {
      setStatus("loading_criteria");
      const criteriaResponse = await getAhpCriteria();

      if (!criteriaResponse.success || !criteriaResponse.data?.length) {
        throw new Error(
          getResponseErrorMessage(
            criteriaResponse,
            "Backend belum mengembalikan kriteria AHP.",
          ),
        );
      }

      const ahpPayload = buildAhpDemoPayload(criteriaResponse.data);
      const fuzzyPayload = buildFuzzyAhpDemoPayload(criteriaResponse.data);

      setStatus("calculating");
      const [ahpResponse, fuzzyResponse] = await Promise.all([
        calculateAhp(ahpPayload),
        calculateFuzzyAhp(fuzzyPayload),
      ]);

      if (!ahpResponse.success || !ahpResponse.data) {
        throw new Error(
          getResponseErrorMessage(
            ahpResponse,
            "Backend gagal menghitung AHP sample development.",
          ),
        );
      }

      if (!fuzzyResponse.success || !fuzzyResponse.data) {
        throw new Error(
          getResponseErrorMessage(
            fuzzyResponse,
            "Backend gagal menghitung Fuzzy AHP sample development.",
          ),
        );
      }

      const comparisonResponse = await compareAhpFuzzy({
        ahp_weights: ahpResponse.data.weights,
        fuzzy_ahp_weights: fuzzyResponse.data.weights,
        run_label: ahpPayload.run_label,
      });

      if (!comparisonResponse.success || !comparisonResponse.data) {
        throw new Error(
          getResponseErrorMessage(
            comparisonResponse,
            "Backend gagal membandingkan ranking AHP dan Fuzzy AHP.",
          ),
        );
      }

      setDemoResult({
        ahp: ahpResponse.data,
        comparison: comparisonResponse.data,
        criteria: criteriaResponse.data,
        fuzzyAhp: fuzzyResponse.data,
      });
      setStatus("success");
    } catch (error) {
      setStatus("error");
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Backend AHP tidak dapat dihubungi. Prototype mock tetap tersedia sebagai fallback.",
      );
    }
  }

  return (
    <AppShell>
      <PageHeader
        actions={
          <button
            className="inline-flex items-center justify-center rounded-md border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground shadow-sm transition hover:bg-slate-50"
            onClick={() => {
              void handleRunDemo();
            }}
            type="button"
          >
            Jalankan Demo API
          </button>
        }
        description="Prototype frontend untuk menampilkan kriteria, expert judgement, matriks pairwise, Consistency Ratio, bobot AHP, bobot Fuzzy AHP, dan ringkasan rekomendasi. FE-13 menambahkan demo API backend sample tanpa menghitung metode di frontend."
        eyebrow="Prototype metode"
        title="AHP / Fuzzy AHP"
      />

      <AhpApiDemoSection
        errorMessage={errorMessage}
        onRunDemo={handleRunDemo}
        result={demoResult}
        status={status}
      />

      {status === "success" && demoResult ? (
        <BackendResultSection result={demoResult} />
      ) : null}

      {status !== "success" && status !== "error" ? (
        <InitialPreviewSection />
      ) : null}

      {status === "error" ? (
        <section className="space-y-6">
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-normal text-amber-700">
              Fallback frontend
            </p>
            <h3 className="mt-1 text-lg font-semibold text-amber-950">
              Mode Mock/Fallback
            </h3>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-amber-800">
              Backend API belum aktif. Nilai di bawah berasal dari data mock
              frontend agar halaman tetap demo-visible, bukan hasil backend dan
              bukan hasil final expert judgement.
            </p>
          </div>

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
            <StatCard
              description="Jumlah berasal dari kriteria mock dan tetap data-driven."
              label="Kriteria"
              tone="primary"
              value={mockAhpCriteria.length}
            />
            <StatCard
              description="Jumlah judgement mock untuk matriks AHP."
              label="Pairwise"
              value={mockAhpResult.pairwiseComparisons.length}
            />
            <StatCard
              description="Nilai mock, bukan hasil kalkulasi frontend."
              label="Consistency Ratio"
              tone={getConsistencyTone(mockAhpResult.consistencyRatio)}
              value={
                <ConsistencyRatioValue
                  value={mockAhpResult.consistencyRatio}
                />
              }
            />
            <StatCard
              description="Prioritas tertinggi dari ranking AHP mock."
              label="Prioritas AHP"
              tone="primary"
              value={topAhpRank?.label ?? "Belum tersedia"}
            />
            <StatCard
              description="Prioritas tertinggi dari ranking Fuzzy AHP mock."
              label="Prioritas Fuzzy AHP"
              tone="primary"
              value={topFuzzyRank?.label ?? "Belum tersedia"}
            />
            <StatCard
              description="Formula final dan mapping TFN belum dikunci."
              label="Status"
              value="Prototype mock"
            />
          </section>

      <SummaryCard
        description="Halaman ini mempertahankan prototype mock sebagai fallback. Nilai mock bukan hasil penelitian final."
        items={[
          {
            label: "AHP",
            value: mockAhpResult.methodVersion,
            description: mockAhpResult.methodNote,
          },
          {
            label: "Fuzzy AHP",
            value: mockFuzzyAhpResult.methodVersion,
            description: mockFuzzyAhpResult.methodNote,
          },
          {
            label: "TFN",
            value: `${mockFuzzyAhpResult.scaleOptions.length} opsi skala mock`,
            description: "Mapping TFN final tetap menjadi bagian metodologi/backend.",
          },
          {
            label: "Integrasi API",
            value: "Demo backend FE-13 tersedia",
            description: "Klik tombol demo untuk memanggil endpoint FastAPI sample development.",
          },
        ]}
        title="Ringkasan Metode Mock/Fallback"
      />

      <section className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <ChartCard
          description="Daftar kriteria berasal dari data mock AHP dan tidak mengunci jumlah final kriteria."
          title="Pratinjau Setup Kriteria Mock"
        >
          <CriteriaEditor criteria={mockAhpCriteria} />
        </ChartCard>

        <ChartCard
          description="Pratinjau expert judgement menampilkan nilai pairwise mock tanpa menjalankan perhitungan bobot di frontend."
          title="Pratinjau Expert Judgement / Pairwise Comparison Mock"
        >
          <PairwiseComparisonInput
            comparisons={mockAhpResult.pairwiseComparisons}
            criteria={mockAhpCriteria}
          />
        </ChartCard>
      </section>

      <ChartCard
        description="Matriks dibentuk dari pairwise comparison mock dan nilai resiprokal yang sudah tersedia di data mock."
        insight="Matriks ini bersifat fallback prototype. Frontend hanya memvisualisasikan data, bukan menghitung eigen vector atau bobot AHP."
        title="Matriks Pairwise Comparison AHP Mock"
      >
        <MatrixTable
          comparisons={mockAhpResult.pairwiseComparisons}
          criteria={mockAhpCriteria}
        />
      </ChartCard>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <SummaryCard
          description="Consistency Ratio ditampilkan sebagai status mock untuk membantu menjelaskan validitas judgement pada demo."
          title="Kartu Consistency Ratio Mock"
        >
          <div className="space-y-4">
            <ConsistencyBadge
              ratio={mockAhpResult.consistencyRatio}
              status={mockAhpResult.consistencyStatus}
              threshold={CONSISTENCY_THRESHOLD}
            />
            <p className="text-sm leading-6 text-muted-foreground">
              Nilai ini berasal dari hasil mock. Ambang ditampilkan sebagai
              parameter UI dan tidak melakukan validasi metode di frontend.
              Threshold konsistensi: CR ≤ 10%.
            </p>
          </div>
        </SummaryCard>

        <ChartCard
          description="Opsi skala Fuzzy AHP ditampilkan sebagai preview TFN dan belum mengunci mapping final."
          title="Pratinjau Skala TFN Fuzzy AHP Mock"
        >
          <SimpleTable
            columns={[
              {
                key: "label",
                header: "Skala",
                render: (row) => (
                  <span className="font-medium text-foreground">
                    {row.label}
                  </span>
                ),
              },
              {
                key: "tfn",
                header: "TFN",
                render: (row) => formatUiTfn(row.value),
              },
              {
                key: "status",
                header: "Status",
                render: () => (
                  <span className="rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700">
                    Prototype
                  </span>
                ),
              },
            ]}
            data={mockFuzzyAhpResult.scaleOptions}
            minWidthClassName="min-w-[520px]"
            rowKey={(row) => row.id}
          />
        </ChartCard>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <RankingCard
          description="Ranking AHP mock menggunakan bobot yang sudah tersedia di FE-07."
          items={ahpRankingItems}
          title="Hasil Bobot AHP Mock"
        />

        <RankingCard
          description="Ranking Fuzzy AHP mock menampilkan bobot ternormalisasi dan interpretasi prototype."
          items={fuzzyRankingItems}
          title="Hasil Bobot Fuzzy AHP Mock"
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <ChartCard
          description="Perbandingan bobot mock antara AHP dan Fuzzy AHP untuk membantu demo skripsi."
          insight="Grafik ini membandingkan output mock yang sudah tersedia. Frontend tidak melakukan kalkulasi bobot."
          title="Perbandingan Ranking AHP vs Fuzzy AHP Mock"
        >
          <AhpRankingComparisonChart data={priorityComparisonData} />
        </ChartCard>

        <ChartCard
          description="Tabel numerik disediakan agar bobot dapat dibaca jelas tanpa bergantung pada chart."
          title="Detail Bobot AHP dan Fuzzy AHP Mock"
        >
          <SimpleTable
            columns={[
              {
                key: "label",
                header: "Kriteria",
                className: "max-w-[280px]",
                render: (row) => (
                  <span className="font-medium text-foreground">
                    {row.label}
                  </span>
                ),
              },
              {
                key: "ahp",
                header: "AHP",
                align: "right",
                render: (row) => `${row.ahpWeight}%`,
              },
              {
                key: "fuzzy",
                header: "Fuzzy AHP",
                align: "right",
                render: (row) => `${row.fuzzyAhpWeight}%`,
              },
            ]}
            data={priorityComparisonData}
            minWidthClassName="min-w-[520px]"
            rowKey={(row) => row.criterionId}
          />
        </ChartCard>
      </section>

      <RecommendationCard
        basis={[
          `Prioritas AHP tertinggi: ${topAhpRank?.label ?? "belum tersedia"} (${topAhpRank ? formatWeight(topAhpRank.weight) : "-"})`,
          `Prioritas Fuzzy AHP tertinggi: ${topFuzzyRank?.label ?? "belum tersedia"} (${topFuzzyRank ? formatWeight(topFuzzyRank.normalizedWeight) : "-"})`,
          `Consistency Ratio mock: ${formatConsistencySummary(mockAhpResult.consistencyRatio)}`,
          `Jumlah kriteria aktif: ${mockAhpCriteria.filter((criterion) => criterion.isActive).length}`,
        ]}
        note="Rekomendasi ini hanya ringkasan prototype. Nilai final wajib berasal dari backend calculation service dan artefak metodologi yang tervalidasi."
        recommendation={
          <p>
            Berdasarkan output mock,{" "}
            <span className="font-semibold">
              {topAhpRank?.label ?? "prioritas belum tersedia"}
            </span>{" "}
            menjadi kandidat prioritas utama untuk ditinjau saat demo skripsi.
            Interpretasi ini tidak boleh dipakai sebagai kesimpulan final.
          </p>
        }
        title="Ringkasan Rekomendasi Akhir Mock"
      />

      <SummaryCard
        description="Catatan ini sengaja dibuat eksplisit agar prototype tidak disalahpahami sebagai implementasi metodologi final."
        title="Catatan Batasan Metode / Prototype"
      >
        <div className="grid gap-3 md:grid-cols-2">
          {[
            "Frontend tidak menghitung bobot AHP, eigen vector, Consistency Ratio, atau Fuzzy AHP.",
            "Jumlah kriteria, skala expert judgement, dan mapping TFN tetap fleksibel dan data-driven.",
            "Data mock digunakan untuk fallback tata letak, tabel, grafik, dan narasi demo skripsi.",
            "Integrasi FE-13 hanya memanggil backend sample/development dan tetap berlabel bukan hasil final.",
          ].map((note) => (
            <p
              className="rounded-md border border-border bg-background px-4 py-3 text-sm leading-6 text-muted-foreground"
              key={note}
            >
              {note}
            </p>
          ))}
        </div>
      </SummaryCard>
        </section>
      ) : null}
    </AppShell>
  );
}
