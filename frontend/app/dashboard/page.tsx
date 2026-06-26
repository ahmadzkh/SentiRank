import { ApiGatewayAlert } from "@/components/alerts/ApiGatewayAlert";
import { AhpRankingComparisonChart } from "@/components/charts/AhpRankingComparisonChart";
import { AspectRankingChart } from "@/components/charts/AspectRankingChart";
import { SentimentStageComparisonChart } from "@/components/charts/SentimentStageComparisonChart";
import { ChartCard } from "@/components/cards/ChartCard";
import { ModelMetricCard } from "@/components/cards/ModelMetricCard";
import { StatCard } from "@/components/cards/StatCard";
import { AppShell, PageHeader } from "@/components/layout";
import { SimpleTable, type SimpleTableColumn } from "@/components/tables/SimpleTable";
import {
  getDashboardSummary,
  type DashboardComparisonRow,
  type DashboardReviewInsightRow,
} from "@/services/dashboard-service";
import { EMPTY_GATEWAY_MESSAGE } from "@/lib/api-status";

export const dynamic = "force-dynamic";

const EMPTY_MESSAGE = EMPTY_GATEWAY_MESSAGE;

const comparisonColumns: readonly SimpleTableColumn<DashboardComparisonRow>[] = [
  {
    key: "criterion",
    header: "Kriteria",
    render: (row) => (
      <span className="font-medium text-foreground">{row.criterion}</span>
    ),
  },
  {
    key: "ahpRank",
    header: "Rank AHP",
    align: "center",
    render: (row) => row.ahpRank,
  },
  {
    key: "fuzzyRank",
    header: "Rank Fuzzy AHP",
    align: "center",
    render: (row) => row.fuzzyRank,
  },
  {
    key: "ahpWeight",
    header: "Bobot AHP",
    align: "right",
    render: (row) => row.ahpWeight,
  },
  {
    key: "fuzzyWeight",
    header: "Bobot Fuzzy AHP",
    align: "right",
    render: (row) => row.fuzzyWeight,
  },
  {
    key: "rankChange",
    header: "Perubahan Ranking",
    render: (row) => row.rankChange,
  },
  {
    key: "interpretation",
    header: "Interpretasi",
    className: "min-w-[220px]",
    render: (row) => row.interpretation,
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
    key: "reviewDate",
    header: "Review Date",
    render: (row) => row.reviewDate,
  },
  {
    key: "source",
    header: "Source",
    render: (row) => row.source,
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
        description="Perbandingan bobot AHP dan Fuzzy AHP per kriteria. Ranking menunjukkan prioritas relatif tiap aspek."
        title="Perbandingan AHP vs Fuzzy AHP"
      >
        <AhpRankingComparisonChart data={dashboard.priorityComparison} />
        <div className="mt-6">
          <SimpleTable
            columns={comparisonColumns}
            data={dashboard.comparisonRows}
            emptyMessage={EMPTY_MESSAGE}
            minWidthClassName="min-w-[1080px]"
            rowKey={(row) => row.id}
          />
        </div>
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
