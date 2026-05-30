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
import { PageHeader } from "@/components/layout";
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
      new Date(second.reviewDate).getTime() - new Date(first.reviewDate).getTime(),
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

export default function Home() {
  return (
    <>
      <PageHeader
        description="A thesis demo overview of Spotify review sentiment, negative aspects, AHP/Fuzzy AHP priority preview, model performance, and latest negative feedback."
        eyebrow="SentiRank Research Analytics Light"
        title="Dashboard"
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        <StatCard
          description="Synthetic Spotify reviews available for UI development."
          label="Total Reviews"
          value={mockSentimentSummary.totalReviews.toLocaleString("en")}
        />
        <StatCard
          description={`${mockSentimentSummary.percentages.positive}% of analyzed reviews.`}
          label="Positive Reviews"
          tone="positive"
          value={mockSentimentSummary.counts.positive}
        />
        <StatCard
          description={`${mockSentimentSummary.percentages.neutral}% of analyzed reviews.`}
          label="Neutral Reviews"
          tone="neutral"
          value={mockSentimentSummary.counts.neutral}
        />
        <StatCard
          description={`${mockSentimentSummary.percentages.negative}% of analyzed reviews.`}
          label="Negative Reviews"
          tone="negative"
          value={mockSentimentSummary.counts.negative}
        />
        <StatCard
          description={`${mockAspectSummary.negativeCounts[mockAspectSummary.topNegativeAspect]} negative review signals.`}
          label="Top Negative Aspect"
          tone="primary"
          value={topNegativeAspectLabel}
        />
        <StatCard
          description="AHP weight from mock priority preview."
          label="Priority Score"
          tone="primary"
          value={formatWeight(mockReportSummary.prioritization.ahpWeight)}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <ChartCard
          description="Positive, neutral, and negative review distribution from FE-07 mock summary."
          insight={`${mockSentimentSummary.counts.negative} of ${mockSentimentSummary.totalReviews} reviews are negative in the synthetic dashboard sample.`}
          title="Sentiment Distribution"
        >
          <SentimentDistributionChart data={sentimentDistributionData} />
        </ChartCard>

        <ChartCard
          description="Negative aspect counts from the mock SVM aspect classification summary."
          insight={`${topNegativeAspectLabel} is the current top negative aspect in this mock dataset.`}
          title="Negative Aspect Ranking"
        >
          <AspectRankingChart data={negativeAspectRankingData} />
        </ChartCard>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        <ChartCard
          description="Prototype comparison of AHP and Fuzzy AHP weights from FE-07 mock outputs."
          insight="These values are mock method outputs only; the frontend does not calculate AHP or Fuzzy AHP."
          title="AHP / Fuzzy AHP Priority Preview"
        >
          <AhpRankingComparisonChart data={priorityComparisonData} />
        </ChartCard>

        <RankingCard
          description="Top priority candidates based on mock AHP ranking output."
          items={priorityRankingItems}
          title="Priority Ranking"
        />
      </section>

      <section>
        <div className="mb-4">
          <h3 className="text-base font-semibold text-foreground">
            Model Performance Summary
          </h3>
          <p className="mt-1 text-sm leading-5 text-muted-foreground">
            Mock evaluation metrics are shown to support a thesis demo view. Final
            values must come from validated model artifacts.
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
        description="Recent negative Spotify review examples with sentiment and aspect labels."
        title="Latest Negative Reviews"
      >
        <ReviewTable
          emptyMessage="No negative reviews available in the current mock data."
          reviews={latestNegativeReviews}
        />
      </ChartCard>

      <section className="rounded-lg border border-blue-100 bg-blue-50 p-5 shadow-sm">
        <p className="text-sm font-semibold text-blue-900">
          Recommendation Summary
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
    </>
  );
}
