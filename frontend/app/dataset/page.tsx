import { ApiGatewayAlert } from "@/components/alerts/ApiGatewayAlert";
import { ChartCard } from "@/components/cards/ChartCard";
import { StatCard } from "@/components/cards/StatCard";
import { SummaryCard } from "@/components/cards/SummaryCard";
import { SentimentDistributionChart } from "@/components/charts/SentimentDistributionChart";
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
} from "@/lib/gateway-display";
import { getDatasetSummary } from "@/services/dataset-service";
import { getReviews } from "@/services/review-service";
import { getScrapingSummary } from "@/services/scraping-service";
import type { GatewayReviewSample } from "@/types";
import type { GatewayScrapingSummary } from "@/types";

export const dynamic = "force-dynamic";

type RatingRow = ReturnType<typeof ratingDistributionRows>[number];

const ratingColumns = [
  {
    key: "rating",
    header: "Rating",
    render: (row) => `${row.rating}/5`,
  },
  {
    key: "count",
    header: "Jumlah",
    align: "right",
    render: (row) => row.count,
  },
  {
    key: "share",
    header: "Proporsi",
    align: "right",
    render: (row) => `${row.share}%`,
  },
] satisfies SimpleTableColumn<RatingRow>[];

const datasetReviewColumns = [
  {
    key: "no",
    header: "No",
    align: "center",
    className: "w-16",
    render: (_row, index) => index + 1,
  },
  {
    key: "reviewId",
    header: "Review ID",
    className: "max-w-[180px]",
    render: (row) => tableCellValue(row.external_id),
  },
  {
    key: "originalReview",
    header: "Original Review",
    className: "min-w-[320px] max-w-[420px]",
    render: (row) => tableCellValue(row.content),
  },
  {
    key: "rating",
    header: "Rating",
    align: "right",
    render: (row) => (row.rating ? `${row.rating}/5` : EMPTY_TABLE_CELL),
  },
  {
    key: "sentiment",
    header: "Sentimen",
    render: (row) => tableCellValue(row.final_sentiment ?? row.initial_sentiment),
  },
  {
    key: "aspect",
    header: "Aspek",
    render: (row) => tableCellValue(row.aspect_label),
  },
  {
    key: "reviewDate",
    header: "Review Date",
    render: (row) => tableDateValue(row.reviewed_at),
  },
  {
    key: "source",
    header: "Source",
    render: (row) => tableCellValue(row.source),
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

  // Scraping helper functions
  function scrapingPreviewRows(
    reviews: readonly GatewayReviewSample[],
    scraping: GatewayScrapingSummary,
  ) {
    return reviews.map((review) => ({
      ...review,
      sourceAppId: review.app_id ?? scraping.app_id,
    }));
  }
  type ScrapingPreviewRow = ReturnType<typeof scrapingPreviewRows>[number];

  const scrapingPreviewColumns = [
    {
      key: "no",
      header: "No",
      align: "center",
      className: "w-16",
      render: (_row, index) => index + 1,
    },
    {
      key: "reviewText",
      header: "Review Text",
      className: "min-w-[320px] max-w-[460px]",
      render: (row) => tableCellValue(row.content),
    },
    {
      key: "rating",
      header: "Rating",
      align: "right",
      render: (row) => (row.rating ? `${row.rating}/5` : EMPTY_TABLE_CELL),
    },
    {
      key: "sentiment",
      header: "Sentimen",
      render: (row) =>
        tableCellValue(row.final_sentiment ?? row.initial_sentiment),
    },
    {
      key: "reviewDate",
      header: "Review Date",
      render: (row) => tableDateValue(row.reviewed_at),
    },
  ] satisfies SimpleTableColumn<ScrapingPreviewRow>[];

  return (
    <AppShell>
      <PageHeader
        description="Pemeriksaan sumber data, kualitas dataset, distribusi label, dan tabel ulasan Spotify sebelum masuk ke pipeline analisis."
        eyebrow="Data dan kualitas"
        title="Dataset"
      />
      <ApiGatewayAlert error={apiError} />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          description={dataset.data_status ? `Status: ${dataset.data_status}` : "Menunggu data dari API."}
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
          description="Cakupan label ditentukan dari distribusi sentimen."
          label="Cakupan Label"
          tone="primary"
          value={sentimentRows.length > 0 ? "100%" : "0%"}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,9fr)_minmax(0,1.1fr)]">
        <SummaryCard
          description={
            datasetResult.isAvailable
              ? "Ringkasan dataset penelitian tersedia."
              : EMPTY_GATEWAY_MESSAGE
          }
          items={[
            {
              label: "Status Dataset",
              value: stringValue(dataset.data_status, "Tidak diketahui"),
              description: "Status kanonik dataset yang digunakan.",
            },
            {
              label: "Rentang tanggal",
              value:
                dataset.review_period.reviewed_at_min &&
                dataset.review_period.reviewed_at_max
                  ? `${dataset.review_period.reviewed_at_min} sampai ${dataset.review_period.reviewed_at_max}`
                  : EMPTY_TEXT,
              description: "Rentang ulasan dari artefak data acquisition.",
            },
            {
              label: "Total ulasan bersih",
              value: dataset.total_review_count ?? 0,
              description: `${dataset.raw_review_count ?? 0} mentah, ${dataset.dropped_review_count ?? 0} dihapus.` ,
            },
            {
              label: "Sumber",
              value: "Google Play Store - Spotify",
              description: "com.spotify.music",
            },
          ]}
          title="Ringkasan Dataset"
        />

        {/* Scraping section */}
        <section className="mt-8">
          <PageHeader
            description="Status pengumpulan ulasan Spotify serta ringkasan batch scraping."
            eyebrow="Pengumpulan data"
            title="Scraping"
          />
          <ApiGatewayAlert error={scrapingResult.error} />
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard
              description="Total target dari ringkasan quota scraping."
              label="Request Ulasan"
              value={(() => {
                const targetRows = Object.entries(scraping.target_quota_per_rating ?? {});
                return targetRows.reduce((total, [, v]) => total + (v ?? 0), 0);
              })()}
            />
            <StatCard
              description="Data yang tersedia dari artefak scraping."
              label="Terkumpul"
              tone="primary"
              value={scraping.total_achieved_rows ?? 0}
            />
            <StatCard
              description="Sumber aplikasi Spotify."
              label="Package"
              value={stringValue(scraping.app_id, EMPTY_TEXT)}
            />
            <StatCard
              description="Status data scraping."
              label="Status"
              tone={scrapingResult.isAvailable ? "positive" : "neutral"}
              value={scrapingResult.isAvailable ? "Data tersedia" : EMPTY_TEXT}
            />
          </section>

          <SummaryCard
            description={
              scrapingResult.isAvailable
                ? "Ringkasan scraping penelitian tersedia."
                : EMPTY_GATEWAY_MESSAGE
            }
            items={[
              {
                label: "Source",
                value: stringValue(scraping.source_name, EMPTY_TEXT),
                description: stringValue(scraping.app_id, EMPTY_TEXT),
              },
              {
                label: "Total Terkumpul",
                value: scraping.total_achieved_rows ?? 0,
                description: "Jumlah ulasan yang berhasil dikumpulkan.",
              },
              {
                label: "Catatan Rating 3",
                value: stringValue(scraping.rating_3_limitation_note, "Tidak ada catatan"),
                description: "Keterbatasan pengumpulan rating 3.",
              },
              {
                label: "Mode",
                value: scrapingResult.isAvailable ? "Data tersedia" : EMPTY_TEXT,
                description: "Frontend hanya membaca hasil, tidak menjalankan scraper.",
              },
            ]}
            title="Ringkasan Status Scraping"
          />

          <ChartCard
            description="Pratinjau Hasil Scraping"
            title="Pratinjau Hasil Scraping"
          >
            <SimpleTable
              columns={scrapingPreviewColumns}
              data={scrapingPreviewRows(reviews, scraping)}
              emptyMessage={EMPTY_GATEWAY_MESSAGE}
              minWidthClassName="min-w-[1180px]"
              rowKey={(row, index) => row.external_id ?? row.scrape_request_id ?? `scraping-review-${index}`}
            />
          </ChartCard>
        </section>
        {/* End of Scraping section */}

        <ChartCard
          description="Distribusi rating ulasan Spotify dari dataset penelitian."
          title="Distribusi Rating"
        >
          <SimpleTable
            columns={ratingColumns}
            data={ratingRows}
            emptyMessage={EMPTY_GATEWAY_MESSAGE}
            minWidthClassName="min-w-[420px]"
            rowKey={(row) => `rating-${row.rating}`}
          />
        </ChartCard>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <ChartCard
          description="Distribusi label sentimen awal dari dataset penelitian."
          insight={
            sentimentRows.length > 0
              ? "Distribusi ini berasal dari output data acquisition."
              : EMPTY_GATEWAY_MESSAGE
          }
          title="Distribusi Label Sentimen"
        >
          <SentimentDistributionChart data={sentimentRows} />
        </ChartCard>

        <ChartCard
          description="Distribusi rating ulasan Spotify dari dataset penelitian."
          title="Distribusi Rating"
        >
          <SimpleTable
            columns={ratingColumns}
            data={ratingRows}
            emptyMessage={EMPTY_GATEWAY_MESSAGE}
            minWidthClassName="min-w-[420px]"
            rowKey={(row) => `rating-${row.rating}`}
          />
        </ChartCard>
      </section>

      <ChartCard
        description="Tabel ini berfokus pada data mentah sebelum preprocessing dan model inference."
        title="Tabel Dataset Mentah"
      >
        <SimpleTable
          columns={datasetReviewColumns}
          data={reviews}
          emptyMessage={EMPTY_GATEWAY_MESSAGE}
          minWidthClassName="min-w-[1180px]"
          rowKey={(row, index) => row.external_id ?? `dataset-review-${index}`}
        />
      </ChartCard>
    </AppShell>
  );
}