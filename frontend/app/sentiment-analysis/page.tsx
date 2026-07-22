"use client";

import { ApiGatewayAlert } from "@/components/alerts/ApiGatewayAlert";
import { SentimentBadge } from "@/components/badges/SentimentBadge";
import { ChartCard } from "@/components/cards/ChartCard";
import { StatCard } from "@/components/cards/StatCard";
import { SummaryCard } from "@/components/cards/SummaryCard";
import { SentimentClassificationReportChart } from "@/components/charts/SentimentClassificationReportChart";
import type { SentimentClassificationReportDatum } from "@/components/charts/SentimentClassificationReportChart";
import { SentimentDistributionChart } from "@/components/charts/SentimentDistributionChart";
import { AppShell, PageHeader } from "@/components/layout";
import { SimpleTable } from "@/components/tables/SimpleTable";
import type { SimpleTableColumn } from "@/components/tables/SimpleTable";
import { EMPTY_GATEWAY_MESSAGE, safeGatewayData } from "@/lib/api-status";
import {
  EMPTY_SENTIMENT_EVALUATION,
  EMPTY_SENTIMENT_SUMMARY,
  EMPTY_TABLE_CELL,
  EMPTY_TEXT,
  evaluationMetricRows,
  formatMetricPercent,
  metricNumber,
  sentimentDistributionData,
  tableCellValue,
} from "@/lib/gateway-display";
import type { EvaluationMetricRow } from "@/lib/gateway-display";
import {
  getSentimentEvaluation,
  getSentimentSummary,
} from "@/services/sentiment-service";
import type { GatewaySentimentPredictionSample } from "@/types";
import type { ReviewSentimentLabel } from "@/types/sentiment";
import { useEffect, useState } from "react";

const SENTIMENT_CLASS_LABELS = ["Negative", "Neutral", "Positive"] as const;
const INDOBERT_RUN_NAMES = [
  "run_1_baseline",
  "run_2_weighted_loss",
  "run_3_weighted_loss_lr_1e-5",
  "run_4_weighted_loss_lr_1e-5_slang_norm",
] as const;

interface ModelExperimentRow {
  id: string;
  name: string;
  status: string;
  accuracy: number | null;
  macroF1: number | null;
  selected: boolean;
}

function cleanedReviewText(row: GatewaySentimentPredictionSample) {
  return tableCellValue(row.text_indobert ?? row.content);
}

function confidenceValue(value: number | null | undefined) {
  return typeof value === "number" && Number.isFinite(value)
    ? formatMetricPercent(value)
    : EMPTY_TABLE_CELL;
}

function normalizeSentimentLabel(
  value?: string | null,
): ReviewSentimentLabel | undefined {
  const normalized = value?.toLowerCase();
  if (
    normalized === "positive" ||
    normalized === "neutral" ||
    normalized === "negative"
  ) {
    return normalized;
  }
  return undefined;
}

function reportMetric(
  report: Record<string, unknown> | undefined,
  label: string,
  key: string,
): number {
  const row = report?.[label];
  if (!row || typeof row !== "object") {
    return 0;
  }
  const value = (row as Record<string, unknown>)[key];
  return typeof value === "number" && Number.isFinite(value) ? value * 100 : 0;
}

