"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { ApiGatewayAlert } from "@/components/alerts/ApiGatewayAlert";
import { ChartCard } from "@/components/cards/ChartCard";
import {
  SummaryCard,
  type SummaryCardItem,
} from "@/components/cards/SummaryCard";
import { StatCard } from "@/components/cards/StatCard";
import { AhpRankingComparisonChart } from "@/components/charts/AhpRankingComparisonChart";
import { AppShell, PageHeader } from "@/components/layout";
import {
  SimpleTable,
  type SimpleTableColumn,
} from "@/components/tables/SimpleTable";
import { EMPTY_GATEWAY_MESSAGE } from "@/lib/api-status";
import { cn } from "@/lib/utils";
import {
  getAhpFuzzyAhpOverview,
  type AhpFuzzyAhpNotice,
  type AhpFuzzyAhpSummaryCard,
  type ComparisonRow,
  type MatrixCriterionView,
  type PairwiseMatrixRow,
  type RespondentDetailRow,
  type RespondentSummaryView,
} from "@/services/ahp-overview-service";

const EMPTY_MESSAGE = EMPTY_GATEWAY_MESSAGE;

const comparisonColumns: readonly SimpleTableColumn<ComparisonRow>[] = [
  {
    key: "criterion",
    header: "Kriteria",
    render: (row) => (
      <span className="font-medium text-foreground">{row.criterion}</span>
    ),
  },
  {
    key: "ahpRank",
    header: "Rank AHP",
    align: "center",
    render: (row) => row.ahpRank,
  },
  {
    key: "fuzzyRank",
    header: "Rank Fuzzy AHP",
    align: "center",
    render: (row) => row.fuzzyRank,
  },
  {
    key: "ahpWeight",
    header: "Bobot AHP",
    align: "right",
    render: (row) => row.ahpWeight,
  },
  {
    key: "fuzzyWeight",
    header: "Bobot Fuzzy AHP",
    align: "right",
    render: (row) => row.fuzzyWeight,
  },
  {
    key: "rankChange",
    header: "Perubahan Ranking",
    render: (row) => row.rankChange,
  },
  {
    key: "interpretation",
    header: "Interpretasi",
    className: "min-w-[220px]",
    render: (row) => row.interpretation,
  },
];

const respondentColumns: readonly SimpleTableColumn<RespondentDetailRow>[] = [
  {
    key: "respondent",
    header: "Responden",
    className: "min-w-[140px]",
    render: (row) => (
      <div>
        <div className="font-medium text-foreground">{row.id}</div>
        <div className="mt-1 text-xs text-muted-foreground">
          {row.originalCode}
        </div>
      </div>
    ),
  },
  {
    key: "sourceType",
    header: "Sumber",
    render: (row) => <SourceBadge value={row.sourceType} />,
  },
  {
    key: "roleCategory",
    header: "Kategori Peran",
    className: "min-w-[220px]",
    render: (row) => row.roleCategory,
  },
  {
    key: "profile",
    header: "Profil",
    className: "min-w-[180px]",
    render: (row) => row.profile,
  },
  {
    key: "spotifyUsage",
    header: "Penggunaan Spotify",
    className: "min-w-[180px]",
    render: (row) => row.spotifyUsage,
  },
  {
    key: "topCriterion",
    header: "Kriteria Teratas",
    className: "min-w-[240px]",
    render: (row) => row.topCriterion,
  },
  {
    key: "criteriaAdequacy",
    header: "Kecukupan Kriteria",
    className: "min-w-[170px]",
    render: (row) => row.criteriaAdequacy,
  },
  {
    key: "consistencyRatio",
    header: "CR",
    align: "right",
    render: (row) => row.consistencyRatio,
  },
  {
    key: "consistencyStatus",
    header: "Status",
    render: (row) => <ConsistencyBadge value={row.consistencyStatus} />,
  },
];

