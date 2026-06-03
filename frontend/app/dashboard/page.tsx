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
import { AppShell, PageHeader } from "@/components/layout";
import { ReviewTable } from "@/components/tables/ReviewTable";
import { ASPECT_META } from "@/constants/aspect";
import { SENTIMENT_LABELS, SENTIMENT_META } from "@/constants/sentiment";
import {
  mockAhpResult,
  mockAspectSummary,
  mockFuzzyAhpResult,
  mockModelEvaluation,
  mockReportSummary,
  mockReviews,
  mockSentimentSummary,
} from "@/lib/mock-data";
import type { AspectLabel } from "@/types/aspect";
import type { ModelMetric } from "@/types/evaluation";

function formatWeight(value: number) {
  return `${Math.round(value * 100)}%`;
}

function formatMetricValue(metric: ModelMetric) {
  if (metric.format === "percentage") {
    return formatWeight(metric.value);
  }

  return metric.value.toLocaleString("en");
}

function getShortLabel(label: string) {
  return label.split(" ").slice(0, 2).join(" ");
}

const sentimentDistributionData = SENTIMENT_LABELS.map((label) => ({
  label,
  name: SENTIMENT_META[label].label,
  count: mockSentimentSummary.counts[label],
  percentage: mockSentimentSummary.percentages[label],
  color: SENTIMENT_META[label].chartColor,
})) satisfies SentimentDistributionDatum[];

const negativeAspectRankingData = (
  Object.entries(mockAspectSummary.negativeCounts) as [AspectLabel, number][]
)
  .filter(([, count]) => count > 0)
  .map(([aspect, count]) => ({
    aspect,
    label: ASPECT_META[aspect].label,
    count,
  }))
  .sort((first, second) => second.count - first.count) satisfies AspectRankingDatum[];

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

const latestNegativeReviews = mockReviews
  .filter((review) => review.sentimentLabel === "negative")
  .sort(
    (first, second) =>
      new Date(second.reviewDate).getTime() -
      new Date(first.reviewDate).getTime(),
  )
  .slice(0, 5);

const modelMetricCards = mockModelEvaluation.models.flatMap((model) =>
  model.metrics.map((metric) => ({
    metric,
    modelName: model.modelName,
  })),
);

const topNegativeAspectLabel =
  ASPECT_META[mockAspectSummary.topNegativeAspect].label;

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
          description="Ulasan Spotify sintetis yang digunakan untuk pengembangan UI."
          label="Total Ulasan"
          value={mockSentimentSummary.totalReviews.toLocaleString("en")}
        />
        <StatCard
          description={`${mockSentimentSummary.percentages.positive}% dari ulasan yang dianalisis.`}
          label="Ulasan Positif"
          tone="positive"
          value={mockSentimentSummary.counts.positive}
        />
        <StatCard
          description={`${mockSentimentSummary.percentages.neutral}% dari ulasan yang dianalisis.`}
          label="Ulasan Netral"
          tone="neutral"
          value={mockSentimentSummary.counts.neutral}
        />
        <StatCard
          description={`${mockSentimentSummary.percentages.negative}% dari ulasan yang dianalisis.`}
          label="Ulasan Negatif"
          tone="negative"
          value={mockSentimentSummary.counts.negative}
        />
        <StatCard
          description={`${mockAspectSummary.negativeCounts[mockAspectSummary.topNegativeAspect]} sinyal ulasan negatif.`}
          label="Aspek Negatif Tertinggi"
          tone="primary"
          value={topNegativeAspectLabel}
        />
        <StatCard
          description="Bobot AHP dari preview prioritas mock."
          label="Skor Prioritas"
          tone="primary"
          value={formatWeight(mockReportSummary.prioritization.ahpWeight)}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <ChartCard
          description="Distribusi ulasan positif, netral, dan negatif dari ringkasan mock FE-07."
          insight={`${mockSentimentSummary.counts.negative} dari ${mockSentimentSummary.totalReviews} ulasan bernilai negatif pada sampel dashboard sintetis.`}
          title="Distribusi Sentimen"
        >
          <SentimentDistributionChart data={sentimentDistributionData} />
        </ChartCard>

        <ChartCard
          description="Jumlah aspek negatif dari ringkasan mock klasifikasi aspek SVM."
          insight={`${topNegativeAspectLabel} menjadi aspek negatif tertinggi pada dataset mock ini.`}
          title="Ranking Aspek Negatif"
        >
          <AspectRankingChart data={negativeAspectRankingData} />
        </ChartCard>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        <ChartCard
          description="Perbandingan prototype bobot AHP dan Fuzzy AHP dari output mock FE-07."
          insight="Nilai ini hanya output metode mock; frontend tidak menghitung AHP atau Fuzzy AHP."
          title="Preview Prioritas AHP / Fuzzy AHP"
        >
          <AhpRankingComparisonChart data={priorityComparisonData} />
        </ChartCard>

        <RankingCard
          description="Kandidat prioritas tertinggi berdasarkan output ranking AHP mock."
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
            Metrik evaluasi mock ditampilkan untuk mendukung tampilan demo
            skripsi. Nilai final harus berasal dari artefak model yang sudah
            divalidasi.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {modelMetricCards.map(({ metric, modelName }) => (
            <ModelMetricCard
              description={metric.description}
              key={metric.id}
              label={metric.label}
              modelName={modelName}
              value={formatMetricValue(metric)}
            />
          ))}
        </div>
      </section>

      <ChartCard
        description="Contoh ulasan Spotify negatif terbaru dengan label sentimen dan aspek."
        title="Ulasan Negatif Terbaru"
      >
        <ReviewTable
          emptyMessage="Belum ada ulasan negatif pada data mock saat ini."
          reviews={latestNegativeReviews}
        />
      </ChartCard>

      <section className="rounded-lg border border-blue-100 bg-blue-50 p-5 shadow-sm">
        <p className="text-sm font-semibold text-blue-900">
          Ringkasan Rekomendasi
        </p>
        <p className="mt-2 max-w-4xl text-sm leading-6 text-blue-900">
          {mockReportSummary.prioritization.interpretation}
        </p>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {mockReportSummary.highlights.map((highlight) => (
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
