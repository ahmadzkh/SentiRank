import { ConsistencyBadge } from "@/components/badges/ConsistencyBadge";
import { ChartCard } from "@/components/cards/ChartCard";
import { RankingCard } from "@/components/cards/RankingCard";
import type { RankingCardItem } from "@/components/cards/RankingCard";
import { RecommendationCard } from "@/components/cards/RecommendationCard";
import { StatCard } from "@/components/cards/StatCard";
import { SummaryCard } from "@/components/cards/SummaryCard";
import { AhpRankingComparisonChart } from "@/components/charts/AhpRankingComparisonChart";
import type { AhpRankingComparisonDatum } from "@/components/charts/AhpRankingComparisonChart";
import { CriteriaEditor } from "@/components/forms/CriteriaEditor";
import { PairwiseComparisonInput } from "@/components/forms/PairwiseComparisonInput";
import { AppShell, PageHeader } from "@/components/layout";
import { MatrixTable } from "@/components/tables/MatrixTable";
import { SimpleTable } from "@/components/tables/SimpleTable";
import {
  mockAhpCriteria,
  mockAhpResult,
  mockFuzzyAhpResult,
} from "@/lib/mock-data";
import type { FuzzyTriangularNumber } from "@/types/fuzzy-ahp";

const CONSISTENCY_THRESHOLD = 0.1;

function formatWeight(value: number) {
  return `${Math.round(value * 100)}%`;
}

function formatDecimal(value: number) {
  return new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 3,
  }).format(value);
}

function formatTfn(value: FuzzyTriangularNumber) {
  return `(${formatDecimal(value.lower)}, ${formatDecimal(value.middle)}, ${formatDecimal(value.upper)})`;
}

function getShortLabel(label: string) {
  return label.split(" ").slice(0, 2).join(" ");
}

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

const ahpRankingItems = mockAhpResult.ranking.map((item) => ({
  id: item.criterionId,
  rank: item.rank,
  label: item.label,
  score: formatWeight(item.weight),
  description: item.interpretation,
})) satisfies RankingCardItem[];

const fuzzyRankingItems = mockFuzzyAhpResult.ranking.map((item) => ({
  id: item.criterionId,
  rank: item.rank,
  label: item.label,
  score: formatWeight(item.normalizedWeight),
  description: item.interpretation,
})) satisfies RankingCardItem[];

const topAhpRank = mockAhpResult.ranking[0];
const topFuzzyRank = mockFuzzyAhpResult.ranking[0];

