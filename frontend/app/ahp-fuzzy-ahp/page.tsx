import { ApiGatewayAlert } from "@/components/alerts/ApiGatewayAlert";
import { ChartCard } from "@/components/cards/ChartCard";
import { StatCard } from "@/components/cards/StatCard";
import { AhpRankingComparisonChart } from "@/components/charts/AhpRankingComparisonChart";
import { AppShell, PageHeader } from "@/components/layout";
import {
  SimpleTable,
  type SimpleTableColumn,
} from "@/components/tables/SimpleTable";
import {
  getAhpFuzzyAhpOverview,
  type AhpFuzzyAhpNotice,
  type AhpFuzzyAhpSummaryCard,
  type ComparisonRow,
  type CriteriaOverviewRow,
  type MethodSummary,
  type MethodWeightRow,
  type PriorityRow,
} from "@/services/ahp-overview-service";
import { EMPTY_GATEWAY_MESSAGE } from "@/lib/api-status";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const EMPTY_MESSAGE = EMPTY_GATEWAY_MESSAGE;

const criteriaColumns: readonly SimpleTableColumn<CriteriaOverviewRow>[] = [
  {
    key: "no",
    header: "No",
    align: "center",
    className: "w-16",
    render: (row) => row.no,
  },
  {
    key: "criterion",
    header: "Kriteria",
    render: (row) => (
      <span className="font-medium text-foreground">{row.criterion}</span>
    ),
  },
  {
    key: "description",
    header: "Deskripsi",
    className: "min-w-[280px]",
    render: (row) => (
      <span className="line-clamp-3 text-muted-foreground">
        {row.description}
      </span>
    ),
  },
  {
    key: "negativeReviewCount",
    header: "Jumlah Ulasan Negatif",
    align: "right",
    render: (row) => row.negativeReviewCount,
  },
  {
    key: "complaintExample",
    header: "Contoh Keluhan",
    className: "min-w-[220px]",
    render: (row) => (
      <span className="line-clamp-2 text-muted-foreground">
        {row.complaintExample}
      </span>
    ),
  },
];

const weightColumns: readonly SimpleTableColumn<MethodWeightRow>[] = [
  {
    key: "rank",
    header: "Rank",
    align: "center",
    render: (row) => row.rank,
  },
  {
    key: "criterion",
    header: "Kriteria",
    render: (row) => (
      <span className="font-medium text-foreground">{row.criterion}</span>
    ),
  },
  {
    key: "weight",
    header: "Bobot",
    align: "right",
    render: (row) => row.weight,
  },
  {
    key: "percent",
    header: "Persentase Bobot",
    align: "right",
    render: (row) => row.percent,
  },
  {
    key: "status",
    header: "Status",
    render: (row) => row.status,
  },
];

const comparisonColumns: readonly SimpleTableColumn<ComparisonRow>[] = [
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
    header: "Interpretasi Singkat",
    className: "min-w-[220px]",
    render: (row) => row.interpretation,
  },
];

const priorityColumns: readonly SimpleTableColumn<PriorityRow>[] = [
  {
    key: "rank",
    header: "Rank",
    align: "center",
    render: (row) => row.rank,
  },
  {
    key: "criterion",
    header: "Kriteria",
    render: (row) => (
      <span className="font-medium text-foreground">{row.criterion}</span>
    ),
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
    key: "priority",
    header: "Prioritas",
    render: (row) => row.priority,
  },
  {
    key: "recommendation",
    header: "Rekomendasi Singkat",
    className: "min-w-[300px]",
    render: (row) => (
      <span className="line-clamp-3 text-muted-foreground">
        {row.recommendation}
      </span>
    ),
  },
];