function reportSupport(
  report: Record<string, unknown> | undefined,
  label: string,
): number {
  const row = report?.[label];
  if (!row || typeof row !== "object") {
    return 0;
  }
  const value = (row as Record<string, unknown>).support;
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function classificationReportData(
  report: Record<string, unknown> | undefined,
): SentimentClassificationReportDatum[] {
  const rows = SENTIMENT_CLASS_LABELS.map((label) => ({
    label,
    precision: reportMetric(report, label, "precision"),
    recall: reportMetric(report, label, "recall"),
    f1Score: reportMetric(report, label, "f1-score"),
    support: reportSupport(report, label),
  }));

  return rows.some(
    (row) => row.precision > 0 || row.recall > 0 || row.f1Score > 0,
  )
    ? rows
    : [];
}

function recordString(
  record: Record<string, unknown> | undefined,
  key: string,
  fallback = EMPTY_TABLE_CELL,
) {
  const value = record?.[key];
  return typeof value === "string" && value.trim() ? value : fallback;
}

function sentimentExperimentRows(
  records: readonly Record<string, unknown>[] | undefined,
  selectedCandidate: string,
): ModelExperimentRow[] {
  const source = records ?? [];
  const rows = INDOBERT_RUN_NAMES.map((name) => {
    const record = source.find((item) => item.candidate_name === name);
    const status = recordString(
      record,
      "status",
      name === selectedCandidate ? "selected" : "experiment",
    );
    return {
      id: name,
      name,
      status,
      accuracy: record ? metricNumber(record, ["accuracy", "test_accuracy"]) : null,
      macroF1: record ? metricNumber(record, ["f1_macro", "test_f1_macro"]) : null,
      selected: status === "selected" || name === selectedCandidate,
    };
  });
  const knownNames = new Set(INDOBERT_RUN_NAMES);
  const extraRows = source
    .filter((record) => {
      const name = recordString(record, "candidate_name", "");
      return name && !knownNames.has(name as (typeof INDOBERT_RUN_NAMES)[number]);
    })
    .map((record, index) => {
      const name = recordString(record, "candidate_name", `run_extra_${index + 1}`);
      const status = recordString(record, "status", "experiment");
      return {
        id: name,
        name,
        status,
        accuracy: metricNumber(record, ["accuracy", "test_accuracy"]),
        macroF1: metricNumber(record, ["f1_macro", "test_f1_macro"]),
        selected: status === "selected" || name === selectedCandidate,
      };
    });

  return [...rows, ...extraRows];
}

function statusBadge(row: ModelExperimentRow) {
  if (row.selected) {
    return (
      <span className="inline-flex rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">
        Selected
      </span>
    );
  }
  if (row.status === "baseline") {
    return (
      <span className="inline-flex rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-medium text-slate-700">
        Baseline
      </span>
    );
  }
  return (
    <span className="inline-flex rounded-md border border-blue-200 bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
      Experiment
    </span>
  );
}

function experimentNameCell(row: ModelExperimentRow) {
  return (
    <span
      className={
        row.selected
          ? "inline-flex rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1 font-semibold text-emerald-800"
          : "font-medium text-foreground"
      }
    >
      {row.name}
    </span>
  );
}

function sentimentResultColumns() {
  return [
    {
      key: "no",
      header: "No",
      align: "center",
      className: "w-16",
      render: (_row, index) => <span>{index + 1}</span>,
    },
    {
      key: "cleanedReview",
      header: "Teks Bersih",
      className: "min-w-[360px] max-w-[520px]",
      render: (row) => (
        <span className="line-clamp-3 break-words font-medium text-foreground">
          {cleanedReviewText(row)}
        </span>
      ),
    },
    {
      key: "actualLabel",
      header: "Label Aktual",
      render: (row) => (
        <SentimentBadge
          sentiment={normalizeSentimentLabel(
            row.true_label ?? row.final_sentiment,
          )}
        />
      ),
    },
    {
      key: "predictedSentiment",
      header: "Prediksi Sentimen",
      render: (row) => (
        <SentimentBadge
          sentiment={normalizeSentimentLabel(
            row.predicted_sentiment ?? row.predicted_label,
          )}
        />
      ),
    },
    {
      key: "confidence",
      header: "Konfidensi",
      align: "right",
      render: (row) => confidenceValue(row.sentiment_confidence),
    },
  ] satisfies SimpleTableColumn<GatewaySentimentPredictionSample>[];
}

function metricColumns() {
  return [
    {
      key: "metric",
      header: "Metrik",
      render: (row) => (
        <span className="font-medium text-foreground">{row.label}</span>
      ),
    },
    {
      key: "value",
      header: "Nilai",
      align: "right",
      render: (row) => row.value,
    },
  ] satisfies SimpleTableColumn<EvaluationMetricRow>[];
}

function experimentColumns() {
  return [
    {
      key: "name",
      header: "Run IndoBERT",
      className: "min-w-[300px]",
      render: experimentNameCell,
    },
    {
      key: "status",
      header: "Status",
      align: "center",
      render: statusBadge,
    },
    {
      key: "accuracy",
      header: "Accuracy",
      align: "right",
      render: (row) => formatMetricPercent(row.accuracy),
    },
    {
      key: "macroF1",
      header: "Macro F1",
      align: "right",
      render: (row) => formatMetricPercent(row.macroF1),
    },
  ] satisfies SimpleTableColumn<ModelExperimentRow>[];
}

export default async function SentimentAnalysisPage() {
  const [summaryResult, evaluationResult] = await Promise.all([
    safeGatewayData(getSentimentSummary, EMPTY_SENTIMENT_SUMMARY),
    safeGatewayData(getSentimentEvaluation, EMPTY_SENTIMENT_EVALUATION),
  ]);

  const summary = summaryResult.data;
  const evaluation = evaluationResult.data;
  const predictionSamples = evaluation.prediction_samples ?? [];
  const pageError = summaryResult.error ?? evaluationResult.error;

  const sentimentRows = sentimentDistributionData(
    summary.final_sentiment_distribution,
  );
  const selectedMetrics = evaluation.selected_metrics;
  const reportRows = classificationReportData(evaluation.classification_report);
  const metricRows = evaluationMetricRows(selectedMetrics);
  const experimentRows = sentimentExperimentRows(
    evaluation.run_comparison,
    evaluation.selected_candidate,
  );
  const accuracy = metricNumber(selectedMetrics, ["accuracy", "test_accuracy"]);
  const macroF1 = metricNumber(selectedMetrics, ["f1_macro", "test_f1_macro"]);
  const totalCleanReviews = sentimentRows.reduce(
    (total, row) => total + row.count,
    0,
  );
  const modelStatus = summary.is_fallback ? "Fallback" : "Aktif";
  const modelNote = evaluation.limitations.find((item) => item.trim()) ?? EMPTY_TEXT;

  return (
    <AppShell>
      <PageHeader
        description="Evaluasi dan hasil prediksi IndoBERT."
        eyebrow="IndoBERT"
        title="Analisis Sentimen"
      />

      <ApiGatewayAlert error={pageError} />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard
          description="Total ulasan bersih."
          label="Ulasan Bersih"
          value={totalCleanReviews}
        />
        <StatCard
          description="Jumlah sampel tabel."
          label="Sampel Prediksi"
          value={predictionSamples.length}
        />
        <StatCard
          description="Model siap digunakan."
          label="Status Model"
          tone={summary.is_fallback ? "neutral" : "positive"}
          value={`${modelStatus} (IndoBERT)`}
        />
        <StatCard
          description="Metrik utama model."
          label="Accuracy"
          value={formatMetricPercent(accuracy)}
        />
        <StatCard
          description="Rata-rata F1 kelas."
          label="Macro F1"
          value={formatMetricPercent(macroF1)}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <ChartCard
          description="Precision, recall, dan F1 per polaritas."
          insight={
            reportRows.length > 0
              ? "Metrik per kelas tersedia."
              : EMPTY_GATEWAY_MESSAGE
          }
          title="Classification Report IndoBERT"
        >
          <SentimentClassificationReportChart data={reportRows} />
        </ChartCard>

        <ChartCard
          description="Komposisi label sentimen."
          insight={
            sentimentRows.length > 0
              ? "Distribusi data bersih."
              : EMPTY_GATEWAY_MESSAGE
          }
          title="Distribusi Sentimen"
        >
          <SentimentDistributionChart data={sentimentRows} />
        </ChartCard>
      </section>

      <ChartCard
        description="Akurasi dan rata-rata metrik."
        title="Tabel Metrik Evaluasi"
      >
        <SimpleTable
          columns={metricColumns()}
          data={metricRows}
          emptyMessage={EMPTY_GATEWAY_MESSAGE}
          minWidthClassName="min-w-[560px]"
          rowKey={(row) => row.id}
        />
      </ChartCard>

      <ChartCard
        description="10 sampel prediksi data uji."
        title="Tabel Ulasan Sentimen"
      >
        <SimpleTable
          columns={sentimentResultColumns()}
          data={predictionSamples}
          emptyMessage={EMPTY_GATEWAY_MESSAGE}
          minWidthClassName="min-w-[1180px]"
          rowKey={(row, index) =>
            row.external_id ?? `sentiment-review-${index}`
          }
        />
      </ChartCard>

      <SummaryCard
        description="Daftar eksperimen IndoBERT dan batasan evaluasi."
        title="Catatan Model"
      >
        <div className="space-y-4">
          <SimpleTable
            columns={experimentColumns()}
            data={experimentRows}
            emptyMessage={EMPTY_GATEWAY_MESSAGE}
            minWidthClassName="min-w-[760px]"
            rowKey={(row) => row.id}
          />
          <p className="rounded-md border border-border bg-background px-4 py-3 text-sm leading-6 text-muted-foreground">
            {evaluationResult.isAvailable ? modelNote : EMPTY_TEXT}
          </p>
        </div>
      </SummaryCard>
    </AppShell>
  );
}