export default function AhpFuzzyAhpPrototypePage() {
  return (
    <AppShell>
      <PageHeader
        description="Prototype frontend untuk menampilkan kriteria, expert judgement, matriks pairwise, Consistency Ratio, bobot AHP, bobot Fuzzy AHP, dan ringkasan rekomendasi berbasis data mock."
        eyebrow="Prototype metode"
        title="AHP / Fuzzy AHP"
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        <StatCard
          description="Jumlah berasal dari kriteria mock dan tetap data-driven."
          label="Kriteria"
          tone="primary"
          value={mockAhpCriteria.length}
        />
        <StatCard
          description="Jumlah judgement mock untuk matriks AHP."
          label="Pairwise"
          value={mockAhpResult.pairwiseComparisons.length}
        />
        <StatCard
          description="Nilai mock, bukan hasil kalkulasi frontend."
          label="Consistency Ratio"
          tone="primary"
          value={
            mockAhpResult.consistencyRatio === null
              ? "Belum tersedia"
              : formatWeight(mockAhpResult.consistencyRatio)
          }
        />
        <StatCard
          description="Prioritas tertinggi dari ranking AHP mock."
          label="Prioritas AHP"
          tone="primary"
          value={topAhpRank?.label ?? "Belum tersedia"}
        />
        <StatCard
          description="Prioritas tertinggi dari ranking Fuzzy AHP mock."
          label="Prioritas Fuzzy AHP"
          tone="primary"
          value={topFuzzyRank?.label ?? "Belum tersedia"}
        />
        <StatCard
          description="Formula final dan mapping TFN belum dikunci."
          label="Status"
          value="Prototype mock"
        />
      </section>

      <SummaryCard
        description="Halaman ini adalah frontend prototype. Nilai ditampilkan untuk demo UI dan belum menjadi hasil penelitian final."
        items={[
          {
            label: "AHP",
            value: mockAhpResult.methodVersion,
            description: mockAhpResult.methodNote,
          },
          {
            label: "Fuzzy AHP",
            value: mockFuzzyAhpResult.methodVersion,
            description: mockFuzzyAhpResult.methodNote,
          },
          {
            label: "TFN",
            value: `${mockFuzzyAhpResult.scaleOptions.length} opsi skala mock`,
            description: "Mapping TFN final tetap menjadi bagian metodologi/backend.",
          },
          {
            label: "Integrasi API",
            value: "Belum aktif",
            description: "Service kalkulasi disiapkan pada fase API integration.",
          },
        ]}
        title="Ringkasan Metode"
      />

      <section className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <ChartCard
          description="Daftar kriteria berasal dari data mock AHP dan tidak mengunci jumlah final kriteria."
          title="Pratinjau Setup Kriteria"
        >
          <CriteriaEditor criteria={mockAhpCriteria} />
        </ChartCard>

        <ChartCard
          description="Pratinjau expert judgement menampilkan nilai pairwise mock tanpa menjalankan perhitungan bobot di frontend."
          title="Pratinjau Expert Judgement / Pairwise Comparison"
        >
          <PairwiseComparisonInput
            comparisons={mockAhpResult.pairwiseComparisons}
            criteria={mockAhpCriteria}
          />
        </ChartCard>
      </section>

      <ChartCard
        description="Matriks dibentuk dari pairwise comparison mock dan nilai resiprokal yang sudah tersedia di data mock."
        insight="Matriks ini bersifat prototype-ready. Frontend hanya memvisualisasikan data, bukan menghitung eigen vector atau bobot AHP."
        title="Matriks Pairwise Comparison AHP"
      >
        <MatrixTable
          comparisons={mockAhpResult.pairwiseComparisons}
          criteria={mockAhpCriteria}
        />
      </ChartCard>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <SummaryCard
          description="Consistency Ratio ditampilkan sebagai status mock untuk membantu menjelaskan validitas judgement pada demo."
          title="Kartu Consistency Ratio"
        >
          <div className="space-y-4">
            <ConsistencyBadge
              ratio={mockAhpResult.consistencyRatio}
              status={mockAhpResult.consistencyStatus}
              threshold={CONSISTENCY_THRESHOLD}
            />
            <p className="text-sm leading-6 text-muted-foreground">
              Nilai ini berasal dari hasil mock. Ambang ditampilkan sebagai
              parameter UI dan tidak melakukan validasi metode di frontend.
            </p>
          </div>
        </SummaryCard>

        <ChartCard
          description="Opsi skala Fuzzy AHP ditampilkan sebagai preview TFN dan belum mengunci mapping final."
          title="Pratinjau Skala TFN Fuzzy AHP"
        >
          <SimpleTable
            columns={[
              {
                key: "label",
                header: "Skala",
                render: (row) => (
                  <span className="font-medium text-foreground">
                    {row.label}
                  </span>
                ),
              },
              {
                key: "tfn",
                header: "TFN",
                render: (row) => formatTfn(row.value),
              },
              {
                key: "status",
                header: "Status",
                render: () => (
                  <span className="rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700">
                    Prototype
                  </span>
                ),
              },
            ]}
            data={mockFuzzyAhpResult.scaleOptions}
            minWidthClassName="min-w-[520px]"
            rowKey={(row) => row.id}
          />
        </ChartCard>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <RankingCard
          description="Ranking AHP mock menggunakan bobot yang sudah tersedia di FE-07."
          items={ahpRankingItems}
          title="Hasil Bobot AHP"
        />

        <RankingCard
          description="Ranking Fuzzy AHP mock menampilkan bobot ternormalisasi dan interpretasi prototype."
          items={fuzzyRankingItems}
          title="Hasil Bobot Fuzzy AHP"
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <ChartCard
          description="Perbandingan bobot mock antara AHP dan Fuzzy AHP untuk membantu demo skripsi."
          insight="Grafik ini membandingkan output mock yang sudah tersedia. Frontend tidak melakukan kalkulasi bobot."
          title="Perbandingan Ranking AHP vs Fuzzy AHP"
        >
          <AhpRankingComparisonChart data={priorityComparisonData} />
        </ChartCard>

        <ChartCard
          description="Tabel numerik disediakan agar bobot dapat dibaca jelas tanpa bergantung pada chart."
          title="Detail Bobot AHP dan Fuzzy AHP"
        >
          <SimpleTable
            columns={[
              {
                key: "label",
                header: "Kriteria",
                className: "max-w-[280px]",
                render: (row) => (
                  <span className="font-medium text-foreground">
                    {row.label}
                  </span>
                ),
              },
              {
                key: "ahp",
                header: "AHP",
                align: "right",
                render: (row) => `${row.ahpWeight}%`,
              },
              {
                key: "fuzzy",
                header: "Fuzzy AHP",
                align: "right",
                render: (row) => `${row.fuzzyAhpWeight}%`,
              },
            ]}
            data={priorityComparisonData}
            minWidthClassName="min-w-[520px]"
            rowKey={(row) => row.criterionId}
          />
        </ChartCard>
      </section>

      <RecommendationCard
        basis={[
          `Prioritas AHP tertinggi: ${topAhpRank?.label ?? "belum tersedia"} (${topAhpRank ? formatWeight(topAhpRank.weight) : "-"})`,
          `Prioritas Fuzzy AHP tertinggi: ${topFuzzyRank?.label ?? "belum tersedia"} (${topFuzzyRank ? formatWeight(topFuzzyRank.normalizedWeight) : "-"})`,
          `Consistency Ratio mock: ${mockAhpResult.consistencyRatio === null ? "belum tersedia" : formatWeight(mockAhpResult.consistencyRatio)}`,
          `Jumlah kriteria aktif: ${mockAhpCriteria.filter((criterion) => criterion.isActive).length}`,
        ]}
        note="Rekomendasi ini hanya ringkasan prototype. Nilai final wajib berasal dari backend calculation service dan artefak metodologi yang tervalidasi."
        recommendation={
          <p>
            Berdasarkan output mock,{" "}
            <span className="font-semibold">
              {topAhpRank?.label ?? "prioritas belum tersedia"}
            </span>{" "}
            menjadi kandidat prioritas utama untuk ditinjau saat demo skripsi.
            Interpretasi ini tidak boleh dipakai sebagai kesimpulan final
            sebelum service kalkulasi AHP/Fuzzy AHP terintegrasi.
          </p>
        }
        title="Ringkasan Rekomendasi Akhir"
      />

      <SummaryCard
        description="Catatan ini sengaja dibuat eksplisit agar prototype tidak disalahpahami sebagai implementasi metodologi final."
        title="Catatan Batasan Metode / Prototype"
      >
        <div className="grid gap-3 md:grid-cols-2">
          {[
            "Frontend tidak menghitung bobot AHP, eigen vector, Consistency Ratio, atau Fuzzy AHP.",
            "Jumlah kriteria, skala expert judgement, dan mapping TFN tetap fleksibel dan data-driven.",
            "Data mock digunakan untuk validasi tata letak, tabel, grafik, dan narasi demo skripsi.",
            "Integrasi backend dan API contract disiapkan pada FE-12.",
          ].map((note) => (
            <p
              className="rounded-md border border-border bg-background px-4 py-3 text-sm leading-6 text-muted-foreground"
              key={note}
            >
              {note}
            </p>
          ))}
        </div>
      </SummaryCard>
    </AppShell>
  );
}
