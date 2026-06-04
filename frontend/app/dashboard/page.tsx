import { AspectRankingChart } from "@/components/charts/AspectRankingChart";
import type { AspectRankingDatum } from "@/components/charts/AspectRankingChart";
import { AhpRankingComparisonChart } from "@/components/charts/AhpRankingComparisonChart";
import type { AhpRankingComparisonDatum } from "@/components/charts/AhpRankingComparisonChart";
import { SentimentDistributionChart } from "@/components/charts/SentimentDistributionChart";
import type { SentimentDistributionDatum } from "@/components/charts/SentimentDistributionChart";
import { ChartCard } from "@/components/cards/ChartCard";
import { ModelMetricCard } from "@/components/cards/ModelMetricCard";
import { RankingCard } from "@/components/cards/RankingCard";
import type { RankingCardItem } from "@/components/cards/RankingCard";
import { StatCard } from "@/components/cards/StatCard";
import { SummaryCard } from "@/components/cards/SummaryCard";
import { AppShell, PageHeader } from "@/components/layout";
import { ReviewTable } from "@/components/tables/ReviewTable";
import { SENTIMENT_LABELS, SENTIMENT_META } from "@/constants/sentiment";
import {
  mockAhpResult,
  mockFuzzyAhpResult,
} from "@/lib/mock-data";
import { researchEdaResults } from "@/lib/research-eda-results";
import { researchResults } from "@/lib/research-results";
import { researchSampleReviews } from "@/lib/research-sample-reviews";
import type { ReviewSentimentLabel } from "@/types/sentiment";

function formatWeight(value: number) {
  return `${Math.round(value * 100)}%`;
}

function formatMetricPercent(value: number) {
  return `${(value * 100).toFixed(2)}%`;
}

