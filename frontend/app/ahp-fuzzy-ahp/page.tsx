import { AhpGatewayDemoPanel } from "@/components/cards/AhpGatewayDemoPanel";
import { ChartCard } from "@/components/cards/ChartCard";
import { RankingCard } from "@/components/cards/RankingCard";
import { RecommendationCard } from "@/components/cards/RecommendationCard";
import { StatCard } from "@/components/cards/StatCard";
import { SummaryCard } from "@/components/cards/SummaryCard";
import { AhpRankingComparisonChart } from "@/components/charts/AhpRankingComparisonChart";
import { CriteriaEditor } from "@/components/forms/CriteriaEditor";
import { PairwiseComparisonInput } from "@/components/forms/PairwiseComparisonInput";
import { AppShell, PageHeader } from "@/components/layout";
import { MatrixTable } from "@/components/tables/MatrixTable";
import { SimpleTable } from "@/components/tables/SimpleTable";

interface WeightDetailRow {
  criterion: string;
  value: string;
}

const emptyWeightRows: WeightDetailRow[] = [];

export default function AhpFuzzyAhpPrototypePage() {
  return (
    <AppShell>
      <PageHeader
        description="Ringkasan alur prioritisasi aspek negatif dengan metode AHP dan Fuzzy AHP."
        eyebrow="Prioritas Aspek"
        title="AHP / Fuzzy AHP"
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        <StatCard
          description="Data kriteria ditampilkan saat tersedia."
          label="Kriteria"
          tone="primary"
          value={0}
        />
        <StatCard
          description="Pairwise judgement ditampilkan saat tersedia."
          label="Pairwise"
          value={0}
        />
        <StatCard
          description="Consistency ratio ditampilkan saat tersedia."
          label="Consistency Ratio"
          tone="primary"
          value="0%"
        />
        <StatCard
          description="Prioritas ditampilkan saat hasil tersedia."
          label="Prioritas AHP"
          tone="primary"
          value="-"
        />
        <StatCard
          description="Prioritas ditampilkan saat hasil tersedia."
          label="Prioritas Fuzzy AHP"
          tone="primary"
          value="-"
        />
        <StatCard
          description="Status hasil prioritisasi."
          label="Status"
          value="Data belum tersedia"
        />
      </section>

      <SummaryCard
        description="Halaman ini merangkum metodologi dan hasil perhitungan prioritas aspek."
        items={[
          {
            label: "AHP",
            value: "Perhitungan backend",
            description: "Perhitungan AHP mengikuti pipeline penelitian.",
          },
          {
            label: "Fuzzy AHP",
            value: "Perhitungan backend",
            description: "Perhitungan Fuzzy AHP mengikuti pipeline penelitian.",
          },
          {
            label: "TFN",
            value: "centroid",
            description: "Metode defuzzification yang digunakan.",
          },
          {
            label: "Hasil",
            value: "Data belum tersedia",
            description: "Hasil mengikuti output penelitian terstruktur.",
          },
        ]}
        title="Ringkasan Metode"
      />

      <AhpGatewayDemoPanel />

      <section className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <ChartCard
          description="Daftar kriteria aktif untuk perhitungan prioritas aspek."
          title="Setup Kriteria"
        >
          <CriteriaEditor criteria={[]} />
        </ChartCard>

        <ChartCard
          description="Pairwise comparison untuk expert judgement."
          title="Expert Judgement / Pairwise Comparison"
        >
          <PairwiseComparisonInput comparisons={[]} criteria={[]} />
        </ChartCard>
      </section>

      <ChartCard
        description="Matriks pairwise ditampilkan kosong sampai backend mengembalikan hasil."
        insight="Matriks mengikuti hasil perhitungan dari pipeline penelitian."
        title="Matriks Pairwise Comparison AHP"
      >
        <MatrixTable comparisons={[]} criteria={[]} />
      </ChartCard>

      <section className="grid gap-6 xl:grid-cols-2">
        <RankingCard
          description="Ranking AHP ditampilkan saat hasil tersedia."
          items={[]}
          title="Hasil Bobot AHP"
        />

        <RankingCard
          description="Ranking Fuzzy AHP ditampilkan saat hasil tersedia."
          items={[]}
          title="Hasil Bobot Fuzzy AHP"
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <ChartCard
          description="Perbandingan bobot hanya tersedia setelah AHP dan Fuzzy AHP berhasil dihitung oleh backend."
          insight="Perbandingan mengikuti output perhitungan prioritas."
          title="Perbandingan Ranking AHP vs Fuzzy AHP"
        >
          <AhpRankingComparisonChart data={[]} />
        </ChartCard>

        <ChartCard
          description="Tabel numerik ditampilkan saat hasil comparison tersedia."
          title="Detail Bobot AHP dan Fuzzy AHP"
        >
          <SimpleTable
            columns={[
              {
                key: "criterion",
                header: "Kriteria",
                render: (row) => row.criterion,
              },
              {
                key: "value",
                header: "Nilai",
                align: "right",
                render: (row) => row.value,
              },
            ]}
            data={emptyWeightRows}
            minWidthClassName="min-w-[520px]"
            rowKey={(row) => row.criterion}
          />
        </ChartCard>
      </section>

      <RecommendationCard
        basis={[
          "Prioritas AHP tertinggi: -",
          "Prioritas Fuzzy AHP tertinggi: -",
          "Consistency Ratio: 0%",
          "Jumlah kriteria aktif: 0",
        ]}
        note="Rekomendasi final wajib berasal dari backend calculation service dan judgement expert yang tervalidasi."
        recommendation={
          <p>
            Data belum tersedia. Hasil prioritas akan tampil setelah output
            expert judgement tersedia.
          </p>
        }
        title="Ringkasan Rekomendasi Akhir"
      />

      <SummaryCard
        description="Catatan batasan metodologi prioritisasi aspek."
        title="Catatan Batasan Metode"
      >
        <div className="grid gap-3 md:grid-cols-2">
          {[
            "Perhitungan AHP dan Fuzzy AHP diproses oleh pipeline backend.",
            "Jumlah kriteria, skala expert judgement, dan mapping TFN tetap berasal dari backend/metodologi.",
            "Jika data belum tersedia, halaman menampilkan empty state singkat.",
            "Hasil final tetap membutuhkan expert judgement yang tervalidasi.",
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