export default async function AhpFuzzyAhpPage() {
  const overview = await getAhpFuzzyAhpOverview();
  const matrixColumns = buildMatrixColumns(overview.matrixCriteria);

  return (
    <AppShell>
      <PageHeader
        description="Halaman ini menampilkan prioritas aspek ulasan negatif berdasarkan metode AHP dan Fuzzy AHP. Bobot prioritas digunakan untuk membantu menentukan aspek yang perlu mendapatkan perhatian lebih dalam pengembangan layanan Spotify."
        title="AHP / Fuzzy AHP"
      />

      <ApiGatewayAlert error={overview.apiError} />

      {overview.dataStatus !== "unavailable" ? (
        <DataNotice notice={overview.notice} />
      ) : null}

      {overview.isServiceUnavailable ? <UnavailableState /> : null}

      <section>
        <SectionHeading title="Ringkasan Prioritas" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {overview.summaryCards.map((card) => (
            <SummaryStatCard card={card} key={card.id} />
          ))}
        </div>
      </section>

      <ChartCard
        description="Perbandingan bobot AHP dan Fuzzy AHP per kriteria. Ranking menunjukkan prioritas relatif tiap aspek."
        title="Perbandingan AHP vs Fuzzy AHP"
      >
        <AhpRankingComparisonChart data={overview.chartData} />
        <div className="mt-6">
          <SimpleTable
            columns={comparisonColumns}
            data={overview.comparisonRows}
            emptyMessage={EMPTY_MESSAGE}
            minWidthClassName="min-w-[1080px]"
            rowKey={(row) => row.id}
          />
        </div>
      </ChartCard>

      <SummaryCard
        description="Detail partisipasi, komposisi, dan konsistensi 10 responden expert judgement. Responden tidak konsisten tidak dipakai dalam agregasi akhir."
        items={buildRespondentSummaryItems(
          overview.respondentSummary,
          overview.dataStatusLabel,
        )}
        title="Ringkasan Responden"
      >
        <SimpleTable
          columns={respondentColumns}
          data={overview.respondentRows}
          emptyMessage="Detail responden belum tersedia dari report-service."
          minWidthClassName="min-w-[1320px]"
          rowKey={(row) => row.id}
        />
        {overview.respondentSummary.note ? (
          <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
            {overview.respondentSummary.note}
          </div>
        ) : null}
      </SummaryCard>

      <ChartCard
        description="Matriks agregat perbandingan berpasangan AHP dari responden valid. Nilai diagonal bernilai 1; nilai resiprokal menunjukkan preferensi arah sebaliknya."
        insight={<MatrixLegend criteria={overview.matrixCriteria} />}
        title="Matriks Pairwise AHP"
      >
        <SimpleTable
          columns={matrixColumns}
          data={overview.ahpPairwiseRows}
          emptyMessage="Matriks pairwise AHP belum tersedia dari report-service."
          minWidthClassName="min-w-[980px]"
          rowKey={(row) => row.id}
        />
      </ChartCard>

      <ChartCard
        description="Matriks Triangular Fuzzy Number (TFN) untuk Fuzzy AHP. Setiap sel ditampilkan sebagai (l, m, u): lower, modal, dan upper bound."
        insight={<MatrixLegend criteria={overview.matrixCriteria} />}
        title="Matriks Pairwise Fuzzy AHP (TFN)"
      >
        <SimpleTable
          columns={matrixColumns}
          data={overview.fuzzyPairwiseRows}
          emptyMessage="Matriks TFN Fuzzy AHP belum tersedia dari report-service."
          minWidthClassName="min-w-[1180px]"
          rowKey={(row) => row.id}
        />
      </ChartCard>
    </AppShell>
  );
}

function SummaryStatCard({ card }: { card: AhpFuzzyAhpSummaryCard }) {
  return (
    <StatCard
      description={card.description}
      label={card.label}
      tone={card.tone}
      value={card.value}
    />
  );
}

