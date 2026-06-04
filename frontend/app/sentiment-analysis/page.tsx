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
} from "@/lib/mock-data";
import { researchResults } from "@/lib/research-results";
import type { ReviewSentimentLabel } from "@/types/sentiment";

function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`;
}

function formatMetricPercent(value: number) {
  return `${(value * 100).toFixed(2)}%`;
}

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

export default function SentimentAnalysisPage() {
  return (
    <AppShell>
      <PageHeader
        description="Ringkasan hasil riset IndoBERT, distribusi sentimen final, dan contoh prediksi mock fallback untuk bentuk UI inference."
        eyebrow="IndoBERT"
        title="Analisis Sentimen"
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        <StatCard
          description="Total ulasan dari pipeline riset."
          label="Total Ulasan"
          value={researchResults.datasetSummary.totalReviews.toLocaleString("id-ID")}
        />
        <StatCard
          description="Distribusi label final setelah relabeling."
          label="Positif"
          tone="positive"
          value={
            researchResults.datasetSummary.finalLabelDistribution
              .find((item) => item.label === "Positive")
              ?.count.toLocaleString("id-ID") ?? "0"
          }
        />
        <StatCard
          description="Distribusi label final setelah relabeling."
          label="Netral"
          tone="neutral"
          value={
            researchResults.datasetSummary.finalLabelDistribution
              .find((item) => item.label === "Neutral")
              ?.count.toLocaleString("id-ID") ?? "0"
          }
        />
        <StatCard
          description="Distribusi label final setelah relabeling."
          label="Negatif"
          tone="negative"
          value={
            researchResults.datasetSummary.finalLabelDistribution
              .find((item) => item.label === "Negative")
              ?.count.toLocaleString("id-ID") ?? "0"
          }
        />
        <StatCard
          description="Macro F1 kandidat final IndoBERT run_3."
          label="Macro F1"
          tone="primary"
          value={formatMetricPercent(researchResults.indobertEvaluation.f1Macro)}
        />
        <StatCard
          description={researchResults.indobertEvaluation.finalCandidate}
          label="Model"
          value={researchResults.indobertEvaluation.modelName}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <ChartCard
          description="Form ini tetap mock fallback untuk menggambarkan interaksi prediksi; belum ada panggilan model nyata dari frontend."
          title="Input Ulasan Tunggal - Mode Mock/Fallback"
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
              Jalankan Prediksi Mode Mock/Fallback
            </button>
          </div>
        </ChartCard>

        <SummaryCard
          description="Kartu ini menunjukkan output mock fallback. Metrik model final ditampilkan pada halaman Evaluasi Model."
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
              value: researchResults.indobertEvaluation.modelName,
              description: researchResults.indobertEvaluation.finalCandidate,
            },
            {
              label: "Status",
              value: "Hanya mock",
              description: "Belum menjalankan inferensi model nyata.",
            },
          ]}
          title="Hasil Prediksi Sentimen - Mode Mock/Fallback"
        >
          <p className="rounded-md border border-blue-100 bg-blue-50 px-4 py-3 text-sm leading-6 text-blue-900">
            {mockSentimentPrediction.explanation}
          </p>
        </SummaryCard>
      </section>

      <ChartCard
        description="Ringkasan distribusi sentimen final dari pipeline relabeling riset."
        insight={researchResults.reportSummary.sentimentFindings}
        title="Distribusi Sentimen Final"
      >
        <SentimentDistributionChart data={sentimentDistributionData} />
      </ChartCard>

      <ChartCard
        description="Tabel ini tetap mock fallback karena FE-15 hanya mengintegrasikan ringkasan output riset, bukan prediksi baris penuh."
        title="Tabel Hasil Sentimen - Mode Mock/Fallback"
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
