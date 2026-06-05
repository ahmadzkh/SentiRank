import { ApiGatewayAlert } from "@/components/alerts/ApiGatewayAlert";
import { ChartCard } from "@/components/cards/ChartCard";
import { StatCard } from "@/components/cards/StatCard";
import { SummaryCard } from "@/components/cards/SummaryCard";
import { AppShell, PageHeader } from "@/components/layout";
import { SimpleTable } from "@/components/tables/SimpleTable";
import { EMPTY_GATEWAY_MESSAGE, safeGatewayData } from "@/lib/api-status";
import {
  EMPTY_RANDOM_REVIEWS,
  EMPTY_SCRAPING_SUMMARY,
  EMPTY_TEXT,
  reviewSamplesToReviews,
  stringValue,
} from "@/lib/gateway-display";
import { getReviews } from "@/services/review-service";
import { getScrapingSummary } from "@/services/scraping-service";

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

export default async function ScrapingPage() {
  const [scrapingResult, reviewsResult] = await Promise.all([
    safeGatewayData(getScrapingSummary, EMPTY_SCRAPING_SUMMARY),
    safeGatewayData(() => getReviews({ limit: 10, seed: 20 }), EMPTY_RANDOM_REVIEWS),
  ]);
  const scraping = scrapingResult.data;
  const reviews = reviewSamplesToReviews(reviewsResult.data.reviews);
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
        description="Ulasan mentah dari dataset penelitian."
        title="Pratinjau Ulasan Mentah"
      >
        <SimpleTable
          columns={[
            {
              key: "text",
              header: "Ulasan Mentah",
              className: "max-w-[420px]",
              render: (row) => (
                <div>
                  <p className="line-clamp-2 font-medium leading-6 text-foreground">
                    {row.text}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {row.userName}
                  </p>
                </div>
              ),
            },
            {
              key: "rating",
              header: "Rating",
              align: "right",
              render: (row) => `${row.rating}/5`,
            },
            {
              key: "date",
              header: "Tanggal",
              render: (row) => formatDate(row.reviewDate),
            },
            {
              key: "status",
              header: "Status",
              render: () => (
                <span className="rounded-md border border-blue-200 bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                  Data tersedia
                </span>
              ),
            },
          ]}
          data={reviews}
          emptyMessage={EMPTY_GATEWAY_MESSAGE}
          minWidthClassName="min-w-[760px]"
          rowKey={(row) => row.id}
        />
      </ChartCard>
    </AppShell>
  );
}
