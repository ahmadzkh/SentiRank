import { ApiGatewayAlert } from "@/components/alerts/ApiGatewayAlert";
import { ChartCard } from "@/components/cards/ChartCard";
import { StatCard } from "@/components/cards/StatCard";
import { SummaryCard } from "@/components/cards/SummaryCard";
import { RatingBarChart } from "@/components/charts/RatingBarChart";
import { SentimentDistributionChart } from "@/components/charts/SentimentDistributionChart";
import { YearReviewChart } from "@/components/charts/YearReviewChart";
import { AppShell, PageHeader } from "@/components/layout";
import { SimpleTable } from "@/components/tables/SimpleTable";
import type { SimpleTableColumn } from "@/components/tables/SimpleTable";
import { EMPTY_GATEWAY_MESSAGE, safeGatewayData } from "@/lib/api-status";
import {
  EMPTY_DATASET_SUMMARY,
  EMPTY_RANDOM_REVIEWS,
  EMPTY_SCRAPING_SUMMARY,
  EMPTY_TABLE_CELL,
  EMPTY_TEXT,
  ratingDistributionRows,
  sentimentDistributionData,
  stringValue,
  tableCellValue,
  tableDateValue,
  yearlySentimentData,
} from "@/lib/gateway-display";
import { getDatasetSummary } from "@/services/dataset-service";
import { getReviews } from "@/services/review-service";
import { getScrapingSummary } from "@/services/scraping-service";
import type { GatewayReviewSample } from "@/types";

export const dynamic = "force-dynamic";

const datasetReviewColumns = [
  {
    key: "no",
    header: "No",
    align: "center" as const,
    className: "w-16",
    render: (_row: GatewayReviewSample, index: number) => index + 1,
  },
  {
    key: "originalReview",
    header: "Teks Ulasan",
    className: "min-w-[320px] max-w-[480px]",
    render: (row: GatewayReviewSample) => tableCellValue(row.content),
  },
  {
    key: "rating",
    header: "Rating",
    align: "right" as const,
    render: (row: GatewayReviewSample) =>
      row.rating ? `${row.rating}/5` : EMPTY_TABLE_CELL,
  },
  {
    key: "sentiment",
    header: "Sentimen",
    render: (row: GatewayReviewSample) =>
      tableCellValue(row.final_sentiment ?? row.initial_sentiment),
  },
  {
    key: "reviewDate",
    header: "Tanggal",
    render: (row: GatewayReviewSample) => tableDateValue(row.reviewed_at),
  },
] satisfies SimpleTableColumn<GatewayReviewSample>[];

