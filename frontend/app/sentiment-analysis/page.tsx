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
import { getReviews } from "@/services/review-service";
import { getSentimentSummary } from "@/services/sentiment-service";
import { getSentimentEvaluation } from "@/services/sentiment-service";
import { getRuntimeInferenceHistory } from "@/services/inference-service";
import { RuntimeInferencePanel } from "@/components/forms/RuntimeInferencePanel";
import type { GatewayReviewSample } from "@/types";
import type { RuntimeInferenceHistoryResponse } from "@/types/inference";
import { 
  recordNumber, 
  formatPercent, 
  EMPTY_TABLE_CELL, 
  EMPTY_TEXT, 
  sentimentDistributionData, 
  tableCellValue, 
  EMPTY_SENTIMENT_SUMMARY, 
  EMPTY_SENTIMENT_EVALUATION, 
  EMPTY_RANDOM_REVIEWS 
} from "@/lib/gateway-display";

export const dynamic = "force-dynamic";

/*--- EMPTY STATE FOR INFERENCE HISTORY -----------------------------------*/
const EMPTY_HISTORY: RuntimeInferenceHistoryResponse = {
  items: [],
  total: 0,
};

/*--- HELPERS -----------------------------------------------------------*/
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
      render: (row) => tableCellValue(row.final_sentiment ?? row.initial_sentiment),
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
  ] satisfies SimpleTableColumn<GatewayReviewSample>[];
}

/*--- INFERENCE DATA ----------------------------------------------------*/
async function fetchInferenceData() {
  const inferenceResult = await safeGatewayData(
    () => getRuntimeInferenceHistory({ limit: 20 }),
    EMPTY_HISTORY,
  );
  return {
    data: inferenceResult.data,
    error: inferenceResult.error,
  };
}

/*--- MAIN PAGE ----------------------------------------------------------*/
export default async function SentimentAnalysisPage() {
  /*--- FETCH SUMMARY, EVALUATION, REVIEWS, INFERENCE -------------------*/
  const [
    summaryResult,
    evaluationResult,
    reviewsResult,
    inferenceResult,
  ] = await Promise.all([
    safeGatewayData(getSentimentSummary, EMPTY_SENTIMENT_SUMMARY),
    safeGatewayData(getSentimentEvaluation, EMPTY_SENTIMENT_EVALUATION),
    safeGatewayData(() => getReviews({ limit: 10, seed: 40 }), EMPTY_RANDOM_REVIEWS),
    fetchInferenceData(),
  ]);

  const summary = summaryResult.data;
  const evaluation = evaluationResult.data;
  const reviews = reviewsResult.data.reviews;
  const inferenceData = inferenceResult.data;
  const inferenceError = inferenceResult.error;

  const sentimentRows = sentimentDistributionData(
    summary.final_sentiment_distribution,
  );
  const selectedMetrics = evaluation.selected_metrics;

  /*--- UI -------------------------------------------------------------*/
  return (
    <AppShell>
      {/* Header */}
      <PageHeader
        description="Ringkasan hasil analisis sentimen IndoBERT dari dataset penelitian."
        eyebrow="IndoBERT"
        title="Analisis Sentimen"
      />

      {/* API GATEWAY ALERT ------------------------------------------------*/}
      <ApiGatewayAlert error={inferenceError} />

      {/* STATISTICS CARDS ------------------------------------------------*/}
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
          description={summary.is_fallback ? "Model menggunakan fallback rule-based." : summary.model_status}
          label="Status Model"
          tone={summary.is_fallback ? "neutral" : "positive"}
          value={summary.is_fallback ? "Fallback" : "Aktif"}
        />
      </section>

      {/* CHART & SUMMARY -------------------------------------------------*/}
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
              value: "IndoBERT",
              description: "Model sentimen IndoBERT fine-tuned pada dataset penelitian.",
            },
            {
              label: "Status",
              value: summaryResult.isAvailable ? "Data tersedia" : EMPTY_TEXT,
              description: "Data mengikuti sumber penelitian terstruktur.",
            },
          ]}
          title="Hasil Prediksi Sentimen"
        />

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
            columns={sentimentResultColumns()}
            data={reviews}
            emptyMessage={EMPTY_GATEWAY_MESSAGE}
            minWidthClassName="min-w-[1180px]"
            rowKey={(row, index) => row.external_id ?? `sentiment-review-${index}`}
          />
        </ChartCard>
      </section>

      {/*--- RUNTIME INFERENCE SECTION --------------------------------------*/}
      <section className="mt-8">
        <PageHeader
          description="Analisis satu ulasan Spotify secara runtime serta riwayat hasil tersimpan."
          eyebrow="Runtime inference"
          title="Uji Ulasan"
        />
        <RuntimeInferencePanel
          initialGatewayError={inferenceError}
          initialHistory={inferenceData}
        />
      </section>
    </AppShell>
  );
}