export default async function AhpFuzzyAhpPage() {
  const overview = await getAhpFuzzyAhpOverview();
  const priorityRankingTitle =
    overview.dataStatus === "sample"
      ? "Ranking Prioritas Sample"
      : "Ranking Prioritas";

  return (
    <AppShell>
      <PageHeader
        description="Halaman ini menampilkan prioritas aspek ulasan negatif berdasarkan metode AHP dan Fuzzy AHP. Bobot prioritas digunakan untuk membantu menentukan aspek yang perlu mendapatkan perhatian lebih dalam pengembangan layanan Spotify."
        title="AHP / Fuzzy AHP"
      />

      <ApiGatewayAlert error={overview.apiError} />

      {overview.dataStatus !== "unavailable" ? (
        <DataNotice notice={overview.notice} />
      ) : null}

      {overview.isServiceUnavailable ? <UnavailableState /> : null}

      <section>
        <SectionHeading title="Ringkasan Prioritas" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {overview.summaryCards.map((card) => (
            <SummaryStatCard card={card} key={card.id} />
          ))}
        </div>
      </section>

      <ChartCard
        description="Daftar kriteria yang digunakan dalam perhitungan AHP."
        title="Tinjauan Kriteria"
      >
        <SimpleTable
          columns={criteriaColumns}
          data={overview.criteriaRows}
          emptyMessage={EMPTY_MESSAGE}
          minWidthClassName="min-w-[980px]"
          rowKey={(row) => row.id}
        />
      </ChartCard>

      <ChartCard
        description="Hasil AHP diringkas sebagai ranking dan bobot prioritas per kriteria."
        title="Hasil AHP"
      >
        <MethodSummaryStrip
          labels={{
            top: "Ranking pertama",
            consistency: "Consistency Ratio",
            status: "Status konsistensi",
            count: "Jumlah kriteria",
          }}
          summary={overview.ahpSummary}
        />
        <div className="mt-5">
          <SimpleTable
            columns={weightColumns}
            data={overview.ahpRows}
            emptyMessage={EMPTY_MESSAGE}
            minWidthClassName="min-w-[760px]"
            rowKey={(row) => row.id}
          />
        </div>
      </ChartCard>

      <ChartCard
        description="Hasil Fuzzy AHP diringkas sebagai bobot yang mempertimbangkan ketidakpastian penilaian expert."
        title="Hasil Fuzzy AHP"
      >
        <MethodSummaryStrip
          labels={{
            top: "Ranking pertama",
            consistency: "Nilai konsistensi",
            status: "Status data",
            count: "Jumlah kriteria",
          }}
          summary={overview.fuzzySummary}
        />
        <div className="mt-5">
          <SimpleTable
            columns={weightColumns}
            data={overview.fuzzyRows}
            emptyMessage={EMPTY_MESSAGE}
            minWidthClassName="min-w-[760px]"
            rowKey={(row) => row.id}
          />
        </div>
      </ChartCard>

      <ChartCard
        description="Perbandingan membantu melihat apakah ranking kriteria tetap stabil pada kedua metode."
        insight={
          overview.dataStatus === "sample"
            ? "Interpretasi ranking masih perlu dibaca hati-hati jika data berstatus sample."
            : null
        }
        title="Perbandingan AHP vs Fuzzy AHP"
      >
        <AhpRankingComparisonChart data={overview.chartData} />
        <div className="mt-6">
          <SimpleTable
            columns={comparisonColumns}
            data={overview.comparisonRows}
            emptyMessage={EMPTY_MESSAGE}
            minWidthClassName="min-w-[1080px]"
            rowKey={(row) => row.id}
          />
        </div>
      </ChartCard>

      <ChartCard
        description="Ranking ini membantu menentukan urutan perhatian terhadap aspek ulasan negatif."
        title={priorityRankingTitle}
      >
        <SimpleTable
          columns={priorityColumns}
          data={overview.priorityRows}
          emptyMessage={EMPTY_MESSAGE}
          minWidthClassName="min-w-[1040px]"
          rowKey={(row) => row.id}
        />
      </ChartCard>

      {/* <RecommendationCard
        basis={overview.recommendationBasis}
        note="Rekomendasi ini bersifat display-only dan tidak menjalankan perhitungan baru di frontend."
        recommendation={<p>{overview.recommendationText}</p>}
        title={overview.recommendationTitle}
      /> */}

      {/* <SummaryCard
        description="Catatan ini menjaga interpretasi halaman tetap sesuai batasan metodologi saat ini."
        title="Catatan Interpretasi"
      >
        <div className="grid gap-3 md:grid-cols-2">
          {overview.interpretationNotes.map((note) => (
            <p
              className="rounded-md border border-border bg-background px-4 py-3 text-sm leading-6 text-muted-foreground"
              key={note}
            >
              {note}
            </p>
          ))}
        </div>
      </SummaryCard> */}
    </AppShell>
  );
}

function SummaryStatCard({ card }: { card: AhpFuzzyAhpSummaryCard }) {
  return (
    <StatCard
      description={card.description}
      label={card.label}
      tone={card.tone}
      value={card.value}
    />
  );
}

function DataNotice({ notice }: { notice: AhpFuzzyAhpNotice }) {
  const className = {
    final: "border-green-200 bg-green-50 text-green-900",
    info: "border-slate-200 bg-slate-50 text-slate-700",
    sample: "border-amber-200 bg-amber-50 text-amber-900",
  }[notice.tone];

  return (
    <div
      className={cn("rounded-lg border px-4 py-3 text-sm leading-6", className)}
    >
      {notice.text}
    </div>
  );
}

function UnavailableState() {
  return (
    <section className="rounded-lg border border-border bg-card p-6 shadow-sm">
      <h3 className="text-base font-semibold text-foreground">
        Data belum dapat ditampilkan
      </h3>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
        {EMPTY_GATEWAY_MESSAGE}
      </p>
    </section>
  );
}

function MethodSummaryStrip({
  labels,
  summary,
}: {
  labels: {
    top: string;
    consistency: string;
    status: string;
    count: string;
  };
  summary: MethodSummary;
}) {
  return (
    <dl className="grid gap-3 sm:grid-cols-2">
      <MethodSummaryItem label={labels.top} value={summary.topCriterion} />
      <MethodSummaryItem
        label={labels.consistency}
        value={summary.consistencyRatio}
      />
      <MethodSummaryItem
        label={labels.status}
        value={summary.consistencyStatus}
      />
      <MethodSummaryItem label={labels.count} value={summary.criteriaCount} />
    </dl>
  );
}

function MethodSummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-l-2 border-blue-200 pl-3">
      <dt className="text-xs font-medium uppercase tracking-normal text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 text-sm font-semibold text-foreground">{value}</dd>
    </div>
  );
}

function SectionHeading({ title }: { title: string }) {
  return (
    <div className="mb-4">
      <h2 className="text-base font-semibold text-foreground">{title}</h2>
    </div>
  );
}
