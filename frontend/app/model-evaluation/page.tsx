import { ChartCard } from "@/components/cards/ChartCard";
import { StatCard } from "@/components/cards/StatCard";
import { SummaryCard } from "@/components/cards/SummaryCard";
import { ModelMetricComparisonChart } from "@/components/charts/ModelMetricComparisonChart";
import type { ModelMetricComparisonDatum } from "@/components/charts/ModelMetricComparisonChart";
import { AppShell, PageHeader } from "@/components/layout";
import { SimpleTable } from "@/components/tables/SimpleTable";
import { researchResults } from "@/lib/research-results";

function formatPercent(value: number) {
  return `${(value * 100).toFixed(2)}%`;
}

interface ResearchConfusionMatrix {
  labels: readonly string[];
  rows: readonly {
    actualLabel: string;
    predictedCounts: Readonly<Record<string, number>>;
    support: number;
  }[];
}

function ConfusionMatrixTable({
  matrix,
}: {
  matrix: ResearchConfusionMatrix;
}) {
  const labels = matrix.labels;

  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <div className="overflow-x-auto">
        <table className="min-w-[680px] w-full border-collapse bg-card text-sm">
          <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-normal text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left">Aktual \ Prediksi</th>
              {labels.map((label) => (
                <th className="px-4 py-3 text-right" key={label}>
                  {label}
                </th>
              ))}
              <th className="px-4 py-3 text-right">Support</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {matrix.rows.map((row) => (
              <tr className="hover:bg-slate-50" key={row.actualLabel}>
                <th className="px-4 py-4 text-left font-medium text-foreground">
                  {row.actualLabel}
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

const modelMetrics = [
  {
    id: "indobert-accuracy",
    modelName: "IndoBERT",
    modelVersion: researchResults.indobertEvaluation.finalCandidate,
    sampleCount: researchResults.indobertEvaluation.support,
    label: "Accuracy",
    value: researchResults.indobertEvaluation.accuracy,
    description: "Accuracy kandidat final IndoBERT run_3.",
  },
  {
    id: "indobert-precision",
    modelName: "IndoBERT",
    modelVersion: researchResults.indobertEvaluation.finalCandidate,
    sampleCount: researchResults.indobertEvaluation.support,
    label: "Precision Macro",
    value: researchResults.indobertEvaluation.precisionMacro,
    description: "Precision macro pada data uji.",
  },
  {
    id: "indobert-recall",
    modelName: "IndoBERT",
    modelVersion: researchResults.indobertEvaluation.finalCandidate,
    sampleCount: researchResults.indobertEvaluation.support,
    label: "Recall Macro",
    value: researchResults.indobertEvaluation.recallMacro,
    description: "Recall macro pada data uji.",
  },
  {
    id: "indobert-f1",
    modelName: "IndoBERT",
    modelVersion: researchResults.indobertEvaluation.finalCandidate,
    sampleCount: researchResults.indobertEvaluation.support,
    label: "Macro F1",
    value: researchResults.indobertEvaluation.f1Macro,
    description: "Macro F1 kandidat final IndoBERT.",
  },
  {
    id: "svm-accuracy",
    modelName: "SVM",
    modelVersion: researchResults.svmEvaluation.finalClassifier,
    sampleCount: researchResults.svmEvaluation.support,
    label: "Accuracy",
    value: researchResults.svmEvaluation.accuracy,
    description: "Accuracy classifier final merged_5class.",
  },
  {
    id: "svm-f1",
    modelName: "SVM",
    modelVersion: researchResults.svmEvaluation.finalClassifier,
    sampleCount: researchResults.svmEvaluation.support,
    label: "Macro F1",
    value: researchResults.svmEvaluation.f1Macro,
    description: "Macro F1 classifier final merged_5class.",
  },
];

const overviewMetrics = [
  {
    id: "overview-indobert-f1",
    label: "Macro F1 IndoBERT Final",
    value: researchResults.indobertEvaluation.f1Macro,
    description: researchResults.indobertEvaluation.finalCandidate,
    type: "metric",
  },
  {
    id: "overview-svm-f1",
    label: "Macro F1 SVM Final",
    value: researchResults.svmEvaluation.f1Macro,
    description: researchResults.svmEvaluation.finalClassifier,
    type: "metric",
  },
  {
    id: "overview-indobert-run",
    label: "Run IndoBERT Terpilih",
    value: researchResults.indobertEvaluation.finalCandidate,
    description: "Kandidat final untuk klasifikasi sentimen.",
    type: "text",
  },
  {
    id: "overview-svm-scenario",
    label: "Skenario SVM Terpilih",
    value: researchResults.svmEvaluation.finalClassifier,
    description: "Skenario final untuk klasifikasi aspek.",
    type: "text",
  },
];

const modelMetricComparisonData = [
  {
    metric: "Accuracy",
    indobert: researchResults.indobertEvaluation.accuracy * 100,
    svm: researchResults.svmEvaluation.accuracy * 100,
  },
  {
    metric: "Precision",
    indobert: researchResults.indobertEvaluation.precisionMacro * 100,
    svm: researchResults.svmEvaluation.precisionMacro * 100,
  },
  {
    metric: "Recall",
    indobert: researchResults.indobertEvaluation.recallMacro * 100,
    svm: researchResults.svmEvaluation.recallMacro * 100,
  },
  {
    metric: "Macro F1",
    indobert: researchResults.indobertEvaluation.f1Macro * 100,
    svm: researchResults.svmEvaluation.f1Macro * 100,
  },
] satisfies ModelMetricComparisonDatum[];

const confusionMatrixModels = [
  {
    id: "indobert",
    modelName: "IndoBERT",
    modelVersion: researchResults.indobertEvaluation.finalCandidate,
    sampleCount: researchResults.indobertEvaluation.support,
    matrix: researchResults.indobertEvaluation.confusionMatrix,
  },
  {
    id: "svm",
    modelName: "SVM",
    modelVersion: researchResults.svmEvaluation.finalClassifier,
    sampleCount: researchResults.svmEvaluation.support,
    matrix: researchResults.svmEvaluation.confusionMatrix,
  },
];

export default function ModelEvaluationPage() {
  return (
    <AppShell>
      <PageHeader
        description="Menampilkan bukti evaluasi model dari artefak riset untuk IndoBERT dan SVM."
        eyebrow="Evaluasi model"
        title="Evaluasi Model"
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {overviewMetrics.map((metric) => (
          <StatCard
            description={metric.description}
            key={metric.id}
            label={metric.label}
            tone="primary"
            value={
              metric.type === "metric" ? (
                formatPercent(Number(metric.value))
              ) : (
                <span className="block text-base leading-6 break-words">
                  {metric.value}
                </span>
              )
            }
          />
        ))}
      </section>

      <ChartCard
        description="Perbandingan metrik utama dari artefak evaluasi final. Tabel di bawah tetap menyediakan angka presisi."
        title="Perbandingan Metrik Model"
      >
        <ModelMetricComparisonChart data={modelMetricComparisonData} />
      </ChartCard>

      <section className="space-y-6">
        {confusionMatrixModels.map((model) => (
          <ChartCard
            description={`${model.modelName} ${model.modelVersion} dievaluasi pada ${model.sampleCount.toLocaleString("id-ID")} sampel uji.`}
            key={model.id}
            title={`Confusion Matrix - ${model.modelName}`}
          >
            <ConfusionMatrixTable matrix={model.matrix} />
          </ChartCard>
        ))}
      </section>

      <ChartCard
        description="Tabel ini merangkum metrik dari artefak evaluasi riset FE-15."
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
              render: (row) => row.label,
            },
            {
              key: "value",
              header: "Nilai",
              align: "right",
              render: (row) => formatPercent(row.value),
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
              render: (row) => row.description,
            },
          ]}
          data={modelMetrics}
          minWidthClassName="min-w-[920px]"
          rowKey={(row) => row.id}
        />
      </ChartCard>

      <SummaryCard
        description="Catatan evaluasi menjelaskan alasan pemilihan model dan batas interpretasi."
        title="Catatan Perbandingan Model"
      >
        <div className="grid gap-3 md:grid-cols-2">
          {[
            {
              id: "indobert",
              modelName: "IndoBERT",
              notes: researchResults.indobertEvaluation.notes,
            },
            {
              id: "svm",
              modelName: "SVM",
              notes: researchResults.svmEvaluation.notes,
            },
          ].map((model) => (
            <div
              className="rounded-md border border-border bg-background px-4 py-3"
              key={model.id}
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
          {researchResults.modelSelectionSummary.limitationNotes.join(" ")}
        </div>
      </SummaryCard>
    </AppShell>
  );
}