function DataNotice({ notice }: { notice: AhpFuzzyAhpNotice }) {
  const className = {
    final: "border-green-200 bg-green-50 text-green-900",
    info: "border-slate-200 bg-slate-50 text-slate-700",
    sample: "border-amber-200 bg-amber-50 text-amber-900",
  }[notice.tone];

  return (
    <div
      className={cn("rounded-lg border px-4 py-3 text-sm leading-6", className)}
    >
      {notice.text}
    </div>
  );
}

function UnavailableState() {
  return (
    <section className="rounded-lg border border-border bg-card p-6 shadow-sm">
      <h3 className="text-base font-semibold text-foreground">
        Data belum dapat ditampilkan
      </h3>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
        {EMPTY_GATEWAY_MESSAGE}
      </p>
    </section>
  );
}

function SectionHeading({ title }: { title: string }) {
  return (
    <div className="mb-4">
      <h2 className="text-base font-semibold text-foreground">{title}</h2>
    </div>
  );
}

function buildRespondentSummaryItems(
  rs: RespondentSummaryView,
  dataStatusLabel: string,
): SummaryCardItem[] {
  return [
    {
      label: "Status Data",
      value: dataStatusLabel,
      description: "Menunjukkan status final/sample dari keluaran AHP.",
    },
    {
      label: "Total Responden",
      value: rs.totalRespondents,
      description: `${rs.actualCount} aktual dan ${rs.syntheticCount} sintetis.`,
    },
    {
      label: "Responden Valid",
      value: rs.validCount,
      description: "Dipakai dalam agregasi geometric mean.",
    },
    {
      label: "Tidak Konsisten",
      value: rs.invalidCount,
      description: "Dikeluarkan dari perhitungan prioritas akhir.",
    },
    {
      label: "Consistency Ratio AHP",
      value: rs.ahpConsistencyRatio,
      description: "Ambang konsistensi yang digunakan: CR ≤ 0,10.",
    },
  ];
}

function buildMatrixColumns(
  criteria: readonly MatrixCriterionView[],
): SimpleTableColumn<PairwiseMatrixRow>[] {
  return [
    {
      key: "criterion",
      header: "Kriteria",
      className: "min-w-[280px]",
      render: (row) => (
        <span className="font-medium text-foreground">{row.criterion}</span>
      ),
    },
    ...criteria.map((criterion, index) => ({
      key: criterion.id,
      header: criterion.id,
      align: "center" as const,
      className: "min-w-[120px]",
      render: (row: PairwiseMatrixRow) => row.values[index] ?? "-",
    })),
  ];
}

function MatrixLegend({ criteria }: { criteria: readonly MatrixCriterionView[] }) {
  if (criteria.length === 0) return null;

  return (
    <div>
      <div className="font-medium">Legenda kriteria</div>
      <div className="mt-2 grid gap-2 md:grid-cols-2">
        {criteria.map((criterion) => (
          <div key={criterion.id}>
            <span className="font-semibold">{criterion.id}</span> ={" "}
            {criterion.name}
          </div>
        ))}
      </div>
    </div>
  );
}

function SourceBadge({ value }: { value: string }) {
  const className =
    value === "Aktual"
      ? "border-green-200 bg-green-50 text-green-800"
      : value === "Sintetis"
        ? "border-blue-200 bg-blue-50 text-blue-800"
        : "border-slate-200 bg-slate-50 text-slate-700";

  return <Badge className={className}>{value}</Badge>;
}

function ConsistencyBadge({
  value,
}: {
  value: RespondentDetailRow["consistencyStatus"];
}) {
  const className =
    value === "Konsisten"
      ? "border-green-200 bg-green-50 text-green-800"
      : value === "Tidak Konsisten"
        ? "border-red-200 bg-red-50 text-red-800"
        : "border-slate-200 bg-slate-50 text-slate-700";

  return <Badge className={className}>{value}</Badge>;
}

function Badge({
  children,
  className,
}: {
  children: ReactNode;
  className: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-2 py-1 text-xs font-medium",
        className,
      )}
    >
      {children}
    </span>
  );
}
