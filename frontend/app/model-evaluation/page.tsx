import { ApiGatewayAlert } from "@/components/alerts/ApiGatewayAlert";
import { ChartCard } from "@/components/cards/ChartCard";
import { ModelMetricCard } from "@/components/cards/ModelMetricCard";
import { StatCard } from "@/components/cards/StatCard";
import { SummaryCard } from "@/components/cards/SummaryCard";
import { AppShell, PageHeader } from "@/components/layout";
import { SimpleTable } from "@/components/tables/SimpleTable";
import type { SimpleTableColumn } from "@/components/tables/SimpleTable";
import { EMPTY_GATEWAY_MESSAGE, safeGatewayData } from "@/lib/api-status";
import {
  EMPTY_EVALUATION_SUMMARY,
  EMPTY_TABLE_CELL,
  EMPTY_TEXT,
  formatPercent,
  recordNumber,
  selectedRecord,
  tableCellValue,
} from "@/lib/gateway-display";
import { getEvaluationSummary } from "@/services/evaluation-service";

export const dynamic = "force-dynamic";

interface EvaluationMetricRow {
  id: string;
  model: string;
  task: string;
  accuracy: string;
  precision: string;
  recall: string;
  f1Score: string;
  rocAuc: string;
  status: string;
}

function metricValue(record: Record<string, unknown>, keys: readonly string[]) {
  const value = keys
    .map((key) => record[key])
    .find((candidate): candidate is number =>
      typeof candidate === "number" && Number.isFinite(candidate),
    );

  return typeof value === "number" ? formatPercent(value) : EMPTY_TABLE_CELL;
}

function evaluationRows(evaluation: {
  indobert_run_comparison: Record<string, unknown>[];
  svm_scenario_comparison: Record<string, unknown>[];
}): EvaluationMetricRow[] {
  return [
    ...evaluation.indobert_run_comparison.map((record, index) => ({
      id: `indobert-${String(record.candidate_name ?? index)}`,
      model: "IndoBERT",
      task: tableCellValue(record.task, "Sentiment classification"),
      accuracy: metricValue(record, ["accuracy"]),
      precision: metricValue(record, ["precision_macro", "precision"]),
      recall: metricValue(record, ["recall_macro", "recall"]),
      f1Score: metricValue(record, ["f1_macro", "f1_score", "f1"]),
      rocAuc: metricValue(record, ["roc_auc", "rocAuc"]),
      status: tableCellValue(record.status),
    })),
    ...evaluation.svm_scenario_comparison.map((record, index) => ({
      id: `svm-${String(record.scenario ?? record.candidate_name ?? index)}`,
      model: "SVM",
      task: tableCellValue(record.task, "Aspect classification"),
      accuracy: metricValue(record, ["accuracy"]),
      precision: metricValue(record, ["precision_macro", "precision"]),
      recall: metricValue(record, ["recall_macro", "recall"]),
      f1Score: metricValue(record, ["f1_macro", "f1_score", "f1"]),
      rocAuc: metricValue(record, ["roc_auc", "rocAuc"]),
      status: tableCellValue(record.status),
    })),
  ];
}

const evaluationColumns = [
  {
    key: "no",
    header: "No",
    align: "center",
    className: "w-16",
    render: (_row, index) => index + 1,
  },
  {
    key: "model",
    header: "Model",
    render: (row) => <span className="font-medium text-foreground">{row.model}</span>,
  },
  {
    key: "task",
    header: "Task",
    className: "min-w-[180px]",
    render: (row) => row.task,
  },
  {
    key: "accuracy",
    header: "Accuracy",
    align: "right",
    render: (row) => row.accuracy,
  },
  {
    key: "precision",
    header: "Precision",
    align: "right",
    render: (row) => row.precision,
  },
  {
    key: "recall",
    header: "Recall",
    align: "right",
    render: (row) => row.recall,
  },
  {
    key: "f1Score",
    header: "F1-Score",
    align: "right",
    render: (row) => row.f1Score,
  },
  {
    key: "rocAuc",
    header: "ROC-AUC",
    align: "right",
    render: (row) => row.rocAuc,
  },
  {
    key: "status",
    header: "Status",
    render: (row) => row.status,
  },
] satisfies SimpleTableColumn<EvaluationMetricRow>[];

