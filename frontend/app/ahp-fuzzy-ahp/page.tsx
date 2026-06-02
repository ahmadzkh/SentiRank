import { ChartCard } from "@/components/cards/ChartCard";
import { StatCard } from "@/components/cards/StatCard";
import { SummaryCard } from "@/components/cards/SummaryCard";
import { AppShell, PageHeader } from "@/components/layout";
import {
  mockAhpCriteria,
  mockAhpResult,
  mockFuzzyAhpResult,
} from "@/lib/mock-data";

function formatWeight(value: number) {
  return `${Math.round(value * 100)}%`;
}

export default function AhpFuzzyAhpPlaceholderPage() {
  const topAhpRank = mockAhpResult.ranking[0];
  const topFuzzyRank = mockFuzzyAhpResult.ranking[0];

  return (
    <AppShell>
      <PageHeader
        description="Placeholder route untuk menjaga navigasi tetap lengkap. Prototype penuh AHP/Fuzzy AHP akan diimplementasikan pada FE-11."
        eyebrow="Placeholder FE-11"
        title="AHP / Fuzzy AHP"
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          description="Jumlah kriteria mock bersifat dinamis dan tidak mengunci metode final."
          label="Kriteria Mock"
          tone="primary"
          value={mockAhpCriteria.length}
        />
        <StatCard
          description="CR mock hanya untuk preview status metode."
          label="Rasio Konsistensi"
          value={
            mockAhpResult.consistencyRatio === null
              ? "Belum tersedia"
              : formatWeight(mockAhpResult.consistencyRatio)
          }
        />
        <StatCard
          description="Output AHP mock dari FE-07."
          label="Prioritas AHP"
          tone="primary"
          value={topAhpRank?.label ?? "Belum tersedia"}
        />
        <StatCard
          description="Output Fuzzy AHP masih prototype."
          label="Prioritas Fuzzy AHP"
          tone="primary"
          value={topFuzzyRank?.label ?? "Belum tersedia"}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <SummaryCard
          description="Halaman ini sengaja tidak mengimplementasikan matrix, input pairwise, atau kalkulasi metode penuh."
          items={[
            {
              label: "Status",
              value: "Belum dimulai",
              description: "Prototype penuh dikerjakan pada FE-11.",
            },
            {
              label: "Metode",
              value: "AHP dan Fuzzy AHP",
              description: "Nama metode dipertahankan sesuai kebutuhan skripsi.",
            },
            {
              label: "Data",
              value: "Mock FE-07",
              description: "Belum ada real API atau kalkulasi frontend.",
            },
            {
              label: "Batasan",
              value: "Tidak mengunci formula final",
              description: "UI FE-11 harus tetap fleksibel dan data-driven.",
            },
          ]}
          title="Segera Tersedia / Prototype FE-11"
        />

        <ChartCard
          description="Catatan ruang lingkup agar evaluator memahami bahwa halaman ini hanya menjaga route aktif."
          title="Batas Implementasi Saat Ini"
        >
          <div className="space-y-3 text-sm leading-6 text-muted-foreground">
            <p className="rounded-md border border-border bg-background px-4 py-3">
              Frontend belum menjalankan kalkulasi AHP atau Fuzzy AHP. Kalkulasi
              final tetap diarahkan ke backend/service agar metodologi terpusat
              dan dapat diuji.
            </p>
            <p className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-amber-800">
              FE-10 hanya menambahkan placeholder route. Form pairwise,
              matrix, consistency detail, dan ranking comparison penuh tidak
              dibuat pada fase ini.
            </p>
          </div>
        </ChartCard>
      </section>
    </AppShell>
  );
}
