import { ApiGatewayAlert } from "@/components/alerts/ApiGatewayAlert";
import { ChartCard } from "@/components/cards/ChartCard";
import { StatCard } from "@/components/cards/StatCard";
import { SummaryCard } from "@/components/cards/SummaryCard";
import { AspectRankingChart } from "@/components/charts/AspectRankingChart";
import { AppShell, PageHeader } from "@/components/layout";
import { SimpleTable } from "@/components/tables/SimpleTable";
import { EMPTY_GATEWAY_MESSAGE, safeGatewayData } from "@/lib/api-status";
import {
  EMPTY_ASPECT_EVALUATION,
  EMPTY_ASPECT_SUMMARY,
  EMPTY_TEXT,
  aspectRankingData,
  formatPercent,
  recordNumber,
  selectedRecord,
} from "@/lib/gateway-display";
import {
  getAspectEvaluation,
  getAspectSummary,
} from "@/services/aspect-service";

export const dynamic = "force-dynamic";

export default async function AspectClassificationPage() {
  const [summaryResult, evaluationResult] = await Promise.all([
    safeGatewayData(getAspectSummary, EMPTY_ASPECT_SUMMARY),
    safeGatewayData(getAspectEvaluation, EMPTY_ASPECT_EVALUATION),
  ]);
  const summary = summaryResult.data;
  const evaluation = evaluationResult.data;
  const aspectRows = aspectRankingData(
    Object.keys(summary.negative_aspect_distribution).length
      ? summary.negative_aspect_distribution
      : summary.aspect_distribution,
  );
  const selectedMetrics = selectedRecord(
    evaluation.scenario_comparison,
    evaluation.selected_candidate,
  );
  const topAspect = aspectRows[0];
  const apiError = summaryResult.error ?? evaluationResult.error;

  return (
    <AppShell>
      <PageHeader
        description="Ringkasan klasifikasi aspek SVM dan distribusi aspek ulasan negatif."
        eyebrow="SVM"
        title="Klasifikasi Aspek"
      />

      <ApiGatewayAlert error={apiError} />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        <StatCard
          description="Total count dari distribusi aspek."
          label="Ulasan Diklasifikasi"
          value={aspectRows.reduce((total, row) => total + row.count, 0)}
        />
        <StatCard
          description="Aspek paling sering muncul pada ringkasan klasifikasi."
          label="Aspek Dominan"
          tone="primary"
          value={topAspect?.label ?? "-"}
        />
        <StatCard
          description="Aspek negatif dengan jumlah tertinggi."
          label="Aspek Negatif Utama"
          tone="negative"
          value={topAspect?.label ?? "-"}
        />
        <StatCard
          description="Data multi-aspek belum tersedia."
          label="Multi-aspek"
          value={0}
        />
        <StatCard
          description="Jumlah label final dari taxonomy aspek."
          label="Hasil Aspek"
          tone="primary"
          value={summary.final_aspect_labels.length}
        />
        <StatCard
          description={summary.model_status}
          label="Model"
          value={summary.selected_classifier}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <ChartCard
          description="Frekuensi aspek dari hasil klasifikasi."
          insight={
            topAspect
              ? `${topAspect.label} menjadi aspek tertinggi pada ringkasan klasifikasi.`
              : EMPTY_GATEWAY_MESSAGE
          }
          title="Frekuensi / Ranking Aspek"
        >
          <AspectRankingChart data={aspectRows} />
        </ChartCard>

        <SummaryCard
          description={
            summaryResult.isAvailable
              ? "Taxonomy final dari SVM merged_5class."
              : EMPTY_GATEWAY_MESSAGE
          }
          title="Taxonomy Aspek"
        >
          <SimpleTable
            columns={[
              {
                key: "label",
                header: "Kriteria",
                render: (row) => row.label,
              },
            ]}
            data={
              summary.final_aspect_labels.map((label) => ({
                id: label,
                label,
              }))
            }
            emptyMessage={EMPTY_GATEWAY_MESSAGE}
            minWidthClassName="min-w-[420px]"
            rowKey={(row) => row.id}
          />
        </SummaryCard>
      </section>

      <ChartCard
        description="Tabel hasil aspek batch ditampilkan hanya jika endpoint menyediakan data batch."
        title="Tabel Hasil Aspek"
      >
        <SimpleTable
          columns={[
            {
              key: "metric",
              header: "Metrik",
              render: (row) => row.metric,
            },
            {
              key: "value",
              header: "Nilai",
              align: "right",
              render: (row) => row.value,
            },
          ]}
          data={
            evaluationResult.isAvailable
              ? [
                  {
                    metric: "Macro F1",
                    value: formatPercent(recordNumber(selectedMetrics, "f1_macro")),
                  },
                  {
                    metric: "Akurasi",
                    value: formatPercent(recordNumber(selectedMetrics, "accuracy")),
                  },
                  {
                    metric: "Minimum Class F1",
                    value: formatPercent(recordNumber(selectedMetrics, "min_class_f1")),
                  },
                ]
              : []
          }
          emptyMessage={EMPTY_GATEWAY_MESSAGE}
          minWidthClassName="min-w-[560px]"
          rowKey={(row) => row.metric}
        />
      </ChartCard>

      <SummaryCard
        description="Catatan metodologi klasifikasi aspek."
        title="Catatan Klasifikasi Aspek"
      >
        <p className="rounded-md border border-border bg-background px-4 py-3 text-sm leading-6 text-muted-foreground">
          {summaryResult.isAvailable
            ? summary.weak_label_limitation || evaluation.limitations[0] || EMPTY_TEXT
            : EMPTY_TEXT}
        </p>
      </SummaryCard>
    </AppShell>
  );
}
