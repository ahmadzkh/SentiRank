"use client";

import { ApiGatewayAlert } from "@/components/alerts/ApiGatewayAlert";
import { ChartCard } from "@/components/cards/ChartCard";
import { StatCard } from "@/components/cards/StatCard";
import { SentimentStageComparisonChart } from "@/components/charts/SentimentStageComparisonChart";
import { AppShell, PageHeader } from "@/components/layout";
import { SimpleTable } from "@/components/tables/SimpleTable";
import type { SimpleTableColumn } from "@/components/tables/SimpleTable";
import { EMPTY_GATEWAY_MESSAGE, safeGatewayData } from "@/lib/api-status";
import {
  EMPTY_PREPROCESSING_SUMMARY,
  EMPTY_TABLE_CELL,
  tableCellValue,
} from "@/lib/gateway-display";
import { getPreprocessingSummary } from "@/services/preprocessing-service";
import type {
  GatewayModelSplitSummary,
  GatewayPreprocessingSample,
  GatewayPreprocessingSummary,
} from "@/types";
import { useEffect, useState } from "react";

const COUNT_FORMATTER = new Intl.NumberFormat("id-ID");
const PERCENT_FORMATTER = new Intl.NumberFormat("id-ID", {
  maximumFractionDigits: 1,
});

const DROP_REASON_LABELS: Record<string, string> = {
  too_short_after_cleaning: "Teks terlalu pendek",
  high_symbol_ratio: "Rasio simbol tinggi",
  too_few_alphabet_chars: "Terlalu sedikit huruf",
  repeated_garbage_pattern: "Pola sampah berulang",
  high_digit_ratio: "Rasio digit tinggi",
  morse_like_text: "Pola Morse-like",
};

const SPLIT_LABELS: Record<string, string> = {
  train: "Train",
  validation: "Validation",
  test: "Test",
};

interface DistributionRow {
  key: string;
  label: string;
  value: number;
  percentage: number;
}

interface RatingComparisonRow {
  rating: string;
  before: number;
  after: number;
  dropped: number;
}

interface SplitRow {
  split: string;
  indobert: number | null;
  svm: number | null;
}

const sampleColumns: readonly SimpleTableColumn<GatewayPreprocessingSample>[] = [
  {
    key: "no",
    header: "No",
    align: "center",
    className: "w-16",
    render: (_row, index) => index + 1,
  },
  {
    key: "originalText",
    header: "Ulasan Mentah",
    className: "min-w-[320px] max-w-[460px]",
    render: (row) => (
      <span className="line-clamp-3 break-words font-medium text-foreground">
        {tableCellValue(row.original_text)}
      </span>
    ),
  },
  {
    key: "cleanedText",
    header: "Hasil Prapemrosesan",
    className: "min-w-[320px] max-w-[460px]",
    render: (row) => (
      <span className="line-clamp-3 break-words text-muted-foreground">
        {tableCellValue(row.cleaned_text)}
      </span>
    ),
  },
  {
    key: "rating",
    header: "Rating",
    align: "center",
    render: (row) => (row.rating ? `${row.rating}/5` : EMPTY_TABLE_CELL),
  },
  {
    key: "status",
    header: "Status",
    align: "center",
    render: (row) => <StatusBadge status={row.status} />,
  },
  {
    key: "dropReason",
    header: "Alasan Dibuang",
    className: "min-w-[180px]",
    render: (row) => reasonLabel(row.drop_reason),
  },
];

const splitColumns: readonly SimpleTableColumn<SplitRow>[] = [
  {
    key: "split",
    header: "Split",
    render: (row) => (
      <span className="font-medium text-foreground">{row.split}</span>
    ),
  },
  {
    key: "indobert",
    header: "IndoBERT Sentiment",
    align: "right",
    render: (row) => countCell(row.indobert),
  },
  {
    key: "svm",
    header: "SVM Aspect",
    align: "right",
    render: (row) => countCell(row.svm),
  },
];

