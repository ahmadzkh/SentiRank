import { ApiGatewayAlert } from "@/components/alerts/ApiGatewayAlert";
import { SentimentBadge } from "@/components/badges/SentimentBadge";
import { ChartCard } from "@/components/cards/ChartCard";
import { StatCard } from "@/components/cards/StatCard";
import { SummaryCard } from "@/components/cards/SummaryCard";
import { SentimentDistributionChart } from "@/components/charts/SentimentDistributionChart";
import { AppShell, PageHeader } from "@/components/layout";
import { SimpleTable } from "@/components/tables/SimpleTable";
import type { SimpleTableColumn } from "@/components/tables/SimpleTable";
import { EMPTY_GATEWAY_MESSAGE, safeGatewayData } from "@/lib/api-status";
import {
  EMPTY_RANDOM_REVIEWS,
  EMPTY_SENTIMENT_EVALUATION,
  EMPTY_SENTIMENT_SUMMARY,
  EMPTY_TABLE_CELL,
  EMPTY_TEXT,
  formatPercent,
  recordNumber,
  selectedRecord,
  sentimentDistributionData,
  tableCellValue,
} from "@/lib/gateway-display";
import { getReviews } from "@/services/review-service";
import {
  getSentimentEvaluation,
  getSentimentSummary,
} from "@/services/sentiment-service";
import type { GatewayReviewSample } from "@/types";

export const dynamic = "force-dynamic";

function cleanedReviewText(row: GatewayReviewSample) {
  return tableCellValue(
    row.cleaned_content ??
      row.cleaned_text ??
      row.text_indobert ??
      row.text_svm,
  );
}

function confidenceValue(value: number | null | undefined) {
  return typeof value === "number" && Number.isFinite(value)
    ? formatPercent(value)
    : EMPTY_TABLE_CELL;
}

function sentimentResultColumns(
  modelVersion: string,
): readonly SimpleTableColumn<GatewayReviewSample>[] {
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
      header: "Cleaned Review",
      className: "min-w-[320px] max-w-[460px]",
      render: (row) => (
        <span className="line-clamp-3 break-words font-medium text-foreground">
          {cleanedReviewText(row)}
        </span>
      ),
    },
    {
      key: "actualWeakLabel",
      header: "Actual/Weak Label",
      render: (row) =>
        tableCellValue(row.final_sentiment ?? row.initial_sentiment),
    },
    {
      key: "predictedSentiment",
      header: "Predicted Sentiment",
      render: (row) => tableCellValue(row.predicted_sentiment),
    },
    {
      key: "confidence",
      header: "Confidence",
      align: "right",
      render: (row) => confidenceValue(row.sentiment_confidence),
    },
    {
      key: "model",
      header: "Model",
      render: () => "IndoBERT",
    },
    {
      key: "modelVersion",
      header: "Model Version",
      className: "min-w-[180px]",
      render: () => modelVersion,
    },
    {
      key: "predictionSource",
      header: "Prediction Source",
      render: (row) => tableCellValue(row.sentiment_prediction_source),
    },
  ] satisfies SimpleTableColumn<GatewayReviewSample>[];
}

export default async function SentimentAnalysisPage() {
  const [summaryResult, evaluationResult, reviewsResult] = await Promise.all([
    safeGatewayData(getSentimentSummary, EMPTY_SENTIMENT_SUMMARY),
    safeGatewayData(getSentimentEvaluation, EMPTY_SENTIMENT_EVALUATION),
    safeGatewayData(
      () => getReviews({ limit: 10, seed: 40 }),
      EMPTY_RANDOM_REVIEWS,
    ),
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
  const reviews = reviewsResult.data.reviews;
  const apiError =
    summaryResult.error ?? evaluationResult.error ?? reviewsResult.error;

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
          value={
            sentimentRows.find((row) => row.label === "positive")?.count ?? 0
          }
        />
        <StatCard
          description="Distribusi dari /sentiment/summary."
          label="Netral"
          tone="neutral"
          value={
            sentimentRows.find((row) => row.label === "neutral")?.count ?? 0
          }
        />
        <StatCard
          description="Distribusi dari /sentiment/summary."
          label="Negatif"
          tone="negative"
          value={
            sentimentRows.find((row) => row.label === "negative")?.count ?? 0
          }
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
          value="IndoBERT"
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
        description="Tabel ini menampilkan sampel hasil sentimen jika field prediksi tersedia dari API Gateway."
        title="Tabel Hasil Sentimen"
      >
        <SimpleTable
          columns={sentimentResultColumns(
            summaryResult.isAvailable
              ? summary.selected_model
              : EMPTY_TABLE_CELL,
          )}
          data={reviewsResult.isAvailable ? reviews : []}
          emptyMessage={EMPTY_GATEWAY_MESSAGE}
          minWidthClassName="min-w-[1180px]"
          rowKey={(row, index) =>
            row.external_id ?? `sentiment-review-${index}`
          }
        />
      </ChartCard>
    </AppShell>
  );
}
