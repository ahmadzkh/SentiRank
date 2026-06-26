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
} from "@/services/ahp-overview-service";
import { EMPTY_GATEWAY_MESSAGE } from "@/lib/api-status";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const EMPTY_MESSAGE = EMPTY_GATEWAY_MESSAGE;

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
    header: "Interpretasi",
    className: "min-w-[220px]",
    render: (row) => row.interpretation,
  },
];

export default async function AhpFuzzyAhpPage() {
  const overview = await getAhpFuzzyAhpOverview();

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

      {/* Section 1: Ringkasan Prioritas */}
      <section>
        <SectionHeading title="Ringkasan Prioritas" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {overview.summaryCards.map((card) => (
            <SummaryStatCard card={card} key={card.id} />
          ))}
        </div>
      </section>

      {/* Section 2: Chart + Comparison Table */}
      <ChartCard
        description="Perbandingan bobot AHP dan Fuzzy AHP per kriteria. Ranking menunjukkan prioritas relatif tiap aspek."
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

      {/* Section 3: Catatan Metodologis */}
      <MethodNote
        rs={overview.respondentSummary}
        dataStatus={overview.dataStatus}
      />
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

function MethodNote({
  rs,
  dataStatus,
}: {
  rs: {
    totalRespondents: number;
    validCount: number;
    invalidCount: number;
    actualCount: number;
    syntheticCount: number;
    ahpConsistencyRatio: string;
    note: string;
  };
  dataStatus: string;
}) {
  const showData =
    dataStatus !== "unavailable" && dataStatus !== "pending" && rs.totalRespondents > 0;

  if (!showData) return null;

  return (
    <ChartCard
      description="Informasi metodologis tentang data dan metode yang digunakan."
      title="Catatan Metodologis"
    >
      <div className="space-y-3 text-sm leading-6 text-muted-foreground">
        <p>
          <strong>Data:</strong> Hasil perhitungan AHP dan Fuzzy AHP
          berdasarkan penilaian berpasangan dari {rs.totalRespondents} responden
          ({rs.validCount} valid, {rs.invalidCount} tidak konsisten).
        </p>
        <p>
          <strong>Komposisi responden:</strong>{" "}
          {rs.actualCount > 0
            ? `${rs.actualCount} penilaian aktual, `
            : ""}
          {rs.syntheticCount > 0
            ? `${rs.syntheticCount} data simulasi/sintetis untuk pengujian mekanisme AHP dan Fuzzy AHP.`
            : "Semua responden berasal dari penilaian aktual."}
        </p>
        <p>
          <strong>Metode AHP:</strong> Geometric mean + eigenvalue
          (Consistency Ratio = {rs.ahpConsistencyRatio}).
        </p>
        <p>
          <strong>Metode Fuzzy AHP:</strong> TFN geometric mean + centroid
          defuzzification.
        </p>
        {rs.note ? (
          <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-2 text-amber-900">
            {rs.note}
          </div>
        ) : null}
      </div>
    </ChartCard>
  );
}

function SectionHeading({ title }: { title: string }) {
  return (
    <div className="mb-4">
      <h2 className="text-base font-semibold text-foreground">{title}</h2>
    </div>
  );
}
