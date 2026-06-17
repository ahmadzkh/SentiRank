import { ApiGatewayAlert } from "@/components/alerts/ApiGatewayAlert";
import { AhpRankingComparisonChart } from "@/components/charts/AhpRankingComparisonChart";
import { AspectRankingChart } from "@/components/charts/AspectRankingChart";
import { SentimentStageComparisonChart } from "@/components/charts/SentimentStageComparisonChart";
import { ChartCard } from "@/components/cards/ChartCard";
import { ModelMetricCard } from "@/components/cards/ModelMetricCard";
import { StatCard } from "@/components/cards/StatCard";
import { AppShell, PageHeader } from "@/components/layout";
import { SimpleTable } from "@/components/tables/SimpleTable";
import type { SimpleTableColumn } from "@/components/tables/SimpleTable";
import {
  getDashboardSummary,
  type DashboardRecommendationRow,
  type DashboardReviewInsightRow,
} from "@/services/dashboard-service";
import { EMPTY_GATEWAY_MESSAGE } from "@/lib/api-status";

export const dynamic = "force-dynamic";

const EMPTY_MESSAGE = EMPTY_GATEWAY_MESSAGE;

const rankingColumns: readonly SimpleTableColumn<DashboardRecommendationRow>[] = [
  {
    key: "rank",
    header: "Rank",
    align: "center",
    render: (row) => row.rank,
  },
  {
    key: "criteria",
    header: "Kriteria",
    render: (row) => (
      <span className="font-medium text-foreground">{row.criteria}</span>
    ),
  },
  {
    key: "ahpWeight",
    header: "AHP Weight",
    align: "right",
    render: (row) => row.ahpWeight,
  },
  {
    key: "fuzzyAhpWeight",
    header: "Fuzzy AHP Weight",
    align: "right",
    render: (row) => row.fuzzyAhpWeight,
  },
  {
    key: "negativeReviewCount",
    header: "Jumlah Ulasan Negatif",
    align: "right",
    render: (row) => row.negativeReviewCount,
  },
  {
    key: "priorityScore",
    header: "Priority Score",
    align: "right",
    render: (row) => row.priorityScore,
  },
  {
    key: "recommendation",
    header: "Rekomendasi",
    className: "min-w-[220px]",
    render: (row) => (
      <span className="line-clamp-3 text-muted-foreground">
        {row.recommendation}
      </span>
    ),
  },
  {
    key: "interpretation",
    header: "Interpretasi",
    className: "min-w-[220px]",
    render: (row) => (
      <span className="line-clamp-3 text-muted-foreground">
        {row.interpretation}
      </span>
    ),
  },
];

const reviewInsightColumns: readonly SimpleTableColumn<DashboardReviewInsightRow>[] = [
  {
    key: "no",
    header: "No",
    align: "center",
    className: "w-16",
    render: (_row, index) => index + 1,
  },
  {
    key: "reviewText",
    header: "Review Text",
    className: "min-w-[260px] max-w-[340px]",
    render: (row) => (
      <span className="line-clamp-2 break-words font-medium text-foreground">
        {row.reviewText}
      </span>
    ),
  },
  {
    key: "cleanedText",
    header: "Cleaned Text",
    className: "min-w-[260px] max-w-[340px]",
    render: (row) => (
      <span className="line-clamp-2 break-words text-muted-foreground">
        {row.cleanedText}
      </span>
    ),
  },
  {
    key: "sentiment",
    header: "Sentimen",
    render: (row) => row.sentiment,
  },
  {
    key: "aspectCriteria",
    header: "Aspek/Kriteria",
    render: (row) => row.aspectCriteria,
  },
  {
    key: "rating",
    header: "Rating",
    align: "right",
    render: (row) => row.rating,
  },
  {
    key: "appVersion",
    header: "App Version",
    render: (row) => row.appVersion,
  },
  {
    key: "reviewDate",
    header: "Review Date",
    render: (row) => row.reviewDate,
  },
  {
    key: "source",
    header: "Source",
    render: (row) => row.source,
  },
  {
    key: "modelVersion",
    header: "Model Version",
    className: "min-w-[180px]",
    render: (row) => row.modelVersion,
  },
];

export default async function DashboardPage() {
  const dashboard = await getDashboardSummary();

  return (
    <AppShell>
      <PageHeader
        description="Ringkasan hasil penelitian analisis sentimen ulasan Spotify dan prioritas aspek layanan."
        title="Dashboard"
      />

      <ApiGatewayAlert error={dashboard.apiError} />

      <section>
        <SectionHeading title="Ringkasan Dataset" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
          {dashboard.datasetCards.map((card) => (
            <StatCard
              description={card.description}
              key={card.id}
              label={card.label}
              tone={card.tone}
              value={card.value}
            />
          ))}
        </div>
      </section>

      <section>
        <SectionHeading title="Ringkasan Performa Model" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {dashboard.modelMetrics.map((metric) => (
            <ModelMetricCard
              description={metric.description}
              key={metric.id}
              label={metric.label}
              value={metric.value}
            />
          ))}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <ChartCard title="Distribusi Sentimen per Tahap">
          <SentimentStageComparisonChart data={dashboard.sentimentStages} />
        </ChartCard>

        <ChartCard title="Top 5 Aspek Negatif">
          <AspectRankingChart data={dashboard.topAspects} />
        </ChartCard>
      </section>

      <ChartCard
        className="w-full"
        title="Perbandingan Prioritas AHP dan Fuzzy AHP"
      >
        <AhpRankingComparisonChart data={dashboard.priorityComparison} />
      </ChartCard>

      <ChartCard className="w-full" title="Rekomendasi Prioritas">
        <SimpleTable
          columns={rankingColumns}
          data={dashboard.priorityRows}
          emptyMessage={EMPTY_MESSAGE}
          minWidthClassName="min-w-[1180px]"
          rowKey={(row) => row.id}
        />
      </ChartCard>

      <ChartCard
        description="Sampel insight review final dari API Gateway. Jika Gateway tidak aktif, tabel tetap kosong."
        title="Sampel Hasil Review Terproses"
      >
        <SimpleTable
          columns={reviewInsightColumns}
          data={dashboard.reviewInsightRows}
          emptyMessage={EMPTY_MESSAGE}
          minWidthClassName="min-w-[1320px]"
          rowKey={(row) => row.id}
        />
      </ChartCard>
    </AppShell>
  );
}

function SectionHeading({ title }: { title: string }) {
  return (
    <div className="mb-4">
      <h2 className="text-base font-semibold text-foreground">{title}</h2>
    </div>
  );
}
