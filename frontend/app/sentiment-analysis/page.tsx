import { ChartCard } from "@/components/cards/ChartCard";
import { StatCard } from "@/components/cards/StatCard";
import { SummaryCard } from "@/components/cards/SummaryCard";
import { SentimentBadge } from "@/components/badges/SentimentBadge";
import { SentimentDistributionChart } from "@/components/charts/SentimentDistributionChart";
import type { SentimentDistributionDatum } from "@/components/charts/SentimentDistributionChart";
import { AppShell, PageHeader } from "@/components/layout";
import { SimpleTable } from "@/components/tables/SimpleTable";
import { SENTIMENT_LABELS, SENTIMENT_META } from "@/constants/sentiment";
import {
  mockSentimentPrediction,
  mockSentimentResults,
  mockSentimentSummary,
} from "@/lib/mock-data";

function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`;
}

const sentimentDistributionData = SENTIMENT_LABELS.map((label) => ({
  label,
  name: SENTIMENT_META[label].label,
  count: mockSentimentSummary.counts[label],
  percentage: mockSentimentSummary.percentages[label],
  color: SENTIMENT_META[label].chartColor,
})) satisfies SentimentDistributionDatum[];

export default function SentimentAnalysisPage() {
  return (
    <AppShell>
      <PageHeader
        description="Tampilan mock untuk melihat ringkasan hasil IndoBERT, contoh prediksi tunggal, distribusi sentimen, dan tabel hasil batch."
        eyebrow="IndoBERT"
        title="Analisis Sentimen"
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        <StatCard
          description="Jumlah ulasan batch mock."
          label="Total Ulasan"
          value={mockSentimentSummary.totalReviews}
        />
        <StatCard
          description={`${mockSentimentSummary.percentages.positive}% dari data mock.`}
          label="Positif"
          tone="positive"
          value={mockSentimentSummary.counts.positive}
        />
        <StatCard
          description={`${mockSentimentSummary.percentages.neutral}% dari data mock.`}
          label="Netral"
          tone="neutral"
          value={mockSentimentSummary.counts.neutral}
        />
        <StatCard
          description={`${mockSentimentSummary.percentages.negative}% dari data mock.`}
          label="Negatif"
          tone="negative"
          value={mockSentimentSummary.counts.negative}
        />
        <StatCard
          description="Rata-rata confidence prediksi batch."
          label="Confidence Rata-rata"
          tone="primary"
          value={formatPercent(mockSentimentSummary.averageConfidence)}
        />
        <StatCard
          description={mockSentimentSummary.modelVersion}
          label="Model"
          value={mockSentimentSummary.modelName}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <ChartCard
          description="Form ini hanya menggambarkan interaksi prediksi; tidak ada panggilan model nyata dari frontend."
          title="Input Ulasan Tunggal Mock"
        >
          <div className="space-y-4">
            <label
              className="block text-sm font-medium text-foreground"
              htmlFor="mock-review-input"
            >
              Teks ulasan
            </label>
            <textarea
              className="min-h-32 w-full resize-none rounded-md border border-input bg-white px-3 py-2 text-sm leading-6 text-foreground outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
              defaultValue={mockSentimentPrediction.inputText}
              id="mock-review-input"
              readOnly
            />
            <button
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
              disabled
              type="button"
            >
              Jalankan Prediksi Mock
            </button>
          </div>
        </ChartCard>

        <SummaryCard
          description="Hasil ini berasal dari mock data FE-07 untuk menyiapkan tampilan sebelum API inference tersedia."
          items={[
            {
              label: "Prediksi",
              value: <SentimentBadge sentiment={mockSentimentPrediction.label} />,
              description: "Label sentimen mock untuk teks contoh.",
            },
            {
              label: "Confidence",
              value: formatPercent(mockSentimentPrediction.confidence),
              description: "Nilai confidence sintetis untuk UI.",
            },
            {
              label: "Model",
              value: mockSentimentPrediction.modelName,
              description: mockSentimentPrediction.modelVersion,
            },
            {
              label: "Status",
              value: "Hanya mock",
              description: "Belum menjalankan inferensi model nyata.",
            },
          ]}
          title="Hasil Prediksi Sentimen Mock"
        >
          <p className="rounded-md border border-blue-100 bg-blue-50 px-4 py-3 text-sm leading-6 text-blue-900">
            {mockSentimentPrediction.explanation}
          </p>
        </SummaryCard>
      </section>

      <ChartCard
        description="Ringkasan distribusi sentimen batch dari data mock."
        insight="Halaman ini menyiapkan bentuk visual untuk integrasi hasil IndoBERT dari backend pada fase API."
        title="Distribusi Sentimen"
      >
        <SentimentDistributionChart data={sentimentDistributionData} />
      </ChartCard>

      <ChartCard
        description="Tabel hasil batch menampilkan teks ulasan, label, confidence, dan probabilitas mock."
        title="Tabel Hasil Sentimen"
      >
        <SimpleTable
          columns={[
            {
              key: "review",
              header: "Ulasan",
              className: "max-w-[420px]",
              render: (row) => (
                <p className="line-clamp-2 font-medium leading-6 text-foreground">
                  {row.reviewText}
                </p>
              ),
            },
            {
              key: "label",
              header: "Label",
              render: (row) => <SentimentBadge sentiment={row.label} />,
            },
            {
              key: "confidence",
              header: "Confidence",
              align: "right",
              render: (row) => formatPercent(row.confidence),
            },
            {
              key: "probability",
              header: "Probabilitas",
              render: (row) => (
                <span className="text-xs leading-5 text-muted-foreground">
                  Positif {formatPercent(row.probabilities.positive)} / Netral{" "}
                  {formatPercent(row.probabilities.neutral)} / Negatif{" "}
                  {formatPercent(row.probabilities.negative)}
                </span>
              ),
            },
          ]}
          data={mockSentimentResults}
          minWidthClassName="min-w-[880px]"
          rowKey={(row) => row.id}
        />
      </ChartCard>
    </AppShell>
  );
}