function getShortLabel(label: string) {
  return label.split(" ").slice(0, 2).join(" ");
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

const negativeAspectRankingData =
  researchResults.aspectSummary.negativeAspectDistribution.map((item) => ({
    aspect: item.label,
    label: item.label,
    count: item.count,
  })) satisfies AspectRankingDatum[];

const priorityComparisonData = mockAhpResult.ranking.map((ahpItem) => {
  const fuzzyItem = mockFuzzyAhpResult.ranking.find(
    (item) => item.criterionId === ahpItem.criterionId,
  );

  return {
    criterionId: ahpItem.criterionId,
    label: ahpItem.label,
    shortLabel: getShortLabel(ahpItem.label),
    ahpWeight: Math.round(ahpItem.weight * 100),
    fuzzyAhpWeight: Math.round((fuzzyItem?.normalizedWeight ?? 0) * 100),
  };
}) satisfies AhpRankingComparisonDatum[];

const priorityRankingItems = mockAhpResult.ranking
  .slice(0, 3)
  .map((item) => ({
    id: item.criterionId,
    rank: item.rank,
    label: item.label,
    score: formatWeight(item.weight),
    description: item.interpretation,
  })) satisfies RankingCardItem[];

const latestNegativeReviews = researchSampleReviews
  .filter((review) => review.sentimentLabel === "negative")
  .sort(
    (first, second) =>
      new Date(second.reviewDate).getTime() -
      new Date(first.reviewDate).getTime(),
  )
  .slice(0, 5);

const modelMetricCards = [
  {
    description: "Macro F1 kandidat final IndoBERT run_3.",
    label: "IndoBERT Macro F1",
    modelName: "IndoBERT",
    value: formatMetricPercent(researchResults.indobertEvaluation.f1Macro),
  },
  {
    description: "F1 kelas Netral kandidat final IndoBERT run_3.",
    label: "F1 Netral",
    modelName: "IndoBERT",
    value: formatMetricPercent(researchResults.indobertEvaluation.neutralF1),
  },
  {
    description: "Accuracy classifier final SVM merged_5class.",
    label: "SVM Accuracy",
    modelName: "SVM",
    value: formatMetricPercent(researchResults.svmEvaluation.accuracy),
  },
  {
    description: "Macro F1 classifier final SVM merged_5class.",
    label: "SVM Macro F1",
    modelName: "SVM",
    value: formatMetricPercent(researchResults.svmEvaluation.f1Macro),
  },
  {
    description: "F1 kelas minimum untuk stabilitas kelas minoritas SVM.",
    label: "F1 Kelas Minimum",
    modelName: "SVM",
    value: formatMetricPercent(researchResults.svmEvaluation.minClassF1),
  },
];

const topNegativeAspectLabel = researchResults.aspectSummary.topNegativeAspect.label;
const positiveCount =
  researchResults.datasetSummary.finalLabelDistribution.find(
    (item) => item.label === "Positive",
  )?.count ?? 0;
const neutralCount =
  researchResults.datasetSummary.finalLabelDistribution.find(
    (item) => item.label === "Neutral",
  )?.count ?? 0;
const negativeCount =
  researchResults.datasetSummary.finalLabelDistribution.find(
    (item) => item.label === "Negative",
  )?.count ?? 0;

export default function DashboardPage() {
  return (
    <AppShell>
      <PageHeader
        description="Ringkasan demo skripsi untuk sentimen ulasan Spotify, aspek negatif, preview prioritas AHP/Fuzzy AHP, performa model, dan ulasan negatif terbaru."
        eyebrow="Dashboard Analitik Penelitian"
        title="Dashboard"
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        <StatCard
          description="Total ulasan dari pipeline riset SentiRank."
          label="Total Ulasan"
          value={researchResults.datasetSummary.totalReviews.toLocaleString("id-ID")}
        />
        <StatCard
          description="Label final setelah relabeling pipeline."
          label="Ulasan Positif"
          tone="positive"
          value={positiveCount.toLocaleString("id-ID")}
        />
        <StatCard
          description="Label final setelah relabeling pipeline."
          label="Ulasan Netral"
          tone="neutral"
          value={neutralCount.toLocaleString("id-ID")}
        />
        <StatCard
          description="Label final setelah relabeling pipeline."
          label="Ulasan Negatif"
          tone="negative"
          value={negativeCount.toLocaleString("id-ID")}
        />
        <StatCard
          description={`${researchResults.aspectSummary.topNegativeAspect.count.toLocaleString("id-ID")} sinyal negatif weak-label.`}
          label="Aspek Negatif Tertinggi"
          tone="primary"
          value={topNegativeAspectLabel}
        />
        <StatCard
          description="AHP/Fuzzy AHP masih sample development, bukan hasil final."
          label="Skor Prioritas"
          tone="primary"
          value="Sampel"
        />
      </section>

      <SummaryCard
        description="Ringkasan EDA dataset dari artefak `datasets/outputs/eda`, bukan data mock."
        items={[
          {
            label: "Review mentah",
            value: researchEdaResults.datasetSummary.rawReviewCount.toLocaleString(
              "id-ID",
            ),
            description: "Jumlah review hasil akuisisi Spotify Play Store.",
          },
          {
            label: "Dataset aspek",
            value:
              researchEdaResults.datasetSummary.processedAspectRows.toLocaleString(
                "id-ID",
              ),
            description: "Baris final untuk klasifikasi aspek SVM.",
          },
          {
            label: "Puncak bulan",
            value: `${researchEdaResults.temporalPeakMonths[0]?.month ?? "TBD"} (${researchEdaResults.temporalPeakMonths[0]?.total.toLocaleString("id-ID") ?? "0"} ulasan)`,
            description: "Bulan dengan jumlah review tertinggi pada EDA temporal.",
          },
          {
            label: "Median panjang teks",
            value: `${researchEdaResults.rawTextLengthSummary.median} karakter`,
            description: "Median panjang review mentah.",
          },
        ]}
        title="Ringkasan EDA Dataset"
      />

      <section className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <ChartCard
          description="Distribusi final sentimen dari pipeline relabeling SentiRank."
          insight={`${negativeCount.toLocaleString("id-ID")} dari ${researchResults.datasetSummary.totalReviews.toLocaleString("id-ID")} ulasan berlabel negatif setelah relabeling.`}
          title="Distribusi Sentimen"
        >
          <SentimentDistributionChart data={sentimentDistributionData} />
        </ChartCard>

        <ChartCard
          description="Ranking aspek negatif dari weak-label refinement yang dipetakan ke kandidat merged_5class."
          insight={`${topNegativeAspectLabel} menjadi aspek negatif tertinggi pada artefak riset sementara.`}
          title="Ranking Aspek Negatif"
        >
          <AspectRankingChart data={negativeAspectRankingData} />
        </ChartCard>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        <ChartCard
          description="Perbandingan bobot AHP dan Fuzzy AHP dari output mock fallback FE-13."
          insight={researchResults.reportSummary.ahpFuzzyAhpDemoLimitation}
          title="Preview Prioritas AHP / Fuzzy AHP"
        >
          <AhpRankingComparisonChart data={priorityComparisonData} />
        </ChartCard>

        <RankingCard
          description="Kandidat prioritas mock fallback. Lihat halaman AHP/Fuzzy AHP untuk demo API backend sampel."
          items={priorityRankingItems}
          title="Ranking Prioritas"
        />
      </section>

      <section>
        <div className="mb-4">
          <h3 className="text-base font-semibold text-foreground">
            Ringkasan Performa Model
          </h3>
          <p className="mt-1 text-sm leading-5 text-muted-foreground">
            Metrik berasal dari artefak evaluasi riset: IndoBERT
            run_3_weighted_loss_lr_1e-5 dan SVM merged_5class.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {modelMetricCards.map((metric) => (
            <ModelMetricCard
              description={metric.description}
              key={metric.label}
              label={metric.label}
              modelName={metric.modelName}
              value={metric.value}
            />
          ))}
        </div>
      </section>

      <ChartCard
        description="Sampel kecil dari dataset riset; external_id asli tidak ditampilkan di frontend."
        title="Sampel Ulasan Negatif Riset"
      >
        <ReviewTable
          emptyMessage="Belum ada ulasan negatif pada sampel riset saat ini."
          reviews={latestNegativeReviews}
        />
      </ChartCard>

      <section className="rounded-lg border border-blue-100 bg-blue-50 p-5 shadow-sm">
        <p className="text-sm font-semibold text-blue-900">
          Ringkasan Rekomendasi
        </p>
        <p className="mt-2 max-w-4xl text-sm leading-6 text-blue-900">
          {researchResults.reportSummary.modelEvaluationFindings}
        </p>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {researchResults.reportSummary.highLevelFindings.slice(0, 3).map((highlight) => (
            <div
              className="rounded-md border border-blue-100 bg-white px-4 py-3 text-sm leading-6 text-slate-700"
              key={highlight}
            >
              {highlight}
            </div>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
