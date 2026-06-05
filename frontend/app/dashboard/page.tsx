import { AhpRankingComparisonChart } from "@/components/charts/AhpRankingComparisonChart";
import { AspectRankingChart } from "@/components/charts/AspectRankingChart";
import { SentimentStageComparisonChart } from "@/components/charts/SentimentStageComparisonChart";
import { ChartCard } from "@/components/cards/ChartCard";
import { ModelMetricCard } from "@/components/cards/ModelMetricCard";
import { StatCard } from "@/components/cards/StatCard";
import { AppShell, PageHeader } from "@/components/layout";
import { ReviewTable } from "@/components/tables/ReviewTable";
import { SimpleTable } from "@/components/tables/SimpleTable";
import type { SimpleTableColumn } from "@/components/tables/SimpleTable";
import {
  getDashboardSummary,
  type DashboardRankingRow,
} from "@/services/dashboard-service";

export const dynamic = "force-dynamic";

const EMPTY_MESSAGE = "Data belum tersedia";

const rankingColumns: readonly SimpleTableColumn<DashboardRankingRow>[] = [
  {
    key: "rank",
    header: "Rank",
    align: "center",
    render: (row) => row.rank,
  },
  {
    key: "aspect",
    header: "Aspek/Kriteria",
    render: (row) => (
      <span className="font-medium text-foreground">{row.aspect}</span>
    ),
  },
  {
    key: "ahpScore",
    header: "Skor AHP",
    align: "right",
    render: (row) => row.ahpScore,
  },
  {
    key: "ahpRank",
    header: "Rank AHP",
    align: "center",
    render: (row) => row.ahpRank,
  },
  {
    key: "fuzzyScore",
    header: "Skor Fuzzy AHP",
    align: "right",
    render: (row) => row.fuzzyScore,
  },
  {
    key: "fuzzyRank",
    header: "Rank Fuzzy AHP",
    align: "center",
    render: (row) => row.fuzzyRank,
  },
  {
    key: "status",
    header: "Selisih/Status",
    align: "right",
    render: (row) => row.status,
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

      <ChartCard className="w-full" title="Ranking Prioritas">
        <SimpleTable
          columns={rankingColumns}
          data={dashboard.priorityRows}
          emptyMessage={EMPTY_MESSAGE}
          minWidthClassName="min-w-[920px]"
          rowKey={(row) => row.id}
        />
      </ChartCard>

      <ChartCard
        description="Daftar ulasan negatif terbaru dari dataset penelitian."
        title="Ulasan Negatif Terbaru"
      >
        <ReviewTable
          emptyMessage={EMPTY_MESSAGE}
          reviews={dashboard.latestNegativeReviews}
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