export default async function PreprocessingPage() {
  const preprocessResult = await safeGatewayData(
    getPreprocessingSummary,
    EMPTY_PREPROCESSING_SUMMARY,
  );
  const preprocess = preprocessResult.data as GatewayPreprocessingSummary;

  const totalValid = numberOrZero(preprocess.valid_review_count ?? preprocess.total_rows);
  const totalDropped = numberOrZero(preprocess.dropped_review_count);
  const totalRaw = numberOrZero(preprocess.input_review_count) || totalValid + totalDropped;
  const validPercent = totalRaw > 0 ? (totalValid / totalRaw) * 100 : 0;

  const sentimentStages = buildSentimentStages(preprocess);
  const noiseRows = distributionRows(preprocess.drop_reason_distribution ?? {});
  const ratingRows = ratingComparisonRows(
    preprocess.rating_distribution_before ?? {},
    preprocess.rating_distribution_after ?? {},
  );
  const splitRows = modelSplitRows(preprocess.model_split_summary);
  const splitSummary = preprocess.model_split_summary ?? {};

  return (
    <AppShell>
      <PageHeader
        title="Laporan Prapemrosesan"
        description="Laporan pembersihan, validasi kualitas, dan transformasi data ulasan Spotify sebelum digunakan oleh IndoBERT, SVM, AHP, dan Fuzzy AHP."
        eyebrow="Persiapan Data"
      />

      <ApiGatewayAlert error={preprocessResult.error} />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Data Mentah"
          value={formatCount(totalRaw)}
          description="Jumlah ulasan sebelum quality filtering."
        />
        <StatCard
          label="Total Data Bersih"
          value={formatCount(totalValid)}
          description="Ulasan valid yang digunakan sebagai dataset canonical."
          tone="positive"
        />
        <StatCard
          label="Total Noise"
          value={formatCount(totalDropped)}
          description="Ulasan dibuang karena tidak layak untuk pemodelan."
          tone="negative"
        />
        <StatCard
          label="Persentase Data Valid"
          value={`${PERCENT_FORMATTER.format(validPercent)}%`}
          description="Proporsi data yang lolos prapemrosesan."
          tone={validPercent >= 90 ? "positive" : "neutral"}
        />
      </section>

      <ChartCard
        title="Distribusi Sentimen per Tahap"
        description="Perbandingan distribusi sentimen sebelum dan sesudah prapemrosesan untuk melihat dampak filtering terhadap komposisi kelas."
      >
        <SentimentStageComparisonChart data={sentimentStages} />
      </ChartCard>

      <section className="grid gap-6 xl:grid-cols-2">
        <ChartCard
          title="Distribusi Jenis Noise"
          description="Alasan ulasan dikeluarkan dari dataset bersih."
        >
          <HorizontalDistributionChart rows={noiseRows} />
        </ChartCard>

        <ChartCard
          title="Distribusi Rating Sebelum dan Sesudah"
          description="Perbandingan jumlah ulasan per rating setelah noise dikeluarkan."
        >
          <RatingComparisonChart rows={ratingRows} />
        </ChartCard>
      </section>

      <ChartCard
        title="Contoh Hasil Prapemrosesan"
        description="Sepuluh sampel dari dataset: lima ulasan valid dan lima ulasan yang dibuang oleh quality filtering."
      >
        <SimpleTable
          columns={sampleColumns}
          data={(preprocess.preprocessing_samples ?? []).slice(0, 10)}
          emptyMessage={EMPTY_GATEWAY_MESSAGE}
          minWidthClassName="min-w-[1180px]"
          rowKey={(row, index) => row.external_id ?? `preprocessing-sample-${index}`}
        />
      </ChartCard>

      <ChartCard
        title="Dampak terhadap Dataset Pemodelan"
        description="Jumlah data yang masuk ke split pelatihan dan evaluasi untuk model IndoBERT dan SVM Aspect."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <ModelDatasetSummary
            title="IndoBERT Sentiment"
            summary={splitSummary.indobert}
          />
          <ModelDatasetSummary
            title="SVM Aspect"
            summary={splitSummary.svm}
          />
        </div>
        <div className="mt-6">
          <SimpleTable
            columns={splitColumns}
            data={splitRows}
            emptyMessage={EMPTY_GATEWAY_MESSAGE}
            minWidthClassName="min-w-[720px]"
            rowKey={(row) => row.split}
          />
        </div>
      </ChartCard>

      <ChartCard title="Peran Prapemrosesan dalam Pipeline">
        <p className="text-sm leading-6 text-muted-foreground">
          Tahap prapemrosesan membersihkan data ulasan dari teks tidak valid,
          simbol acak, pola Morse-like, rasio digit atau simbol berlebih, serta
          ulasan yang terlalu pendek. Data yang lolos validasi digunakan sebagai
          sumber utama pembentukan dataset IndoBERT dan SVM, sedangkan data yang
          masuk noise report tidak digunakan untuk pelatihan maupun evaluasi
          model.
        </p>
      </ChartCard>
    </AppShell>
  );
}