export default async function ModelEvaluationPage() {
  const evaluationResult = await safeGatewayData(
    getEvaluationSummary,
    EMPTY_EVALUATION_SUMMARY,
  );
  const evaluation = evaluationResult.data;
  const selectedIndobert = selectedRecord(
    evaluation.indobert_run_comparison,
    evaluation.selected_indobert_model,
  );
  const selectedSvm = selectedRecord(
    evaluation.svm_scenario_comparison,
    evaluation.selected_svm_model,
  );
  const overview = [
    {
      id: "indobert-macro-f1",
      label: "IndoBERT Macro F1",
      value: recordNumber(selectedIndobert, "f1_macro"),
      description: evaluation.selected_indobert_model,
    },
    {
      id: "indobert-weighted-f1",
      label: "IndoBERT Weighted F1",
      value: recordNumber(selectedIndobert, "f1_weighted"),
      description: evaluation.selected_indobert_model,
    },
    {
      id: "svm-macro-f1",
      label: "SVM Macro F1",
      value: recordNumber(selectedSvm, "f1_macro"),
      description: evaluation.selected_svm_model,
    },
    {
      id: "svm-weighted-f1",
      label: "SVM Weighted F1",
      value: recordNumber(selectedSvm, "f1_weighted"),
      description: evaluation.selected_svm_model,
    },
  ];
  const modelMetrics = [
    {
      id: "indobert-accuracy",
      label: "Akurasi",
      modelName: evaluation.selected_indobert_model,
      value: formatPercent(recordNumber(selectedIndobert, "accuracy")),
      description: "Akurasi kandidat IndoBERT terpilih.",
    },
    {
      id: "indobert-f1",
      label: "Macro F1",
      modelName: evaluation.selected_indobert_model,
      value: formatPercent(recordNumber(selectedIndobert, "f1_macro")),
      description: "Macro F1 kandidat IndoBERT terpilih.",
    },
    {
      id: "svm-accuracy",
      label: "Akurasi",
      modelName: evaluation.selected_svm_model,
      value: formatPercent(recordNumber(selectedSvm, "accuracy")),
      description: "Akurasi kandidat SVM terpilih.",
    },
    {
      id: "svm-f1",
      label: "Macro F1",
      modelName: evaluation.selected_svm_model,
      value: formatPercent(recordNumber(selectedSvm, "f1_macro")),
      description: "Macro F1 kandidat SVM terpilih.",
    },
  ];
  const comparisonRows = evaluationRows(evaluation);

  return (
    <AppShell>
      <PageHeader
        description="Menampilkan bukti evaluasi model untuk IndoBERT dan SVM."
        eyebrow="Evaluasi model"
        title="Evaluasi Model"
      />

      <ApiGatewayAlert error={evaluationResult.error} />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {overview.map((metric) => (
          <StatCard
            description={metric.description}
            key={metric.id}
            label={metric.label}
            tone="primary"
            value={formatPercent(metric.value)}
          />
        ))}
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {modelMetrics.map((metric) => (
          <ModelMetricCard
            description={metric.description}
            key={metric.id}
            label={metric.label}
            modelName={metric.modelName}
            value={metric.value}
          />
        ))}
      </section>

      <ChartCard
        description="Tabel ini merangkum metrik model yang tersedia."
        title="Laporan Klasifikasi / Ringkasan Evaluasi"
      >
        <SimpleTable
          columns={evaluationColumns}
          data={evaluationResult.isAvailable ? comparisonRows : []}
          emptyMessage={EMPTY_GATEWAY_MESSAGE}
          minWidthClassName="min-w-[1040px]"
          rowKey={(row) => row.id}
        />
      </ChartCard>

      <SummaryCard
        description="Catatan evaluasi membantu membaca batasan hasil model dan prioritisasi."
        title="Catatan Perbandingan Model"
      >
        <div className="grid gap-3 md:grid-cols-2">
          {(evaluationResult.isAvailable ? evaluation.limitations : []).map(
            (note) => (
              <p
                className="rounded-md border border-border bg-background px-4 py-3 text-sm leading-6 text-muted-foreground"
                key={note}
              >
                {note}
              </p>
            ),
          )}
        </div>
        <div className="mt-4 rounded-md border border-blue-100 bg-blue-50 px-4 py-3 text-sm leading-6 text-blue-900">
          {evaluationResult.isAvailable
            ? evaluation.expert_judgement_note || EMPTY_TEXT
            : EMPTY_TEXT}
        </div>
      </SummaryCard>
    </AppShell>
  );
}
