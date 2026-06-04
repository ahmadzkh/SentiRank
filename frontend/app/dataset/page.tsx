import { ChartCard } from "@/components/cards/ChartCard";
import { StatCard } from "@/components/cards/StatCard";
import { SummaryCard } from "@/components/cards/SummaryCard";
import { AspectRankingChart } from "@/components/charts/AspectRankingChart";
import type { AspectRankingDatum } from "@/components/charts/AspectRankingChart";
import { RatingDistributionChart } from "@/components/charts/RatingDistributionChart";
import { RatingTemporalStackedChart } from "@/components/charts/RatingTemporalStackedChart";
import { ReviewTemporalChart } from "@/components/charts/ReviewTemporalChart";
import { SentimentDistributionChart } from "@/components/charts/SentimentDistributionChart";
import type { SentimentDistributionDatum } from "@/components/charts/SentimentDistributionChart";
import { TextLengthHistogramChart } from "@/components/charts/TextLengthHistogramChart";
import { AppShell, PageHeader } from "@/components/layout";
import { ReviewTable } from "@/components/tables/ReviewTable";
import { SimpleTable } from "@/components/tables/SimpleTable";
import type { SimpleTableColumn } from "@/components/tables/SimpleTable";
import { SENTIMENT_LABELS, SENTIMENT_META } from "@/constants/sentiment";
import { researchEdaResults } from "@/lib/research-eda-results";
import { researchSampleReviews } from "@/lib/research-sample-reviews";
import type { ReviewSentimentLabel } from "@/types/sentiment";

function formatNumber(value: number) {
  return value.toLocaleString("id-ID");
}

