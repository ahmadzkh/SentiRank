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
import { mockReviews } from "@/lib/mock-data";
import { researchResults } from "@/lib/research-results";
import type { ReviewSentimentLabel } from "@/types/sentiment";

function toSentimentKey(label: string): ReviewSentimentLabel {
  return label.toLowerCase() as ReviewSentimentLabel;
}

const sentimentDistributionData = SENTIMENT_LABELS.map((label) => ({
  label,
  name: SENTIMENT_META[label].label,
  count:
    researchResults.datasetSummary.finalLabelDistribution.find(
      (item) => toSentimentKey(item.label) === label,
    )?.count ?? 0,
  percentage:
    researchResults.datasetSummary.finalLabelDistribution.find(
      (item) => toSentimentKey(item.label) === label,
    )?.percentage ?? 0,
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
      `${row.percentage.toFixed(2)}%`,
  },
] satisfies SimpleTableColumn<
  (typeof researchResults.datasetSummary.ratingDistribution)[number]
>[];

const qualityChecks = [
  {
    id: "quality-duplicates",
    label: "Duplikasi external_id",
    value: `${researchResults.datasetSummary.duplicateSummary.duplicateExternalIdCount} baris`,
    status: "Aman",
    note: researchResults.datasetSummary.duplicateSummary.note,
  },
  ...researchResults.datasetSummary.missingSummary.map((item) => ({
    id: `missing-${item.field}`,
    label: `Nilai kosong ${item.field}`,
    value: `${item.missingCount} baris`,
    status: item.missingCount === 0 ? "Aman" : "Perlu cek",
    note: "Audit missing value dari artefak akuisisi data.",
  })),
];

export default function DatasetPage() {
  return (
    <AppShell>
      <PageHeader
        description="Pemeriksaan sumber data riset, kualitas dataset, distribusi label, dan ringkasan ulasan Spotify sebelum masuk ke pipeline analisis."
        eyebrow="Data dan kualitas"
        title="Dataset"
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        <StatCard
          description={researchResults.datasetSummary.sourceName}
          label="Total Baris"
          value={researchResults.datasetSummary.totalReviews.toLocaleString("id-ID")}
        />
        <StatCard
          description="Berdasarkan audit external_id."
          label="Ulasan Unik"
          tone="positive"
          value={researchResults.datasetSummary.totalReviews.toLocaleString("id-ID")}
        />
        <StatCard
          description="Duplicate external_id pada notebook akuisisi."
          label="Duplikasi"
          value={
            researchResults.datasetSummary.duplicateSummary
              .duplicateExternalIdCount
          }
        />
        <StatCard
          description="external_id, rating, content, reviewed_at."
          label="Nilai Kosong"
          tone="positive"
          value={researchResults.datasetSummary.missingSummary.reduce(
            (total, item) => total + item.missingCount,
            0,
          )}
        />
        <StatCard
          description="Distribusi label final tersedia dari relabeling."
          label="Cakupan Label"
          tone="primary"
          value="100%"
        />
        <StatCard
          description="Rentang tanggal review dari audit akuisisi."
          label="Rentang Data"
          value="2014-2026"
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <SummaryCard
          description="Ringkasan ini berasal dari artefak pipeline riset SentiRank, bukan mock FE-07."
          items={[
            {
              label: "Status impor",
              value: "Artefak riset tersedia",
              description: "Ringkasan dataset dibaca dari output EDA lokal.",
            },
            {
              label: "Rentang tanggal",
              value: `${researchResults.datasetSummary.dateRange.start} sampai ${researchResults.datasetSummary.dateRange.end}`,
              description: "Tanggal minimum dan maksimum dari notebook akuisisi.",
            },
            {
              label: "Baris diproses",
              value: researchResults.preprocessingSummary.totalRows.toLocaleString("id-ID"),
              description: "Total baris yang masuk preprocessing.",
            },
            {
              label: "Sumber",
              value: researchResults.datasetSummary.sourcePackage,
              description: researchResults.datasetSummary.appTitle,
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
            data={qualityChecks}
            minWidthClassName="min-w-[680px]"
            rowKey={(row) => row.id}
          />
        </ChartCard>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <ChartCard
          description="Distribusi label sentimen final setelah relabeling pipeline."
          insight="Positif dan Negatif relatif seimbang, sedangkan Netral lebih kecil setelah relabeling."
          title="Distribusi Label Sentimen Final"
        >
          <SentimentDistributionChart data={sentimentDistributionData} />
        </ChartCard>

        <ChartCard
          description="Distribusi rating dari artefak akuisisi data."
          title="Distribusi Rating"
        >
          <SimpleTable
            columns={ratingColumns}
            data={researchResults.datasetSummary.ratingDistribution}
            minWidthClassName="min-w-[420px]"
            rowKey={(row) => `rating-${row.rating}`}
          />
        </ChartCard>
      </section>

      <ChartCard
        description="FE-15 belum memuat dataset mentah ke frontend. Tabel ini tetap contoh mock fallback untuk menjaga tampilan inspeksi."
        title="Tabel Ulasan - Mode Mock/Fallback"
      >
        <ReviewTable reviews={mockReviews} />
      </ChartCard>
    </AppShell>
  );
}
