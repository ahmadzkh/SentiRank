import { ChartCard } from "@/components/cards/ChartCard";
import { ModelMetricCard } from "@/components/cards/ModelMetricCard";
import { StatCard } from "@/components/cards/StatCard";
import { SummaryCard } from "@/components/cards/SummaryCard";
import { AppShell, PageHeader } from "@/components/layout";
import { SimpleTable } from "@/components/tables/SimpleTable";
import { ASPECT_META } from "@/constants/aspect";
import { SENTIMENT_META } from "@/constants/sentiment";
import {
  mockModelEvaluation,
  mockModelEvaluationOverview,
} from "@/lib/mock-data";
import type { AspectLabel } from "@/types/aspect";
import type { EvaluationModelSummary, ModelMetric } from "@/types/evaluation";
import type { ReviewSentimentLabel } from "@/types/sentiment";

function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`;
}

function formatMetricValue(metric: ModelMetric) {
  if (metric.format === "percentage") {
    return formatPercent(metric.value);
  }

  return metric.value.toLocaleString("id-ID");
}

function formatMatrixLabel(label: string) {
  if (label in SENTIMENT_META) {
    return SENTIMENT_META[label as ReviewSentimentLabel].label;
  }

  if (label in ASPECT_META) {
    return ASPECT_META[label as AspectLabel].label;
  }

  return label;
}

function ConfusionMatrixTable({ model }: { model: EvaluationModelSummary }) {
  const labels = model.confusionMatrix.labels;

  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <div className="overflow-x-auto">
        <table className="min-w-[680px] w-full border-collapse bg-card text-sm">
          <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-normal text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left">Aktual \ Prediksi</th>
              {labels.map((label) => (
                <th className="px-4 py-3 text-right" key={label}>
                  {formatMatrixLabel(label)}
                </th>
              ))}
              <th className="px-4 py-3 text-right">Support</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {model.confusionMatrix.rows.map((row) => (
              <tr className="hover:bg-slate-50" key={row.actualLabel}>
                <th className="px-4 py-4 text-left font-medium text-foreground">
                  {formatMatrixLabel(row.actualLabel)}
                </th>
                {labels.map((label) => (
                  <td className="px-4 py-4 text-right" key={label}>
                    {row.predictedCounts[label] ?? 0}
                  </td>
                ))}
                <td className="px-4 py-4 text-right font-medium text-foreground">
                  {row.support}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const modelMetrics = mockModelEvaluation.models.flatMap((model) =>
  model.metrics.map((metric) => ({
    id: `${model.task}-${metric.id}`,
    modelName: model.modelName,
    modelVersion: model.modelVersion,
    sampleCount: model.sampleCount,
    metric,
  })),
);

export default function ModelEvaluationPage() {
  return (
    <AppShell>
      <PageHeader
        description="Menampilkan bukti evaluasi model untuk IndoBERT dan SVM menggunakan artefak mock yang siap diganti dengan hasil validasi final."
        eyebrow="Evaluasi model"
        title="Evaluasi Model"
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {mockModelEvaluationOverview.map((metric) => (
          <StatCard
            description={metric.description}
            key={metric.id}
            label={metric.label}
            tone="primary"
            value={formatPercent(metric.value)}
          />
        ))}
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {modelMetrics.map(({ metric, modelName }) => (
          <ModelMetricCard
            description={metric.description}
            key={metric.id}
            label={metric.label}
            modelName={modelName}
            value={formatMetricValue(metric)}
          />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        {mockModelEvaluation.models.map((model) => (
          <ChartCard
            description={`${model.modelName} ${model.modelVersion} dievaluasi pada ${model.sampleCount.toLocaleString("id-ID")} sampel mock.`}
            key={model.task}
            title={`Confusion Matrix - ${model.modelName}`}
          >
            <ConfusionMatrixTable model={model} />
          </ChartCard>
        ))}
      </section>

      <ChartCard
        description="Tabel ini merangkum metrik model yang tersedia pada mock data FE-07."
        title="Laporan Klasifikasi / Ringkasan Evaluasi"
      >
        <SimpleTable
          columns={[
            {
              key: "model",
              header: "Model",
              render: (row) => (
                <div>
                  <p className="font-medium text-foreground">
                    {row.modelName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {row.modelVersion}
                  </p>
                </div>
              ),
            },
            {
              key: "metric",
              header: "Metrik",
              render: (row) => row.metric.label,
            },
            {
              key: "value",
              header: "Nilai",
              align: "right",
              render: (row) => formatMetricValue(row.metric),
            },
            {
              key: "sample",
              header: "Sampel",
              align: "right",
              render: (row) => row.sampleCount.toLocaleString("id-ID"),
            },
            {
              key: "description",
              header: "Catatan",
              render: (row) => row.metric.description,
            },
          ]}
          data={modelMetrics}
          minWidthClassName="min-w-[920px]"
          rowKey={(row) => row.id}
        />
      </ChartCard>

      <SummaryCard
        description="Catatan evaluasi membantu membedakan placeholder UI dari hasil validasi final skripsi."
        title="Catatan Perbandingan Model"
      >
        <div className="grid gap-3 md:grid-cols-2">
          {mockModelEvaluation.models.map((model) => (
            <div
              className="rounded-md border border-border bg-background px-4 py-3"
              key={model.task}
            >
              <p className="text-sm font-semibold text-foreground">
                {model.modelName}
              </p>
              <ul className="mt-2 space-y-2 text-sm leading-6 text-muted-foreground">
                {model.notes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-md border border-blue-100 bg-blue-50 px-4 py-3 text-sm leading-6 text-blue-900">
          {mockModelEvaluation.overallNotes.join(" ")}
        </div>
      </SummaryCard>
    </AppShell>
  );
}
