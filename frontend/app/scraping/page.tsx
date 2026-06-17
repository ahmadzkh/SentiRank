import { ApiGatewayAlert } from "@/components/alerts/ApiGatewayAlert";
import { ChartCard } from "@/components/cards/ChartCard";
import { StatCard } from "@/components/cards/StatCard";
import { SummaryCard } from "@/components/cards/SummaryCard";
import { AppShell, PageHeader } from "@/components/layout";
import { SimpleTable } from "@/components/tables/SimpleTable";
import type { SimpleTableColumn } from "@/components/tables/SimpleTable";
import { EMPTY_GATEWAY_MESSAGE, safeGatewayData } from "@/lib/api-status";
import {
  EMPTY_RANDOM_REVIEWS,
  EMPTY_SCRAPING_SUMMARY,
  EMPTY_TABLE_CELL,
  EMPTY_TEXT,
  stringValue,
  tableCellValue,
  tableDateValue,
} from "@/lib/gateway-display";
import { getReviews } from "@/services/review-service";
import { getScrapingSummary } from "@/services/scraping-service";
import type { GatewayReviewSample, GatewayScrapingSummary } from "@/types";

export const dynamic = "force-dynamic";

function formatDate(value?: string | null) {
  if (!value) {
    return EMPTY_TEXT;
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

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
    key: "scrapeRequestId",
    header: "Scrape Request ID",
    render: (row) => tableCellValue(row.scrape_request_id),
  },
  {
    key: "appId",
    header: "App ID",
    className: "max-w-[180px]",
    render: (row) => (
      <span className="break-words">{tableCellValue(row.sourceAppId)}</span>
    ),
  },
  {
    key: "reviewText",
    header: "Review Text",
    className: "min-w-[320px] max-w-[460px]",
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
    key: "reviewDate",
    header: "Review Date",
    render: (row) => tableDateValue(row.reviewed_at),
  },
  {
    key: "scrapedAt",
    header: "Scraped At",
    render: (row) => tableDateValue(row.scraped_at),
  },
  {
    key: "status",
    header: "Status",
    render: (row) => tableCellValue(row.scraping_status, "Data tersedia"),
  },
] satisfies SimpleTableColumn<ScrapingPreviewRow>[];

export default async function ScrapingPage() {
  const [scrapingResult, reviewsResult] = await Promise.all([
    safeGatewayData(getScrapingSummary, EMPTY_SCRAPING_SUMMARY),
    safeGatewayData(() => getReviews({ limit: 10, seed: 20 }), EMPTY_RANDOM_REVIEWS),
  ]);
  const scraping = scrapingResult.data;
  const reviews = scrapingPreviewRows(reviewsResult.data.reviews, scraping);
  const apiError = scrapingResult.error ?? reviewsResult.error;
  const targetRows = Object.entries(scraping.target_quota_per_rating).map(
    ([rating, target]) => ({
      achieved: scraping.achieved_count_per_rating[rating] ?? 0,
      rating,
      target,
    }),
  );

  return (
    <AppShell>
      <PageHeader
        description="Status pengumpulan ulasan Spotify berdasarkan ringkasan scraping penelitian."
        eyebrow="Pengumpulan data"
        title="Scraping"
      />

      <ApiGatewayAlert error={apiError} />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        <StatCard
          description="Total target dari ringkasan quota scraping."
          label="Request Ulasan"
          value={targetRows.reduce((total, row) => total + row.target, 0)}
        />
        <StatCard
          description="Data yang tersedia dari artefak scraping."
          label="Terkumpul"
          tone="primary"
          value={scraping.total_achieved_rows ?? 0}
        />
        <StatCard
          description="Kegagalan scraping tidak dihitung di frontend."
          label="Gagal"
          tone="positive"
          value={0}
        />
        <StatCard
          description="Sumber aplikasi Spotify."
          label="Package"
          value={stringValue(scraping.app_id, EMPTY_TEXT)}
        />
        <StatCard
          description="Negara/bahasa dari ringkasan scraping."
          label="Region"
          value={stringValue(scraping.country, EMPTY_TEXT)}
        />
        <StatCard
          description="Status data scraping."
          label="Status Batch"
          tone="primary"
          value={scrapingResult.isAvailable ? "Data tersedia" : EMPTY_TEXT}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
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
              description: stringValue(scraping.app_title, EMPTY_TEXT),
            },
            {
              label: "Tanggal generate",
              value: formatDate(scraping.generated_at),
              description: "Timestamp dari ringkasan scraping jika tersedia.",
            },
            {
              label: "Bahasa",
              value: stringValue(scraping.lang, EMPTY_TEXT),
              description: "Bahasa target scraping.",
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
          description="Target dan capaian per rating dari artefak scraping."
          title="Quota Scraping"
        >
          <SimpleTable
            columns={[
              {
                key: "rating",
                header: "Rating",
                render: (row) => `${row.rating}/5`,
              },
              {
                key: "target",
                header: "Target",
                align: "right",
                render: (row) => row.target,
              },
              {
                key: "achieved",
                header: "Terkumpul",
                align: "right",
                render: (row) => row.achieved,
              },
            ]}
            data={targetRows}
            emptyMessage={EMPTY_GATEWAY_MESSAGE}
            minWidthClassName="min-w-[420px]"
            rowKey={(row) => `rating-${row.rating}`}
          />
        </ChartCard>
      </section>

      <ChartCard
        description="Ringkasan batch memperlihatkan output koleksi data tanpa memanggil scraper runtime."
        title="Ringkasan Batch Pengumpulan"
      >
        <SimpleTable
          columns={[
            {
              key: "rating",
              header: "Rating",
              render: (row) => `${row.rating}/5`,
            },
            {
              key: "target",
              header: "Request",
              align: "right",
              render: (row) => row.target,
            },
            {
              key: "achieved",
              header: "Terkumpul",
              align: "right",
              render: (row) => row.achieved,
            },
          ]}
          data={targetRows}
          emptyMessage={EMPTY_GATEWAY_MESSAGE}
          rowKey={(row) => `batch-${row.rating}`}
        />
      </ChartCard>

      <ChartCard
        description="Preview hasil pengumpulan data dari API Gateway. Jika Gateway tidak aktif, tabel kosong."
        title="Pratinjau Hasil Scraping"
      >
        <SimpleTable
          columns={scrapingPreviewColumns}
          data={reviews}
          emptyMessage={EMPTY_GATEWAY_MESSAGE}
          minWidthClassName="min-w-[1180px]"
          rowKey={(row, index) =>
            row.external_id ?? row.scrape_request_id ?? `scraping-review-${index}`
          }
        />
      </ChartCard>
    </AppShell>
  );
}
