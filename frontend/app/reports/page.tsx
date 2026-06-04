import { ChartCard } from "@/components/cards/ChartCard";
import { RankingCard } from "@/components/cards/RankingCard";
import type { RankingCardItem } from "@/components/cards/RankingCard";
import { StatCard } from "@/components/cards/StatCard";
import { SummaryCard } from "@/components/cards/SummaryCard";
import { AhpRankingComparisonChart } from "@/components/charts/AhpRankingComparisonChart";
import type { AhpRankingComparisonDatum } from "@/components/charts/AhpRankingComparisonChart";
import { SentimentDistributionChart } from "@/components/charts/SentimentDistributionChart";
import type { SentimentDistributionDatum } from "@/components/charts/SentimentDistributionChart";
import { AppShell, PageHeader } from "@/components/layout";
import { SimpleTable } from "@/components/tables/SimpleTable";
import { SENTIMENT_LABELS, SENTIMENT_META } from "@/constants/sentiment";
import {
  mockAhpResult,
  mockFuzzyAhpResult,
} from "@/lib/mock-data";
import { researchResults } from "@/lib/research-results";
import type { ReviewSentimentLabel } from "@/types/sentiment";

function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`;
}

function formatWeight(value: number) {
  return `${Math.round(value * 100)}%`;
}

function getShortLabel(label: string) {
  return label.split(" ").slice(0, 2).join(" ");
}

function toSentimentKey(label: string): ReviewSentimentLabel {
  return label.toLowerCase() as ReviewSentimentLabel;
}

const sentimentDistributionData = SENTIMENT_LABELS.map((label) => ({
  label,
  name: SENTIMENT_META[label].label,
  count:
    researchResults.datasetSummary.finalLabelDistribution.find(
      (item) => toSentimentKey(item.label) === label,
    )?.count ?? 0,
  percentage:
    researchResults.datasetSummary.finalLabelDistribution.find(
      (item) => toSentimentKey(item.label) === label,
    )?.percentage ?? 0,
  color: SENTIMENT_META[label].chartColor,
})) satisfies SentimentDistributionDatum[];

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

const priorityRankingItems = mockAhpResult.ranking.map((item) => ({
  id: item.criterionId,
  rank: item.rank,
  label: item.label,
  score: formatWeight(item.weight),
  description: item.interpretation,
})) satisfies RankingCardItem[];

const keyMetrics = [
  {
    id: "dataset-size",
    label: "Ukuran dataset",
    value: `${researchResults.datasetSummary.totalReviews.toLocaleString("id-ID")} ulasan`,
    source: "Dataset",
  },
  {
    id: "negative-rate",
    label: "Proporsi negatif",
    value: `${researchResults.datasetSummary.finalLabelDistribution.find((item) => item.label === "Negative")?.percentage.toFixed(2) ?? "0"}%`,
    source: "Analisis Sentimen",
  },
  {
    id: "top-aspect",
    label: "Aspek negatif utama",
    value: researchResults.aspectSummary.topNegativeAspect.label,
    source: "Klasifikasi Aspek",
  },
  {
    id: "priority-aspect",
    label: "Prioritas rekomendasi",
    value: "Belum final",
    source: "AHP / Fuzzy AHP",
  },
  {
    id: "model-f1",
    label: "Macro F1 sentimen",
    value: formatPercent(researchResults.indobertEvaluation.f1Macro),
    source: "Evaluasi Model",
  },
];

export default function ReportsPage() {
  return (
    <AppShell>
      <PageHeader
        actions={
          <div className="flex flex-wrap gap-2">
            <button
              className="rounded-md border border-border bg-white px-3 py-2 text-sm font-medium text-muted-foreground disabled:cursor-not-allowed disabled:opacity-60"
              disabled
              type="button"
            >
              Ekspor PDF
            </button>
            <button
              className="rounded-md border border-border bg-white px-3 py-2 text-sm font-medium text-muted-foreground disabled:cursor-not-allowed disabled:opacity-60"
              disabled
              type="button"
            >
              Ekspor Excel
            </button>
          </div>
        }
        description="Ringkasan siap demo skripsi yang menggabungkan dataset, sentimen, aspek, prioritas AHP/Fuzzy AHP, dan evaluasi model."
        eyebrow="Ringkasan penelitian"
        title="Laporan"
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        <StatCard
          description={researchResults.datasetSummary.sourceName}
          label="Dataset"
          value={researchResults.datasetSummary.totalReviews.toLocaleString("id-ID")}
        />
        <StatCard
          description="Proporsi ulasan negatif final setelah relabeling."
          label="Ulasan Negatif"
          tone="negative"
          value={`${researchResults.datasetSummary.finalLabelDistribution.find((item) => item.label === "Negative")?.percentage.toFixed(2) ?? "0"}%`}
        />
        <StatCard
          description={`${researchResults.aspectSummary.topNegativeAspect.count.toLocaleString("id-ID")} sinyal negatif.`}
          label="Aspek Utama"
          tone="primary"
          value={researchResults.aspectSummary.topNegativeAspect.label}
        />
        <StatCard
          description="AHP/Fuzzy AHP belum final expert judgement."
          label="Prioritas AHP"
          tone="primary"
          value="Sampel"
        />
        <StatCard
          description={researchResults.indobertEvaluation.finalCandidate}
          label="Sentimen Macro F1"
          value={formatPercent(researchResults.indobertEvaluation.f1Macro)}
        />
        <StatCard
          description={researchResults.svmEvaluation.finalClassifier}
          label="Aspek Macro F1"
          value={formatPercent(researchResults.svmEvaluation.f1Macro)}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <SummaryCard
          description="Narasi ini disusun untuk mendukung presentasi hasil, bukan sebagai laporan final otomatis."
          title="Ringkasan Insight Ulasan Spotify SentiRank"
        >
          <p className="text-sm leading-6 text-muted-foreground">
            {researchResults.reportSummary.datasetFindings}{" "}
            {researchResults.reportSummary.sentimentFindings} Aspek{" "}
            {researchResults.aspectSummary.topNegativeAspect.label} menjadi sinyal
            negatif utama pada ringkasan weak-label.
          </p>
          <div className="mt-4 rounded-md border border-blue-100 bg-blue-50 px-4 py-3 text-sm leading-6 text-blue-900">
            {researchResults.reportSummary.ahpFuzzyAhpDemoLimitation}
          </div>
        </SummaryCard>

        <ChartCard
          description="Metrik kunci dari setiap tahap analisis untuk dibaca cepat oleh evaluator."
          title="Metrik Kunci"
        >
          <SimpleTable
            columns={[
              {
                key: "label",
                header: "Metrik",
                render: (row) => (
                  <span className="font-medium text-foreground">
                    {row.label}
                  </span>
                ),
              },
              {
                key: "value",
                header: "Nilai",
                render: (row) => row.value,
              },
              {
                key: "source",
                header: "Sumber",
                render: (row) => row.source,
              },
            ]}
            data={keyMetrics}
            minWidthClassName="min-w-[560px]"
            rowKey={(row) => row.id}
          />
        </ChartCard>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <ChartCard
          description="Ringkasan sentimen yang siap dimasukkan ke narasi Bab 4."
          title="Ringkasan Sentimen Final"
        >
          <SentimentDistributionChart data={sentimentDistributionData} />
        </ChartCard>

        <ChartCard
          description="Perbandingan bobot AHP dan Fuzzy AHP masih sample development/mock fallback, bukan final expert judgement."
          insight="Ekspor masih dinonaktifkan sampai integrasi dan artefak final tersedia."
          title="Placeholder Ringkasan Rekomendasi"
        >
          <AhpRankingComparisonChart data={priorityComparisonData} />
        </ChartCard>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <RankingCard
          description="Urutan prioritas dari mock fallback untuk kebutuhan preview laporan. Hasil final menunggu expert judgement."
          items={priorityRankingItems}
          title="Ranking Prioritas"
        />

        <SummaryCard
          description="Poin ini membantu menyusun interpretasi akhir saat demo skripsi."
          title="Ringkasan Penelitian"
        >
          <div className="grid gap-3 md:grid-cols-2">
            {researchResults.reportSummary.highLevelFindings.map((highlight) => (
              <div
                className="rounded-md border border-border bg-background px-4 py-3 text-sm leading-6 text-muted-foreground"
                key={highlight}
              >
                {highlight}
              </div>
            ))}
          </div>
          <div className="mt-4 space-y-2">
            {[
              researchResults.reportSummary.aspectFindings,
              researchResults.reportSummary.modelEvaluationFindings,
            ].map((recommendation) => (
              <p
                className="rounded-md border border-blue-100 bg-blue-50 px-4 py-3 text-sm leading-6 text-blue-900"
                key={recommendation}
              >
                {recommendation}
              </p>
            ))}
          </div>
        </SummaryCard>
      </section>
    </AppShell>
  );
}
