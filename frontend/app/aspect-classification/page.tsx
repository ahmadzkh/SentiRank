import { ApiGatewayAlert } from "@/components/alerts/ApiGatewayAlert";
import { SentimentBadge } from "@/components/badges/SentimentBadge";
import { ChartCard } from "@/components/cards/ChartCard";
import { StatCard } from "@/components/cards/StatCard";
import { SummaryCard } from "@/components/cards/SummaryCard";
import { AspectClassificationReportChart } from "@/components/charts/AspectClassificationReportChart";
import type { AspectClassificationReportDatum } from "@/components/charts/AspectClassificationReportChart";
import { AspectRankingChart } from "@/components/charts/AspectRankingChart";
import { AppShell, PageHeader } from "@/components/layout";
import { SimpleTable } from "@/components/tables/SimpleTable";
import type { SimpleTableColumn } from "@/components/tables/SimpleTable";
import { EMPTY_GATEWAY_MESSAGE, safeGatewayData } from "@/lib/api-status";
import {
  EMPTY_ASPECT_EVALUATION,
  EMPTY_ASPECT_SUMMARY,
  EMPTY_TABLE_CELL,
  EMPTY_TEXT,
  aspectDisplayLabel,
  aspectRankingData,
  evaluationMetricRows,
  formatMetricPercent,
  metricNumber,
  tableCellValue,
} from "@/lib/gateway-display";
import type { EvaluationMetricRow } from "@/lib/gateway-display";
import {
  getAspectEvaluation,
  getAspectSummary,
} from "@/services/aspect-service";
import type { GatewayAspectPredictionSample } from "@/types";
import type { ReviewSentimentLabel } from "@/types/sentiment";

export const dynamic = "force-dynamic";

const SVM_SCENARIOS = [
  { scenario: "original_7class", label: "SVM original_7class" },
  { scenario: "merged_5class", label: "SVM merged_5class" },
] as const;

interface ModelExperimentRow {
  id: string;
  name: string;
  status: string;
  accuracy: number | null;
  macroF1: number | null;
  selected: boolean;
}

function cleanedReviewText(row: GatewayAspectPredictionSample) {
  return tableCellValue(row.text_svm ?? row.content);
}

function confidenceValue(value: number | string | null | undefined) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return formatMetricPercent(value);
  }

  return tableCellValue(value);
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

function labelChip(value?: string | null) {
  return (
    <span className="inline-flex max-w-[260px] rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-medium text-slate-700">
      <span className="truncate">{aspectDisplayLabel(value)}</span>
    </span>
  );
}