function formatPercent(value: number) {
  return `${value.toFixed(2)}%`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function toSentimentKey(label: string): ReviewSentimentLabel {
  return label.toLowerCase() as ReviewSentimentLabel;
}

const finalSentimentDistributionData = SENTIMENT_LABELS.map((label) => ({
  label,
  name: SENTIMENT_META[label].label,
  count:
    researchEdaResults.labelDistributionAfterRelabeling.find(
      (item) => toSentimentKey(item.label) === label,
    )?.count ?? 0,
  percentage:
    researchEdaResults.labelDistributionAfterRelabeling.find(
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
    render: (row) => formatNumber(row.count),
  },
  {
    key: "percentage",
    header: "Proporsi",
    align: "right",
    render: (row) => formatPercent(row.percentage),
  },
] satisfies SimpleTableColumn<
  (typeof researchEdaResults.ratingDistribution)[number]
>[];

const sentimentComparisonRows = SENTIMENT_LABELS.map((label) => {
  const rawLabel = SENTIMENT_META[label].label;
  const sourceLabel =
    rawLabel === "Positif"
      ? "Positive"
      : rawLabel === "Netral"
        ? "Neutral"
        : "Negative";

  return {
    id: label,
    label: rawLabel,
    before:
      researchEdaResults.labelDistributionBeforeRelabeling.find(
        (item) => item.label === sourceLabel,
      )?.count ?? 0,
    after:
      researchEdaResults.labelDistributionAfterRelabeling.find(
        (item) => item.label === sourceLabel,
      )?.count ?? 0,
  };
});

const qualityChecks = [
  {
    id: "duplicate-external-id",
    label: "Duplikasi external_id",
    value: `${formatNumber(
      researchEdaResults.duplicateSummary.duplicateExternalIdCount,
    )} baris`,
    status: "Aman",
    note: researchEdaResults.duplicateSummary.note,
  },
  ...researchEdaResults.missingValueSummary.map((item) => ({
    id: `missing-${item.field}`,
    label: `Nilai kosong ${item.field}`,
    value: `${formatNumber(item.missingCount)} baris`,
    status: item.missingCount === 0 ? "Aman" : "Perlu cek",
    note: "Audit missing value dari artefak akuisisi data.",
  })),
  {
    id: "empty-indobert",
    label: "Teks kosong IndoBERT",
    value: "0 baris",
    status: "Aman",
    note: "Ringkasan dari preprocessing_summary.json.",
  },
  {
    id: "empty-svm",
    label: "Teks kosong SVM",
    value: "91 baris",
    status: "Perlu filter",
    note: "Baris kosong difilter sebelum dataset aspek SVM final.",
  },
];

const aspectRankingData =
  researchEdaResults.aspectLabelDistributionRefined.map((item) => ({
    aspect: item.label,
    label: item.label,
    count: item.count,
  })) satisfies AspectRankingDatum[];

const artifactRows = researchEdaResults.sourceArtifacts.map((artifact) => {
  const [phase = "EDA"] = artifact
    .replace("datasets/outputs/eda/", "")
    .split("/");

  return {
    id: artifact,
    phase,
    path: artifact,
    format: artifact.endsWith(".csv") ? "CSV" : "JSON",
  };
});

const termRows = [
  ...researchEdaResults.generalFallback.topTerms.slice(0, 6).map((item) => ({
    ...item,
    group: "General fallback",
  })),
  ...researchEdaResults.candidateTerms.topTerms.slice(0, 6).map((item) => ({
    ...item,
    group: "Candidate term",
  })),
];

export default function DatasetPage() {
  return (
    <AppShell>
      <PageHeader
        description="Eksplorasi dataset Spotify berbasis artefak EDA: kualitas data, distribusi rating/sentimen, temporal, panjang teks, dan aspek weak-label."
        eyebrow="Data dan EDA"
        title="Dataset"
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          description={researchEdaResults.datasetSummary.source}
          label="Total Dataset"
          value={formatNumber(researchEdaResults.datasetSummary.totalRows)}
        />
        <StatCard
          description="Baris untuk analisis sentimen."
          label="Review Diproses"
          tone="positive"
          value={formatNumber(
            researchEdaResults.datasetSummary.processedSentimentRows,
          )}
        />
        <StatCard
          description="Dataset final klasifikasi aspek SVM."
          label="Dataset Aspek"
          tone="primary"
          value={formatNumber(
            researchEdaResults.datasetSummary.processedAspectRows,
          )}
        />
        <StatCard
          description="Rentang tanggal review yang tersedia."
          label="Rentang Data"
          value="2014-2026"
        />
      </section>

      <section>
        <SummaryCard
          description="Ringkasan Dataset memakai artefak EDA lokal, bukan mock FE-07."
          items={[
            {
              label: "Sumber",
              value: researchEdaResults.datasetSummary.packageName,
              description: researchEdaResults.datasetSummary.appTitle,
            },
            {
              label: "Rentang tanggal",
              value: `${formatDate(
                researchEdaResults.datasetSummary.dateRange.start,
              )} - ${formatDate(researchEdaResults.datasetSummary.dateRange.end)}`,
              description: "Minimum dan maksimum review pada EDA akuisisi.",
            },
            {
              label: "Path EDA aktual",
              value: researchEdaResults.edaRoots.actualRoot,
              description:
                "Path `dataset/output/eda` dan `datasets/output/eda` tidak ditemukan.",
            },
            {
              label: "SVM aspect rows",
              value: formatNumber(
                researchEdaResults.datasetSummary.processedAspectRows,
              ),
              description: "Baris akhir setelah filter aspek weak-label.",
            },
          ]}
          title="Ringkasan Dataset"
        />
      </section>

      <section>
        <ChartCard
          description="Audit kualitas data dari missing value, duplikasi, dan teks kosong preprocessing."
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
                  <span className="rounded-md border border-blue-200 bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
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
            minWidthClassName="min-w-[760px]"
            rowKey={(row) => row.id}
          />
        </ChartCard>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <ChartCard
          description="Distribusi rating mentah dari output akuisisi data."
          title="Distribusi Rating"
        >
          <RatingDistributionChart data={researchEdaResults.ratingDistribution} />
        </ChartCard>

        <ChartCard
          description="Distribusi sentimen final setelah proses relabeling."
          insight="Label Positif dan Negatif relatif seimbang; Netral menjadi lebih kecil setelah relabeling."
          title="Distribusi Sentimen Final"
        >
          <SentimentDistributionChart data={finalSentimentDistributionData} />
        </ChartCard>
      </section>

      <section>
        <ChartCard
          description="Tabel rating tetap disediakan untuk pembacaan angka presisi."
          title="Tabel Rating"
        >
          <SimpleTable
            columns={ratingColumns}
            data={researchEdaResults.ratingDistribution}
            minWidthClassName="min-w-[420px]"
            rowKey={(row) => `rating-${row.rating}`}
          />
        </ChartCard>
      </section>

      <section>
        <ChartCard
          description="Perbandingan label sebelum dan sesudah relabeling."
          title="Label Sebelum / Sesudah Relabeling"
        >
          <SimpleTable
            columns={[
              {
                key: "label",
                header: "Label",
                render: (row) => (
                  <span className="font-medium text-foreground">
                    {row.label}
                  </span>
                ),
              },
              {
                key: "before",
                header: "Sebelum",
                align: "right",
                render: (row) => formatNumber(row.before),
              },
              {
                key: "after",
                header: "Sesudah",
                align: "right",
                render: (row) => formatNumber(row.after),
              },
              {
                key: "delta",
                header: "Perubahan",
                align: "right",
                render: (row) => formatNumber(row.after - row.before),
              },
            ]}
            data={sentimentComparisonRows}
            minWidthClassName="min-w-[560px]"
            rowKey={(row) => row.id}
          />
        </ChartCard>
      </section>

      <section>
        <ChartCard
          description="Agregasi jumlah review per tahun dari temporal_distribution_monthly_raw."
          title="Distribusi Temporal Tahunan"
        >
          <ReviewTemporalChart data={researchEdaResults.temporalYearlyDistribution} />
        </ChartCard>
      </section>

      <section>
        <ChartCard
          description="Distribusi bulanan terbaru per rating, dipadatkan ke 12 bulan terakhir agar tetap terbaca."
          title="Distribusi Bulanan per Rating"
        >
          <RatingTemporalStackedChart
            data={researchEdaResults.recentMonthlyByRating}
          />
        </ChartCard>
      </section>

      <section>
        <ChartCard
          description="Histogram panjang teks mentah dari artefak akuisisi data."
          insight={`Median teks mentah ${researchEdaResults.rawTextLengthSummary.median} karakter, rata-rata ${researchEdaResults.rawTextLengthSummary.mean.toFixed(2)} karakter.`}
          title="Histogram Panjang Teks Mentah"
        >
          <TextLengthHistogramChart data={researchEdaResults.textLengthHistogramRaw} />
        </ChartCard>
      </section>

      <section>
        <ChartCard
          description="Ringkasan panjang teks sebelum dan sesudah cleaning."
          title="Panjang Teks Sebelum / Sesudah Cleaning"
        >
          <SimpleTable
            columns={[
              {
                key: "stage",
                header: "Tahap",
                render: (row) => (
                  <span className="font-medium text-foreground">
                    {row.stage}
                  </span>
                ),
              },
              {
                key: "count",
                header: "Baris",
                align: "right",
                render: (row) => formatNumber(row.count),
              },
              {
                key: "median",
                header: "Median",
                align: "right",
                render: (row) => row.median,
              },
              {
                key: "mean",
                header: "Rata-rata",
                align: "right",
                render: (row) => row.mean.toFixed(2),
              },
              {
                key: "max",
                header: "Maksimum",
                align: "right",
                render: (row) => row.max,
              },
            ]}
            data={researchEdaResults.textLengthBeforeAfterCleaning}
            minWidthClassName="min-w-[680px]"
            rowKey={(row) => row.stage}
          />
        </ChartCard>
      </section>

      <section>
        <ChartCard
          description="Distribusi aspek hasil refinement weak-label, termasuk General fallback."
          title="Distribusi Aspek Refined"
        >
          <AspectRankingChart data={aspectRankingData} />
        </ChartCard>
      </section>

      <section>
        <ChartCard
          description="Aspek dikelompokkan berdasarkan sentimen untuk melihat sinyal negatif dan positif."
          title="Aspek Berdasarkan Sentimen"
        >
          <SimpleTable
            columns={[
              {
                key: "aspect",
                header: "Aspek",
                className: "max-w-[260px]",
                render: (row) => (
                  <span className="font-medium text-foreground">
                    {row.aspect}
                  </span>
                ),
              },
              {
                key: "negative",
                header: "Negatif",
                align: "right",
                render: (row) => formatNumber(row.negative),
              },
              {
                key: "neutral",
                header: "Netral",
                align: "right",
                render: (row) => formatNumber(row.neutral),
              },
              {
                key: "positive",
                header: "Positif",
                align: "right",
                render: (row) => formatNumber(row.positive),
              },
              {
                key: "total",
                header: "Total",
                align: "right",
                render: (row) => formatNumber(row.total),
              },
            ]}
            data={researchEdaResults.aspectBySentimentRefined}
            minWidthClassName="min-w-[820px]"
            rowKey={(row) => row.aspect}
          />
        </ChartCard>
      </section>

      <section>
        <SummaryCard
          description="General fallback bersifat eksploratif dan tidak dipakai langsung sebagai kriteria final AHP/Fuzzy AHP."
          title="General Fallback dan Candidate Terms"
        >
          <SimpleTable
            columns={[
              {
                key: "group",
                header: "Kelompok",
                render: (row) => row.group,
              },
              {
                key: "term",
                header: "Term",
                render: (row) => (
                  <span className="font-medium text-foreground">
                    {row.term}
                  </span>
                ),
              },
              {
                key: "count",
                header: "Jumlah",
                align: "right",
                render: (row) => formatNumber(row.count),
              },
            ]}
            data={termRows}
            minWidthClassName="min-w-[620px]"
            rowKey={(row) => `${row.group}-${row.term}`}
          />
          <p className="mt-4 rounded-md border border-blue-100 bg-blue-50 px-4 py-3 text-sm leading-6 text-blue-900">
            {researchEdaResults.candidateTerms.methodologyNote}
          </p>
        </SummaryCard>
      </section>

      <section>
        <ChartCard
          description="Referensi artefak EDA yang dipakai untuk halaman Dataset FE-15B."
          title="Artefak EDA"
        >
          <SimpleTable
            columns={[
              {
                key: "phase",
                header: "Folder",
                render: (row) => row.phase,
              },
              {
                key: "format",
                header: "Format",
                render: (row) => row.format,
              },
              {
                key: "path",
                header: "Path",
                className: "max-w-[460px]",
                render: (row) => (
                  <code className="text-xs text-muted-foreground">
                    {row.path}
                  </code>
                ),
              },
            ]}
            data={artifactRows}
            minWidthClassName="min-w-[760px]"
            rowKey={(row) => row.id}
          />
        </ChartCard>
      </section>

      <ChartCard
        description="Sampel kecil dari dataset riset dipusatkan di `frontend/lib/research-sample-reviews.ts`; external_id asli tidak ditampilkan."
        title="Sampel Ulasan Riset"
      >
        <ReviewTable reviews={researchSampleReviews} />
      </ChartCard>
    </AppShell>
  );
}
