"use client";

import { ApiGatewayAlert } from "@/components/alerts/ApiGatewayAlert";
import { ChartCard } from "@/components/cards/ChartCard";
import { StatCard } from "@/components/cards/StatCard";
import { RatingBarChart } from "@/components/charts/RatingBarChart";
import { SentimentDistributionChart } from "@/components/charts/SentimentDistributionChart";
import { YearReviewChart } from "@/components/charts/YearReviewChart";
import { AppShell, PageHeader } from "@/components/layout";
import { SimpleTable } from "@/components/tables/SimpleTable";
import type { SimpleTableColumn } from "@/components/tables/SimpleTable";
import { PageSkeleton } from "@/components/ui/SkeletonShimmer";
import { FadeIn } from "@/components/ui/FadeIn";
import { useCachedData } from "@/lib/data-cache";
import { EMPTY_GATEWAY_MESSAGE, safeGatewayData } from "@/lib/api-status";
import {
  EMPTY_DATASET_SUMMARY,
  EMPTY_RANDOM_REVIEWS,
  EMPTY_SCRAPING_SUMMARY,
  EMPTY_TABLE_CELL,
  ratingDistributionRows,
  sentimentDistributionData,
  tableCellValue,
  tableDateValue,
  yearlySentimentData,
} from "@/lib/gateway-display";
import { getDatasetSummary } from "@/services/dataset-service";
import { getReviews } from "@/services/review-service";
import { getScrapingSummary } from "@/services/scraping-service";
import type { GatewayReviewSample } from "@/types";

const COUNT_FORMATTER = new Intl.NumberFormat("id-ID");

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

const ShellPageSkeleton = () => (
  <AppShell>
    <PageHeader
      description="Dataset ulasan Spotify yang digunakan dalam penelitian — dari proses pengumpulan, hasil scraping, hingga dataset akhir yang siap dianalisis."
      eyebrow="Data dan kualitas"
      title="Dataset"
    />
    <PageSkeleton />
  </AppShell>
);

async function fetchDatasetPage() {
  const [dr, rr, sr] = await Promise.all([
    safeGatewayData(getDatasetSummary, EMPTY_DATASET_SUMMARY),
    safeGatewayData(() => getReviews({ limit: 10, seed: 10 }), EMPTY_RANDOM_REVIEWS),
    safeGatewayData(getScrapingSummary, EMPTY_SCRAPING_SUMMARY),
  ]);
  return {
    dataset: dr.data,
    reviews: rr.data.reviews ?? ([] as GatewayReviewSample[]),
    scraping: sr.data,
    apiError: dr.error ?? rr.error ?? sr.error,
  };
}

export default function DatasetPage() {
  const { data: state, loading } = useCachedData("dataset", fetchDatasetPage);

  if (loading) return <ShellPageSkeleton />;

  const { dataset, reviews, scraping, apiError } = state!;
  const ratingRows = ratingDistributionRows(dataset.rating_distribution);
  const sentimentRows = sentimentDistributionData(dataset.sentiment_distribution);
  const targetTotal = Object.entries(
    scraping.target_quota_per_rating ?? {},
  ).reduce((total, [, v]) => total + Number(v ?? 0), 0);
  const rawReviewCount =
    dataset.raw_review_count ?? scraping.total_achieved_rows ?? 0;
  const cleanReviewCount = dataset.total_review_count ?? 0;
  const appId =
    scraping.app_id ??
    (typeof dataset.source_application?.app_id === "string"
      ? dataset.source_application.app_id
      : null) ??
    "com.spotify.music";

  return (
    <FadeIn>
      <AppShell>
        <PageHeader
          description="Dataset ulasan Spotify yang digunakan dalam penelitian — dari proses pengumpulan, hasil scraping, hingga dataset akhir yang siap dianalisis."
          eyebrow="Data dan kualitas"
          title="Dataset"
        />
        <ApiGatewayAlert error={apiError} />

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            description="Target pengambilan data scraping."
            label="Target Ulasan"
            value={formatCount(targetTotal)}
          />
          <StatCard
            description="Jumlah ulasan sebelum filtering kualitas."
            label="Ulasan Mentah"
            value={formatCount(rawReviewCount)}
          />
          <StatCard
            description="Total ulasan valid setelah tahap filtering kualitas."
            label="Ulasan Bersih"
            tone="primary"
            value={formatCount(cleanReviewCount)}
          />
          <StatCard
            description="Nama paket aplikasi di Google Play Store."
            label="Aplikasi"
            value={appId}
          />
        </section>

        <ChartCard
          description="Distribusi ulasan per tahun berdasarkan sentimen."
          title="Ringkasan Dataset"
        >
          <YearReviewChart data={yearlySentimentData(dataset.yearly_sentiment_counts)} />
        </ChartCard>

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

        <ChartCard
          description="Sampel data mentah hasil scraping sebelum melalui tahap preprocessing dan modeling."
          title="Tabel Dataset Mentah"
        >
          <SimpleTable
            columns={datasetReviewColumns}
            data={reviews}
            emptyMessage={EMPTY_GATEWAY_MESSAGE}
            minWidthClassName="min-w-[880px]"
            rowKey={(row, index) => row.external_id ?? `dataset-review-${index}`}
          />
        </ChartCard>
      </AppShell>
    </FadeIn>
  );
}

function formatCount(value: number) {
  return COUNT_FORMATTER.format(value);
}