function correctnessStatus(value?: boolean | null) {
  if (value === true) {
    return (
      <span className="inline-flex rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">
        Benar
      </span>
    );
  }

  if (value === false) {
    return (
      <span className="inline-flex rounded-md border border-red-200 bg-red-50 px-2 py-1 text-xs font-medium text-red-700">
        Salah
      </span>
    );
  }

  return EMPTY_TABLE_CELL;
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

function reportLabels(
  report: Record<string, unknown> | undefined,
  fallbackLabels: readonly string[],
) {
  const fallback = fallbackLabels.filter(
    (label) => report?.[label] && typeof report[label] === "object",
  );
  if (fallback.length > 0) {
    return fallback;
  }

  return Object.entries(report ?? {})
    .filter(([label, value]) => {
      const normalized = label.toLowerCase();
      return (
        value &&
        typeof value === "object" &&
        normalized !== "accuracy" &&
        !normalized.includes("avg")
      );
    })
    .map(([label]) => label);
}

function classificationReportData(
  report: Record<string, unknown> | undefined,
  fallbackLabels: readonly string[],
): AspectClassificationReportDatum[] {
  const rows = reportLabels(report, fallbackLabels).map((label) => ({
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

function aspectExperimentRows(
  records: readonly Record<string, unknown>[] | undefined,
  selectedCandidate: string,
): ModelExperimentRow[] {
  const source = records ?? [];
  const rows = SVM_SCENARIOS.map(({ scenario, label }) => {
    const record = source.find((item) => item.scenario === scenario);
    const status = recordString(
      record,
      "status",
      scenario === selectedCandidate ? "selected" : "experiment",
    );
    return {
      id: scenario,
      name: label,
      status,
      accuracy: record ? metricNumber(record, ["accuracy", "test_accuracy"]) : null,
      macroF1: record ? metricNumber(record, ["f1_macro", "test_f1_macro"]) : null,
      selected: status === "selected" || scenario === selectedCandidate,
    };
  });
  const knownScenarios = new Set(SVM_SCENARIOS.map((item) => item.scenario));
  const extraRows = source
    .filter((record) => {
      const scenario = recordString(record, "scenario", "");
      return scenario && !knownScenarios.has(scenario as (typeof SVM_SCENARIOS)[number]["scenario"]);
    })
    .map((record, index) => {
      const scenario = recordString(record, "scenario", `svm_extra_${index + 1}`);
      const status = recordString(record, "status", "experiment");
      return {
        id: scenario,
        name: `SVM ${scenario}`,
        status,
        accuracy: metricNumber(record, ["accuracy", "test_accuracy"]),
        macroF1: metricNumber(record, ["f1_macro", "test_f1_macro"]),
        selected: status === "selected" || scenario === selectedCandidate,
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

function aspectResultColumns() {
  return [
    {
      key: "no",
      header: "No",
      align: "center",
      className: "w-16",
      render: (_row, index) => index + 1,
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
      key: "sentiment",
      header: "Sentimen Final",
      render: (row) => (
        <SentimentBadge sentiment={normalizeSentimentLabel(row.final_sentiment)} />
      ),
    },
    {
      key: "actualLabel",
      header: "Label Aktual",
      render: (row) => labelChip(row.true_label ?? row.aspect_label),
    },
    {
      key: "predictedAspect",
      header: "Prediksi Aspek",
      render: (row) => labelChip(row.predicted_label),
    },
    {
      key: "confidence",
      header: "Konfidensi Label",
      align: "right",
      render: (row) => confidenceValue(row.aspect_label_confidence),
    },
    {
      key: "status",
      header: "Status",
      align: "center",
      render: (row) => correctnessStatus(row.is_correct),
    },
  ] satisfies SimpleTableColumn<GatewayAspectPredictionSample>[];
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
      header: "Eksperimen SVM",
      className: "min-w-[260px]",
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

export default async function AspectClassificationPage() {
  const [summaryResult, evaluationResult] = await Promise.all([
    safeGatewayData(getAspectSummary, EMPTY_ASPECT_SUMMARY),
    safeGatewayData(getAspectEvaluation, EMPTY_ASPECT_EVALUATION),
  ]);

  const summary = summaryResult.data;
  const evaluation = evaluationResult.data;
  const aspectRows = aspectRankingData(
    summary.negative_aspect_distribution &&
      Object.keys(summary.negative_aspect_distribution).length
      ? summary.negative_aspect_distribution
      : summary.aspect_distribution,
  );
  const topAspect = aspectRows[0];
  const predictionSamples = evaluation.prediction_samples ?? [];
  const selectedMetrics = evaluation.selected_metrics;
  const reportRows = classificationReportData(
    evaluation.classification_report,
    summary.final_aspect_labels,
  );
  const metricRows = evaluationMetricRows(selectedMetrics);
  const experimentRows = aspectExperimentRows(
    evaluation.scenario_comparison,
    evaluation.selected_candidate,
  );
  const accuracy = metricNumber(selectedMetrics, ["accuracy", "test_accuracy"]);
  const macroF1 = metricNumber(selectedMetrics, ["f1_macro", "test_f1_macro"]);
  const apiError = summaryResult.error ?? evaluationResult.error;
  const modelStatus = summary.model_available ? "Aktif" : "Fallback";
  const modelNote = summary.weak_label_limitation || evaluation.limitations[0] || EMPTY_TEXT;

  return (
    <AppShell>
      <PageHeader
        description="Evaluasi dan hasil prediksi SVM."
        eyebrow="SVM"
        title="Klasifikasi Aspek"
      />

      <ApiGatewayAlert error={apiError} />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard
          description="Ulasan negatif beraspek."
          label="Ulasan Negatif"
          value={aspectRows.reduce((total, row) => total + row.count, 0)}
        />
        <StatCard
          description="Aspek paling sering muncul."
          label="Aspek Dominan"
          tone="primary"
          value={topAspect?.label ?? "-"}
        />
        <StatCard
          description="Model siap digunakan."
          label="Status Model"
          tone={summary.model_available ? "positive" : "neutral"}
          value={`${modelStatus} (SVM)`}
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
          description="Precision, recall, dan F1 per aspek."
          insight={
            reportRows.length > 0
              ? "Metrik per kelas tersedia."
              : EMPTY_GATEWAY_MESSAGE
          }
          title="Classification Report SVM"
        >
          <AspectClassificationReportChart data={reportRows} />
        </ChartCard>

        <ChartCard
          description="Komposisi label aspek."
          insight={
            topAspect ? `${topAspect.label} paling dominan.` : EMPTY_GATEWAY_MESSAGE
          }
          title="Distribusi Aspek"
        >
          <AspectRankingChart data={aspectRows} />
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
        title="Tabel Ulasan Aspek"
      >
        <SimpleTable
          columns={aspectResultColumns()}
          data={predictionSamples}
          emptyMessage={EMPTY_GATEWAY_MESSAGE}
          minWidthClassName="min-w-[1280px]"
          rowKey={(row, index) => row.external_id ?? `aspect-review-${index}`}
        />
      </ChartCard>

      <SummaryCard
        description="Perbandingan SVM 7class dan 5class."
        title="Catatan Model"
      >
        <div className="space-y-4">
          <SimpleTable
            columns={experimentColumns()}
            data={experimentRows}
            emptyMessage={EMPTY_GATEWAY_MESSAGE}
            minWidthClassName="min-w-[720px]"
            rowKey={(row) => row.id}
          />
          <p className="rounded-md border border-border bg-background px-4 py-3 text-sm leading-6 text-muted-foreground">
            {summaryResult.isAvailable || evaluationResult.isAvailable
              ? modelNote
              : EMPTY_TEXT}
          </p>
        </div>
      </SummaryCard>
    </AppShell>
  );
}
