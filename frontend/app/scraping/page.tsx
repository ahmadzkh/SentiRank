import { ChartCard } from "@/components/cards/ChartCard";
import { StatCard } from "@/components/cards/StatCard";
import { SummaryCard } from "@/components/cards/SummaryCard";
import { AppShell, PageHeader } from "@/components/layout";
import { SimpleTable } from "@/components/tables/SimpleTable";
import { mockReviews } from "@/lib/mock-data";
import { researchResults } from "@/lib/research-results";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export default function ScrapingPage() {
  return (
    <AppShell>
      <PageHeader
        description="Ringkasan pengumpulan ulasan Spotify dari artefak riset. Halaman ini tidak menjalankan scraping nyata dari frontend."
        eyebrow="Pengumpulan data"
        title="Scraping"
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        <StatCard
          description="Target kuota akuisisi berdasarkan rating."
          label="Request Ulasan"
          value={researchResults.scrapingSummary.targetReviews.toLocaleString("id-ID")}
        />
        <StatCard
          description="Total ulasan yang terkumpul pada pipeline."
          label="Terkumpul"
          tone="primary"
          value={researchResults.scrapingSummary.collectedReviews.toLocaleString("id-ID")}
        />
        <StatCard
          description="Tidak ada failure count pada ringkasan FE-15."
          label="Gagal"
          tone="positive"
          value={researchResults.scrapingSummary.failedItems}
        />
        <StatCard
          description="Sumber aplikasi Spotify."
          label="Package"
          value={researchResults.scrapingSummary.packageName}
        />
        <StatCard
          description="Region dari konfigurasi scraping."
          label="Region"
          value={researchResults.scrapingSummary.region}
        />
        <StatCard
          description="Ringkasan berasal dari artefak riset."
          label="Status Batch"
          tone="primary"
          value="Selesai"
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        <SummaryCard
          description="Konfigurasi ini menunjukkan strategi scraping yang digunakan untuk membentuk dataset riset."
          items={[
            {
              label: "Aplikasi",
              value: researchResults.scrapingSummary.appTitle,
              description: researchResults.scrapingSummary.packageName,
            },
            {
              label: "Rentang data",
              value: `${formatDate(researchResults.datasetSummary.dateRange.start)} - ${formatDate(researchResults.datasetSummary.dateRange.end)}`,
              description: "Tanggal minimum dan maksimum review.",
            },
            {
              label: "Bahasa",
              value: researchResults.scrapingSummary.language,
              description: "Konfigurasi scraping pada Play Store Indonesia.",
            },
            {
              label: "Mode",
              value: "Ringkasan riset",
              description: "Tidak ada network call atau scraping runtime dari frontend.",
            },
          ]}
          title="Ringkasan Status Scraping"
        />

        <ChartCard
          description="Parameter ditampilkan sebagai kontrak UI, bukan kontrol scraping aktif."
          title="Parameter Scraping Riset"
        >
          <SimpleTable
            columns={[
              {
                key: "label",
                header: "Parameter",
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
                key: "note",
                header: "Catatan",
                render: (row) => row.note,
              },
            ]}
            data={[
              {
                id: "param-source",
                label: "Sumber",
                value: researchResults.scrapingSummary.sourceName,
                note: researchResults.scrapingSummary.packageName,
              },
              {
                id: "param-strategy",
                label: "Strategi batch",
                value: "Berdasarkan rating",
                note: researchResults.scrapingSummary.batchStrategy,
              },
              {
                id: "param-target",
                label: "Target ulasan",
                value: researchResults.scrapingSummary.targetReviews.toLocaleString("id-ID"),
                note: "Target kuota keseluruhan.",
              },
            ]}
            minWidthClassName="min-w-[600px]"
            rowKey={(row) => row.id}
          />
        </ChartCard>
      </section>

      <ChartCard
        description="Ringkasan kuota memperlihatkan pencapaian pengumpulan per rating."
        title="Ringkasan Kuota Pengumpulan"
      >
        <SimpleTable
          columns={[
            {
              key: "rating",
              header: "Rating",
              render: (row) => `${row.rating}/5`,
            },
            {
              key: "requested",
              header: "Request",
              align: "right",
              render: (row) => row.targetCount.toLocaleString("id-ID"),
            },
            {
              key: "collected",
              header: "Terkumpul",
              align: "right",
              render: (row) => row.actualCount.toLocaleString("id-ID"),
            },
            {
              key: "status",
              header: "Status",
              render: (row) => (
                <span className="rounded-md border border-blue-200 bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                  {(row.achievementRate * 100).toFixed(2)}%
                </span>
              ),
            },
          ]}
          data={researchResults.scrapingSummary.quotaAchievement}
          rowKey={(row) => `rating-${row.rating}`}
        />
      </ChartCard>

      <ChartCard
        description="Dataset mentah tidak dimuat ke frontend. Tabel ini tetap contoh mock fallback untuk memperlihatkan bentuk inspeksi ulasan."
        title="Pratinjau Ulasan Mentah - Mock/Fallback"
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
                <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-medium text-slate-700">
                  Mock
                </span>
              ),
            },
          ]}
          data={mockReviews}
          minWidthClassName="min-w-[760px]"
          rowKey={(row) => row.id}
        />
      </ChartCard>
    </AppShell>
  );
}