export default async function DatasetPage() {
  const [datasetResult, reviewsResult, scrapingResult] = await Promise.all([
    safeGatewayData(getDatasetSummary, EMPTY_DATASET_SUMMARY),
    safeGatewayData(() => getReviews({ limit: 10, seed: 10 }), EMPTY_RANDOM_REVIEWS),
    safeGatewayData(getScrapingSummary, EMPTY_SCRAPING_SUMMARY),
  ]);
  const dataset = datasetResult.data;
  const ratingRows = ratingDistributionRows(dataset.rating_distribution);
  const sentimentRows = sentimentDistributionData(dataset.sentiment_distribution);
  const reviews = reviewsResult.data.reviews;
  const scraping = scrapingResult.data;
  const apiError = datasetResult.error ?? reviewsResult.error ?? scrapingResult.error;

  return (
    <AppShell>
      <PageHeader
        description="Dataset ulasan Spotify yang digunakan dalam penelitian — dari proses pengumpulan, hasil scraping, hingga dataset akhir yang siap dianalisis."
        eyebrow="Data dan kualitas"
        title="Dataset"
      />
      <ApiGatewayAlert error={apiError} />

      {/* ── Ringkasan Dataset ── */}
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          description="Total ulasan valid setelah tahap filtering kualitas."
          label="Total Ulasan Bersih"
          value={dataset.total_review_count ?? 0}
        />
        <StatCard
          description="Jumlah ulasan sebelum filtering kualitas."
          label="Ulasan Mentah"
          value={dataset.raw_review_count ?? 0}
        />
        <StatCard
          description="Ulasan yang dihapus saat tahap filtering kualitas."
          label="Ulasan Dihapus"
          tone="negative"
          value={dataset.dropped_review_count ?? 0}
        />
        <StatCard
          description="Persentase ulasan yang memiliki label sentimen."
          label="Cakupan Label"
          tone="primary"
          value={sentimentRows.length > 0 ? "100%" : "0%"}
        />
      </section>

      <SummaryCard
        className="mt-8"
        description={
          datasetResult.isAvailable
            ? "Ringkasan dataset penelitian tersedia."
            : EMPTY_GATEWAY_MESSAGE
        }
        items={[
          {
            label: "Total ulasan bersih",
            value: dataset.total_review_count ?? 0,
            description: `${dataset.raw_review_count ?? 0} mentah, ${dataset.dropped_review_count ?? 0} dihapus.`,
          },
          {
            label: "Sumber",
            value: "Google Play Store - Spotify",
            description: "com.spotify.music",
          },
        ]}
        title="Ringkasan Dataset"
      >
        <YearReviewChart data={yearlySentimentData(dataset.yearly_sentiment_counts)} />
      </SummaryCard>

      <hr className="my-10 border-border" />

      {/* ── Scraping ── */}
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          description="Target pengambilan data."
          label="Target Ulasan"
          value={(() => {
            const targetRows = Object.entries(
              scraping.target_quota_per_rating ?? {},
            );
            return targetRows.reduce((total, [, v]) => total + (v ?? 0), 0);
          })()}
        />
        <StatCard
          description="Jumlah ulasan yang berhasil dikumpulkan."
          label="Terkumpul"
          tone="primary"
          value={scraping.total_achieved_rows ?? 0}
        />
        <StatCard
          description="Nama paket aplikasi."
          label="Aplikasi"
          value={stringValue(scraping.app_id, EMPTY_TEXT)}
        />
        <StatCard
          description="Status ketersediaan data."
          label="Status Data"
          tone={scrapingResult.isAvailable ? "positive" : "neutral"}
          value={scrapingResult.isAvailable ? "Data tersedia" : EMPTY_TEXT}
        />
      </section>

      <SummaryCard
        className="mt-8"
        description={
          scrapingResult.isAvailable
            ? "Ringkasan hasil scraping."
            : EMPTY_GATEWAY_MESSAGE
        }
        items={[
          {
            label: "Sumber",
            value: stringValue(scraping.source_name, EMPTY_TEXT),
            description: stringValue(scraping.app_id, EMPTY_TEXT),
          },
          {
            label: "Total terkumpul",
            value: scraping.total_achieved_rows ?? 0,
            description: "Jumlah ulasan yang berhasil dikumpulkan.",
          },
          {
            label: "Catatan rating 3",
            value: stringValue(
              scraping.rating_3_limitation_note,
              "Tidak ada catatan",
            ),
            description: "Keterbatasan pengumpulan rating 3.",
          },
          {
            label: "Mode akses",
            value: scrapingResult.isAvailable
              ? "Data tersedia"
              : EMPTY_TEXT,
            description:
              "Frontend hanya membaca hasil, tidak menjalankan scraper.",
          },
        ]}
        title="Ringkasan Scraping"
      />

      <hr className="my-10 border-border" />

      {/* ── Distribusi ── */}
      <section className="grid gap-6 xl:grid-cols-2">
        <ChartCard
          description="Distribusi label sentimen dataset."
          insight={
            sentimentRows.length > 0
              ? "Label dari hasil scraping awal."
              : EMPTY_GATEWAY_MESSAGE
          }
          title="Distribusi Label Sentimen"
        >
          <SentimentDistributionChart data={sentimentRows} />
        </ChartCard>

        <ChartCard
          description="Distribusi rating dari dataset scraping awal."
          title="Distribusi Rating"
        >
          <RatingBarChart
            data={ratingRows}
            description="Data awal hasil scraping dari Google Play Store."
          />
        </ChartCard>
      </section>

      {/* ── Tabel Dataset Mentah ── */}
      <ChartCard
        className="mt-8"
        description="Sampel data mentah hasil scraping sebelum melalui tahap preprocessing dan modeling."
        title="Tabel Dataset Mentah"
      >
        <SimpleTable
          columns={datasetReviewColumns}
          data={reviews}
          emptyMessage={EMPTY_GATEWAY_MESSAGE}
          minWidthClassName="min-w-[880px]"
          rowKey={(row, index) =>
            row.external_id ?? `dataset-review-${index}`
          }
        />
      </ChartCard>
    </AppShell>
  );
}
