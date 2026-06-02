import { ChartCard } from "@/components/cards/ChartCard";
import { StatCard } from "@/components/cards/StatCard";
import { SummaryCard } from "@/components/cards/SummaryCard";
import { SentimentDistributionChart } from "@/components/charts/SentimentDistributionChart";
import type { SentimentDistributionDatum } from "@/components/charts/SentimentDistributionChart";
import { AppShell, PageHeader } from "@/components/layout";
import { ReviewTable } from "@/components/tables/ReviewTable";
import { SimpleTable } from "@/components/tables/SimpleTable";
import type { SimpleTableColumn } from "@/components/tables/SimpleTable";
import { SENTIMENT_LABELS, SENTIMENT_META } from "@/constants/sentiment";
import {
  mockDatasetProfile,
  mockReviews,
  mockSentimentSummary,
} from "@/lib/mock-data";

const sentimentDistributionData = SENTIMENT_LABELS.map((label) => ({
  label,
  name: SENTIMENT_META[label].label,
  count: mockSentimentSummary.counts[label],
  percentage: mockSentimentSummary.percentages[label],
  color: SENTIMENT_META[label].chartColor,
})) satisfies SentimentDistributionDatum[];

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
    render: (row) =>
      `${Math.round((row.count / mockDatasetProfile.totalRows) * 100)}%`,
  },
] satisfies SimpleTableColumn<
  (typeof mockDatasetProfile.ratingDistribution)[number]
>[];

export default function DatasetPage() {
  return (
    <AppShell>
      <PageHeader
        description="Pemeriksaan sumber data, kualitas dataset, distribusi label, dan tabel ulasan Spotify sebelum masuk ke pipeline analisis."
        eyebrow="Data dan kualitas"
        title="Dataset"
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        <StatCard
          description={mockDatasetProfile.sourceName}
          label="Total Baris"
          value={mockDatasetProfile.totalRows}
        />
        <StatCard
          description="Baris tanpa duplikasi pada sampel mock."
          label="Ulasan Unik"
          tone="positive"
          value={mockDatasetProfile.uniqueReviews}
        />
        <StatCard
          description="Duplikasi tidak ditemukan pada dataset mock."
          label="Duplikasi"
          value={mockDatasetProfile.duplicateRows}
        />
        <StatCard
          description="Field penting lengkap untuk demo UI."
          label="Nilai Kosong"
          tone="positive"
          value={mockDatasetProfile.missingValues}
        />
        <StatCard
          description="Semua data mock sudah memiliki label awal."
          label="Cakupan Label"
          tone="primary"
          value={`${mockDatasetProfile.labelCoverage}%`}
        />
        <StatCard
          description="Rata-rata rating ulasan Spotify mock."
          label="Rating Rata-rata"
          value={`${mockDatasetProfile.averageRating}/5`}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <SummaryCard
          description="Dataset masih bersifat sintetis untuk pengembangan frontend dan belum memanggil API backend."
          items={[
            {
              label: "Status import",
              value: mockDatasetProfile.importStatus,
              description: "Sumber data siap untuk alur demo skripsi.",
            },
            {
              label: "Rentang tanggal",
              value: `${mockDatasetProfile.dateRange.start} sampai ${mockDatasetProfile.dateRange.end}`,
              description: "Digunakan untuk konteks batch ulasan.",
            },
            {
              label: "Baris diproses",
              value: mockDatasetProfile.processedRows,
              description: "Semua baris sudah memiliki teks bersih mock.",
            },
            {
              label: "Sumber",
              value: mockDatasetProfile.sourceName,
              description: mockDatasetProfile.sourceDescription,
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
                  <span className="rounded-md border border-green-200 bg-green-50 px-2 py-1 text-xs font-medium text-green-700">
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
            data={mockDatasetProfile.qualityChecks}
            minWidthClassName="min-w-[680px]"
            rowKey={(row) => row.id}
          />
        </ChartCard>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <ChartCard
          description="Distribusi label sentimen awal dari mock data FE-07."
          insight="Distribusi ini membantu evaluator melihat komposisi label sebelum membuka halaman analisis sentimen."
          title="Distribusi Label Sentimen"
        >
          <SentimentDistributionChart data={sentimentDistributionData} />
        </ChartCard>

        <ChartCard
          description="Pratinjau distribusi rating ulasan Spotify pada dataset mock."
          title="Distribusi Rating"
        >
          <SimpleTable
            columns={ratingColumns}
            data={mockDatasetProfile.ratingDistribution}
            minWidthClassName="min-w-[420px]"
            rowKey={(row) => `rating-${row.rating}`}
          />
        </ChartCard>
      </section>

      <ChartCard
        description="Tabel ulasan digunakan sebagai permukaan inspeksi utama sebelum preprocessing dan model inference."
        title="Tabel Ulasan"
      >
        <ReviewTable reviews={mockReviews} />
      </ChartCard>
    </AppShell>
  );
}
