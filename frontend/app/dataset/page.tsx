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
import type { GatewayReviewSample } from "@/types";

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
    render: (row) => (
      <span className="line-clamp-2 break-all text-muted-foreground">
        {tableCellValue(row.external_id)}
      </span>
    ),
  },
  {
    key: "originalReview",
    header: "Original Review",
    className: "min-w-[320px] max-w-[420px]",
    render: (row) => (
      <span className="line-clamp-3 break-words font-medium text-foreground">
        {tableCellValue(row.content)}
      </span>
    ),
  },
  {
    key: "rating",
    header: "Rating",
    align: "right",
    render: (row) => (row.rating ? `${row.rating}/5` : EMPTY_TABLE_CELL),
  },
  {
    key: "thumbsUp",
    header: "Thumbs Up",
    align: "right",
    render: (row) => tableCellValue(row.thumbs_up_count),
  },
  {
    key: "appVersion",
    header: "App Version",
    render: (row) => tableCellValue(row.app_version),
  },
  {
    key: "reviewDate",
    header: "Review Date",
    render: (row) => tableDateValue(row.reviewed_at),
  },
  {
    key: "sourceApp",
    header: "Source App",
    render: (row) => tableCellValue(row.app_id ?? row.source),
  },
] satisfies SimpleTableColumn<GatewayReviewSample>[];

export default async function DatasetPage() {
  const [datasetResult, reviewsResult] = await Promise.all([
    safeGatewayData(getDatasetSummary, EMPTY_DATASET_SUMMARY),
    safeGatewayData(() => getReviews({ limit: 10, seed: 10 }), EMPTY_RANDOM_REVIEWS),
  ]);
  const dataset = datasetResult.data;
  const sourceApplication = dataset.source_application;
  const ratingRows = ratingDistributionRows(dataset.rating_distribution);
  const sentimentRows = sentimentDistributionData(dataset.sentiment_distribution);
  const reviews = reviewsResult.data.reviews;
  const apiError = datasetResult.error ?? reviewsResult.error;

  return (
    <AppShell>
      <PageHeader
        description="Pemeriksaan sumber data, kualitas dataset, distribusi label, dan tabel ulasan Spotify sebelum masuk ke pipeline analisis."
        eyebrow="Data dan kualitas"
        title="Dataset"
      />

      <ApiGatewayAlert error={apiError} />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        <StatCard
          description={stringValue(sourceApplication.title, EMPTY_TEXT)}
          label="Total Baris"
          value={dataset.total_review_count ?? 0}
        />
        <StatCard
          description="Nilai berasal dari ringkasan dataset."
          label="Ulasan Unik"
          tone="positive"
          value={0}
        />
        <StatCard
          description="Data duplikasi belum tersedia."
          label="Duplikasi"
          value={0}
        />
        <StatCard
          description="Ringkasan missing value ditampilkan pada tabel kualitas."
          label="Nilai Kosong"
          tone="positive"
          value={0}
        />
        <StatCard
          description="Cakupan label ditentukan dari distribusi sentimen."
          label="Cakupan Label"
          tone="primary"
          value={sentimentRows.length > 0 ? "100%" : "0%"}
        />
        <StatCard
          description="Rating rata-rata tidak dihitung di frontend."
          label="Rating Rata-rata"
          value="0/5"
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <SummaryCard
          description={
            datasetResult.isAvailable
              ? "Ringkasan dataset penelitian tersedia."
              : EMPTY_GATEWAY_MESSAGE
          }
          items={[
            {
              label: "Status import",
              value: datasetResult.isAvailable ? "Data tersedia" : EMPTY_TEXT,
              description: "Data mengikuti sumber penelitian terstruktur.",
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
              label: "Baris diproses",
              value: dataset.total_review_count ?? 0,
              description: "Mengikuti total baris pada ringkasan dataset.",
            },
            {
              label: "Sumber",
              value: stringValue(sourceApplication.source_name, EMPTY_TEXT),
              description: stringValue(sourceApplication.app_id, EMPTY_TEXT),
            },
          ]}
          title="Ringkasan Dataset"
        />

        <ChartCard
          description="Validasi kualitas data penting sebelum preprocessing dan pemodelan."
          title="Kualitas Data"
        >
          <SimpleTable
            columns={[
              {
                key: "label",
                header: "Pemeriksaan",
                render: (row) => (
                  <span className="font-medium text-foreground">
                    {row.label}
                  </span>
                ),
              },
              {
                key: "value",
                header: "Nilai",
                render: (row) => row.value,
              },
              {
                key: "status",
                header: "Status",
                render: (row) => (
                  <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-medium text-slate-700">
                    {row.status}
                  </span>
                ),
              },
              {
                key: "note",
                header: "Catatan",
                render: (row) => row.note,
              },
            ]}
            data={
              datasetResult.isAvailable
                ? Object.entries(dataset.dataset_availability).map(([key, value]) => ({
                    id: key,
                    label: key,
                    note: value ? "Tersedia" : "Tidak tersedia",
                    status: value ? "available" : "missing",
                    value: value ? "Ya" : "Tidak",
                  }))
                : []
            }
            emptyMessage={EMPTY_GATEWAY_MESSAGE}
            minWidthClassName="min-w-[680px]"
            rowKey={(row) => row.id}
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
