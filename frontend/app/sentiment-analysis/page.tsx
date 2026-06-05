import { ApiGatewayAlert } from "@/components/alerts/ApiGatewayAlert";
import { SentimentBadge } from "@/components/badges/SentimentBadge";
import { ChartCard } from "@/components/cards/ChartCard";
import { StatCard } from "@/components/cards/StatCard";
import { SummaryCard } from "@/components/cards/SummaryCard";
import { SentimentDistributionChart } from "@/components/charts/SentimentDistributionChart";
import { AppShell, PageHeader } from "@/components/layout";
import { SimpleTable } from "@/components/tables/SimpleTable";
import { EMPTY_GATEWAY_MESSAGE, safeGatewayData } from "@/lib/api-status";
import {
  EMPTY_SENTIMENT_EVALUATION,
  EMPTY_SENTIMENT_SUMMARY,
  EMPTY_TEXT,
  formatPercent,
  recordNumber,
  selectedRecord,
  sentimentDistributionData,
} from "@/lib/gateway-display";
import {
  getSentimentEvaluation,
  getSentimentSummary,
} from "@/services/sentiment-service";

export const dynamic = "force-dynamic";

export default async function SentimentAnalysisPage() {
  const [summaryResult, evaluationResult] = await Promise.all([
    safeGatewayData(getSentimentSummary, EMPTY_SENTIMENT_SUMMARY),
    safeGatewayData(getSentimentEvaluation, EMPTY_SENTIMENT_EVALUATION),
  ]);
  const summary = summaryResult.data;
  const evaluation = evaluationResult.data;
  const sentimentRows = sentimentDistributionData(
    summary.final_sentiment_distribution,
  );
  const selectedMetrics = selectedRecord(
    evaluation.run_comparison,
    evaluation.selected_candidate,
  );
  const apiError = summaryResult.error ?? evaluationResult.error;

  return (
    <AppShell>
      <PageHeader
        description="Ringkasan hasil analisis sentimen IndoBERT dari dataset penelitian."
        eyebrow="IndoBERT"
        title="Analisis Sentimen"
      />

      <ApiGatewayAlert error={apiError} />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        <StatCard
          description="Jumlah dari distribusi sentimen."
          label="Total Ulasan"
          value={sentimentRows.reduce((total, row) => total + row.count, 0)}
        />
        <StatCard
          description="Distribusi dari /sentiment/summary."
          label="Positif"
          tone="positive"
          value={sentimentRows.find((row) => row.label === "positive")?.count ?? 0}
        />
        <StatCard
          description="Distribusi dari /sentiment/summary."
          label="Netral"
          tone="neutral"
          value={sentimentRows.find((row) => row.label === "neutral")?.count ?? 0}
        />
        <StatCard
          description="Distribusi dari /sentiment/summary."
          label="Negatif"
          tone="negative"
          value={sentimentRows.find((row) => row.label === "negative")?.count ?? 0}
        />
        <StatCard
          description="Confidence batch tidak dihitung di frontend."
          label="Confidence Rata-rata"
          tone="primary"
          value="0%"
        />
        <StatCard
          description={summary.model_status}
          label="Model"
          value={summary.selected_model}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <ChartCard
          description="Form ini menampilkan alur prediksi sentimen saat layanan tersedia."
          title="Input Ulasan Tunggal"
        >
          <div className="space-y-4">
            <label
              className="block text-sm font-medium text-foreground"
              htmlFor="sentiment-review-input"
            >
              Teks ulasan
            </label>
            <textarea
              className="min-h-32 w-full resize-none rounded-md border border-input bg-white px-3 py-2 text-sm leading-6 text-foreground outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
              id="sentiment-review-input"
              placeholder={EMPTY_GATEWAY_MESSAGE}
              readOnly
            />
            <button
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
              disabled
              type="button"
            >
              Jalankan Prediksi via Gateway
            </button>
          </div>
        </ChartCard>

        <SummaryCard
          description={
            summaryResult.isAvailable
              ? "Status model sentimen tersedia."
              : EMPTY_GATEWAY_MESSAGE
          }
          items={[
            {
              label: "Prediksi",
              value: <SentimentBadge />,
              description: "Belum ada prediksi tunggal aktif pada halaman ini.",
            },
            {
              label: "Macro F1",
              value: formatPercent(recordNumber(selectedMetrics, "f1_macro")),
              description: "Metrik kandidat final bila tersedia.",
            },
            {
              label: "Model",
              value: summary.selected_model,
              description: evaluation.selected_candidate,
            },
            {
              label: "Status",
              value: summaryResult.isAvailable ? "Data tersedia" : EMPTY_TEXT,
              description: "Data mengikuti sumber penelitian terstruktur.",
            },
          ]}
          title="Hasil Prediksi Sentimen"
        />
      </section>

      <ChartCard
        description="Ringkasan distribusi sentimen batch dari dataset penelitian."
        insight={
          sentimentRows.length > 0
            ? "Distribusi berasal dari output preprocessing/modeling."
            : EMPTY_GATEWAY_MESSAGE
        }
        title="Distribusi Sentimen"
      >
        <SentimentDistributionChart data={sentimentRows} />
      </ChartCard>

      <ChartCard
        description="Tabel hasil batch ditampilkan hanya jika endpoint menyediakan data batch."
        title="Tabel Hasil Sentimen"
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
            summaryResult.isAvailable
              ? [
                  {
                    metric: "Macro F1",
                    value: formatPercent(recordNumber(selectedMetrics, "f1_macro")),
                  },
                  {
                    metric: "Akurasi",
                    value: formatPercent(recordNumber(selectedMetrics, "accuracy")),
                  },
                ]
              : []
          }
          emptyMessage={EMPTY_GATEWAY_MESSAGE}
          minWidthClassName="min-w-[520px]"
          rowKey={(row) => row.metric}
        />
      </ChartCard>
    </AppShell>
  );
}