function HorizontalDistributionChart({ rows }: { rows: readonly DistributionRow[] }) {
  if (rows.length === 0) return <EmptyChart />;

  return (
    <div className="space-y-4">
      {rows.map((row) => (
        <div key={row.key}>
          <div className="mb-1 flex items-center justify-between gap-4 text-sm">
            <span className="font-medium text-foreground">{row.label}</span>
            <span className="font-mono text-muted-foreground">
              {formatCount(row.value)} ({PERCENT_FORMATTER.format(row.percentage)}%)
            </span>
          </div>
          <div className="h-3 rounded-full bg-slate-100">
            <div
              className="h-3 rounded-full bg-blue-600"
              style={{ width: `${Math.max(row.percentage, 2)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function RatingComparisonChart({ rows }: { rows: readonly RatingComparisonRow[] }) {
  const maxValue = Math.max(...rows.flatMap((row) => [row.before, row.after]), 0);
  if (rows.length === 0 || maxValue === 0) return <EmptyChart />;

  return (
    <div className="space-y-5">
      {rows.map((row) => (
        <div className="grid grid-cols-[72px_1fr] items-center gap-3" key={row.rating}>
          <span className="text-sm font-medium text-foreground">Rating {row.rating}</span>
          <div className="space-y-2">
            <BarLine label="Sebelum" value={row.before} max={maxValue} color="bg-slate-500" />
            <BarLine label="Sesudah" value={row.after} max={maxValue} color="bg-blue-600" />
          </div>
        </div>
      ))}
      <div className="flex gap-5 text-xs text-muted-foreground">
        <LegendItem color="bg-slate-500" label="Sebelum" />
        <LegendItem color="bg-blue-600" label="Sesudah" />
      </div>
    </div>
  );
}

function BarLine({
  label,
  value,
  max,
  color,
}: {
  label: string;
  value: number;
  max: number;
  color: string;
}) {
  const width = max > 0 ? (value / max) * 100 : 0;

  return (
    <div className="grid grid-cols-[72px_1fr_88px] items-center gap-2 text-xs">
      <span className="text-muted-foreground">{label}</span>
      <div className="h-3 rounded-full bg-slate-100">
        <div className={`h-3 rounded-full ${color}`} style={{ width: `${width}%` }} />
      </div>
      <span className="text-right font-mono text-muted-foreground">
        {formatCount(value)}
      </span>
    </div>
  );
}

function ModelDatasetSummary({
  title,
  summary,
}: {
  title: string;
  summary?: GatewayModelSplitSummary;
}) {
  const total = numberOrNull(summary?.total);
  const splits = summary?.splits ?? {};

  return (
    <div className="rounded-lg border border-border bg-background p-4">
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <p className="mt-2 text-2xl font-semibold text-foreground">
        {countCell(total)}
      </p>
      <p className="mt-1 text-sm text-muted-foreground">Total data final</p>
      <div className="mt-4 space-y-2 text-sm">
        {Object.entries(SPLIT_LABELS).map(([key, label]) => {
          const value = numberOrNull(splits[key]);
          const percentage = total && value !== null ? (value / total) * 100 : null;
          return (
            <div className="flex justify-between gap-4" key={key}>
              <span className="text-muted-foreground">{label}</span>
              <span className="font-mono text-foreground">
                {percentage === null
                  ? EMPTY_TABLE_CELL
                  : `${PERCENT_FORMATTER.format(percentage)}%`}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status?: string | null }) {
  const isDropped = status === "dropped";
  return (
    <span
      className={
        isDropped
          ? "inline-flex rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-800"
          : "inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800"
      }
    >
      {isDropped ? "Dibuang" : "Valid"}
    </span>
  );
}

function EmptyChart() {
  return (
    <div className="flex h-64 items-center justify-center rounded-md border border-dashed border-border bg-background text-sm text-muted-foreground">
      {EMPTY_GATEWAY_MESSAGE}
    </div>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className={`h-3 w-3 rounded-sm ${color}`} />
      {label}
    </span>
  );
}

function buildSentimentStages(preprocess: GatewayPreprocessingSummary) {
  const before = sentimentRecord(preprocess.sentiment_distribution_before);
  const after = sentimentRecord(preprocess.sentiment_distribution_after);
  return [
    { stage: "Raw", ...before },
    { stage: "Preprocessing", ...after },
  ].filter((row) => row.positive + row.neutral + row.negative > 0);
}

function sentimentRecord(distribution?: Record<string, number>) {
  return {
    positive: distributionValue(distribution, "Positive"),
    neutral: distributionValue(distribution, "Neutral"),
    negative: distributionValue(distribution, "Negative"),
  };
}

function distributionRows(distribution: Record<string, number>): DistributionRow[] {
  const total = Object.values(distribution).reduce((sum, value) => sum + value, 0);
  return Object.entries(distribution)
    .map(([key, value]) => ({
      key,
      label: reasonLabel(key),
      value,
      percentage: total > 0 ? (value / total) * 100 : 0,
    }))
    .sort((first, second) => second.value - first.value);
}

function ratingComparisonRows(
  before: Record<string, number>,
  after: Record<string, number>,
): RatingComparisonRow[] {
  return ["1", "2", "3", "4", "5"].map((rating) => {
    const beforeValue = before[rating] ?? 0;
    const afterValue = after[rating] ?? 0;
    return {
      rating,
      before: beforeValue,
      after: afterValue,
      dropped: Math.max(beforeValue - afterValue, 0),
    };
  });
}

function modelSplitRows(
  summary?: Record<string, GatewayModelSplitSummary>,
): SplitRow[] {
  return Object.entries(SPLIT_LABELS).map(([key, label]) => ({
    split: label,
    indobert: numberOrNull(summary?.indobert?.splits?.[key]),
    svm: numberOrNull(summary?.svm?.splits?.[key]),
  }));
}

function distributionValue(distribution: Record<string, number> | undefined, key: string) {
  return (
    distribution?.[key] ??
    distribution?.[key.toLowerCase()] ??
    distribution?.[key.toUpperCase()] ??
    0
  );
}

function reasonLabel(value?: string | null) {
  if (!value) return EMPTY_TABLE_CELL;
  return DROP_REASON_LABELS[value] ?? value.replace(/_/g, " ");
}

function countCell(value: number | null | undefined) {
  return value === null || value === undefined ? EMPTY_TABLE_CELL : formatCount(value);
}

function formatCount(value: number) {
  return COUNT_FORMATTER.format(value);
}

function numberOrZero(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function numberOrNull(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}
