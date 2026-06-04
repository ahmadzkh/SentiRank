import { ChartCard } from "@/components/cards/ChartCard";
import { StatCard } from "@/components/cards/StatCard";
import { SummaryCard } from "@/components/cards/SummaryCard";
import { SentimentBadge } from "@/components/badges/SentimentBadge";
import { SentimentDistributionChart } from "@/components/charts/SentimentDistributionChart";
import type { SentimentDistributionDatum } from "@/components/charts/SentimentDistributionChart";
import { AppShell, PageHeader } from "@/components/layout";
import { SimpleTable } from "@/components/tables/SimpleTable";
import { SENTIMENT_LABELS, SENTIMENT_META } from "@/constants/sentiment";
import { researchResults } from "@/lib/research-results";
import { researchSentimentPredictionSamples } from "@/lib/research-sample-reviews";
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

const sentimentPreview = researchSentimentPredictionSamples[0];
const dominantSentiment = researchResults.datasetSummary.finalLabelDistribution.reduce(
  (current, item) => (item.count > current.count ? item : current),
  researchResults.datasetSummary.finalLabelDistribution[0],
);

export default function SentimentAnalysisPage() {
  return (
    <AppShell>
      <PageHeader
        description="Ringkasan hasil riset IndoBERT, distribusi sentimen final, dan sampel prediksi dari artefak evaluasi."
        eyebrow="IndoBERT"
        title="Analisis Sentimen"
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          description="Total ulasan dari pipeline riset."
          label="Total Ulasan"
          value={researchResults.datasetSummary.totalReviews.toLocaleString("id-ID")}
        />
        <StatCard
          description="Label final terbanyak setelah relabeling."
          label="Label Dominan"
          tone="primary"
          value={dominantSentiment?.label ?? "Belum tersedia"}
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
          description="Contoh ini berasal dari file prediksi evaluasi IndoBERT; frontend tidak menjalankan inferensi model."
          title="Contoh Input Ulasan dari Artefak Riset"
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
              defaultValue={sentimentPreview?.reviewText ?? "Belum tersedia di artefak riset"}
              id="mock-review-input"
              readOnly
            />
            <button
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
              disabled
              type="button"
            >
              Prediksi dari Artefak Evaluasi
            </button>
          </div>
        </ChartCard>

        <SummaryCard
          description="Kartu ini menunjukkan sampel output IndoBERT dari artefak evaluasi, bukan inferensi runtime frontend."
          items={[
            {
              label: "Prediksi",
              value: (
                <SentimentBadge
                  sentiment={sentimentPreview?.predictedLabel ?? "neutral"}
                />
              ),
              description: "Label prediksi IndoBERT pada sampel evaluasi.",
            },
            {
              label: "Confidence",
              value: sentimentPreview
                ? formatMetricPercent(sentimentPreview.confidence)
                : "Belum tersedia",
              description: "Confidence dari prediction artifact.",
            },
            {
              label: "Label final",
              value: (
                <SentimentBadge
                  sentiment={sentimentPreview?.finalLabel ?? "neutral"}
                />
              ),
              description: "Label target setelah relabeling.",
            },
            {
              label: "Model",
              value: researchResults.indobertEvaluation.modelName,
              description: researchResults.indobertEvaluation.finalCandidate,
            },
            {
              label: "Status",
              value: "Artefak riset",
              description: "Belum menjalankan inferensi API dari halaman frontend.",
            },
          ]}
          title="Hasil Prediksi Sentimen - Sampel Riset"
        >
          <p className="rounded-md border border-blue-100 bg-blue-50 px-4 py-3 text-sm leading-6 text-blue-900">
            Sampel prediksi ini dibaca dari output evaluasi IndoBERT
            `run_3_weighted_loss_lr_1e-5`. Gunakan halaman Evaluasi Model untuk
            membaca metrik agregat.
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
        description="Sampel kecil dari `indobert_test_predictions.csv`; bukan panggilan API runtime."
        title="Tabel Sampel Prediksi Sentimen Riset"
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
              render: (row) => <SentimentBadge sentiment={row.predictedLabel} />,
            },
            {
              key: "finalLabel",
              header: "Final",
              render: (row) => <SentimentBadge sentiment={row.finalLabel} />,
            },
            {
              key: "confidence",
              header: "Confidence",
              align: "right",
              render: (row) => formatMetricPercent(row.confidence),
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
          data={researchSentimentPredictionSamples}
          minWidthClassName="min-w-[940px]"
          rowKey={(row) => row.id}
        />
      </ChartCard>
    </AppShell>
  );
}
