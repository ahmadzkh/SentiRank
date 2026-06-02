import { ChartCard } from "@/components/cards/ChartCard";
import { StatCard } from "@/components/cards/StatCard";
import { SummaryCard } from "@/components/cards/SummaryCard";
import { AppShell, PageHeader } from "@/components/layout";
import { SimpleTable } from "@/components/tables/SimpleTable";
import { mockReviews, mockScrapingSummary } from "@/lib/mock-data";

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
        description="Status pengumpulan ulasan Spotify dalam mode mock. Halaman ini tidak menjalankan scraping nyata dari frontend."
        eyebrow="Pengumpulan data"
        title="Scraping"
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        <StatCard
          description="Jumlah target konfigurasi batch mock."
          label="Request Ulasan"
          value={mockScrapingSummary.requestedReviews}
        />
        <StatCard
          description="Data yang tersedia untuk preview frontend."
          label="Terkumpul"
          tone="primary"
          value={mockScrapingSummary.collectedReviews}
        />
        <StatCard
          description="Tidak ada kegagalan pada batch mock."
          label="Gagal"
          tone="positive"
          value={mockScrapingSummary.failedItems}
        />
        <StatCard
          description="Sumber aplikasi Spotify."
          label="Package"
          value={mockScrapingSummary.sourcePackage}
        />
        <StatCard
          description="Region placeholder untuk backend."
          label="Region"
          value={mockScrapingSummary.region}
        />
        <StatCard
          description="Status hanya untuk tampilan demo."
          label="Status Batch"
          tone="primary"
          value={mockScrapingSummary.status}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        <SummaryCard
          description="Konfigurasi ini menunjukkan kontrak UI yang akan dihubungkan ke backend pada fase API."
          items={[
            {
              label: "Batch ID",
              value: mockScrapingSummary.batchId,
              description: "Identifier sintetis untuk alur demo.",
            },
            {
              label: "Tanggal batch terakhir",
              value: formatDate(mockScrapingSummary.latestBatchDate),
              description: "Mengacu pada data mock terbaru.",
            },
            {
              label: "Bahasa",
              value: mockScrapingSummary.language,
              description: "Placeholder bahasa ulasan.",
            },
            {
              label: "Mode",
              value: "Hanya mock",
              description: "Tidak ada network call atau scraping runtime.",
            },
          ]}
          title="Ringkasan Status Scraping"
        />

        <ChartCard
          description="Parameter ditampilkan sebagai kontrak UI, bukan kontrol scraping aktif."
          title="Parameter Scraping Mock"
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
            data={mockScrapingSummary.parameters}
            minWidthClassName="min-w-[600px]"
            rowKey={(row) => row.id}
          />
        </ChartCard>
      </section>

      <ChartCard
        description="Ringkasan batch memperlihatkan alur koleksi data tanpa memanggil scraper nyata."
        title="Ringkasan Batch Pengumpulan"
      >
        <SimpleTable
          columns={[
            {
              key: "id",
              header: "Batch",
              render: (row) => row.id,
            },
            {
              key: "date",
              header: "Tanggal",
              render: (row) => formatDate(row.date),
            },
            {
              key: "requested",
              header: "Request",
              align: "right",
              render: (row) => row.requested,
            },
            {
              key: "collected",
              header: "Terkumpul",
              align: "right",
              render: (row) => row.collected,
            },
            {
              key: "failed",
              header: "Gagal",
              align: "right",
              render: (row) => row.failed,
            },
            {
              key: "status",
              header: "Status",
              render: (row) => (
                <span className="rounded-md border border-blue-200 bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                  {row.status}
                </span>
              ),
            },
          ]}
          data={mockScrapingSummary.batches}
          rowKey={(row) => row.id}
        />
      </ChartCard>

      <ChartCard
        description="Pratinjau ulasan mentah dari data mock. Kolom ini belum melakukan normalisasi, scraping ulang, atau ekspor nyata."
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
