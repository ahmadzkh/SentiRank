import { ChartCard } from "@/components/cards/ChartCard";
import { StatCard } from "@/components/cards/StatCard";
import { SummaryCard } from "@/components/cards/SummaryCard";
import { AspectRankingChart } from "@/components/charts/AspectRankingChart";
import type { AspectRankingDatum } from "@/components/charts/AspectRankingChart";
import { AppShell, PageHeader } from "@/components/layout";
import { RandomReviewSamplesSection } from "@/components/tables/RandomReviewSamplesSection";
import { researchResults } from "@/lib/research-results";
import { researchSampleReviews } from "@/lib/research-sample-reviews";

const aspectRankingData =
  researchResults.aspectSummary.mergedAspectDistribution.map((aspect) => ({
    aspect: aspect.label,
    label: aspect.label,
    count: aspect.count,
  })) satisfies AspectRankingDatum[];

const negativeAspectGroups =
  researchResults.aspectSummary.negativeAspectDistribution;

const dominantAspect = researchResults.aspectSummary.mergedAspectDistribution[0];
const topNegativeAspect = researchResults.aspectSummary.topNegativeAspect;

export default function AspectClassificationPage() {
  return (
    <AppShell>
      <PageHeader
        description="Ringkasan hasil riset SVM merged_5class, ranking aspek, pengelompokan aspek negatif, dan sampel weak-label dari dataset riset."
        eyebrow="SVM"
        title="Klasifikasi Aspek"
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          description="Dataset aspek setelah filter dapat ditindaklanjuti dan confidence."
          label="Ulasan Diklasifikasi"
          value={researchResults.aspectSummary.finalDatasetRows.toLocaleString("id-ID")}
        />
        <StatCard
          description="Aspek terbesar pada distribusi merged_5class."
          label="Aspek Dominan"
          tone="primary"
          value={dominantAspect?.label ?? "Belum tersedia"}
        />
        <StatCard
          description="Aspek negatif paling sering pada ulasan bermasalah."
          label="Aspek Negatif Utama"
          tone="negative"
          value={topNegativeAspect.label}
        />
        <StatCard
          description={researchResults.svmEvaluation.finalClassifier}
          label="Model"
          value={researchResults.svmEvaluation.modelName}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <ChartCard
          description="Frekuensi aspek dari dataset final SVM merged_5class."
          insight={`${dominantAspect?.label ?? "Belum tersedia"} menjadi aspek dominan pada artefak riset SVM.`}
          title="Frekuensi / Ranking Aspek"
        >
          <AspectRankingChart data={aspectRankingData} />
        </ChartCard>

        <SummaryCard
          description="Grouping negatif berasal dari weak-label refinement dan dipetakan ke kandidat kriteria AHP/Fuzzy AHP."
          title="Pengelompokan Ulasan Negatif"
        >
          <div className="space-y-3">
            {negativeAspectGroups.map((group) => (
              <div
                className="rounded-md border border-border bg-background px-4 py-3"
                key={group.label}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="rounded-md border border-blue-200 bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                    {group.label}
                  </span>
                  <span className="text-xs font-medium text-muted-foreground">
                    {group.count.toLocaleString("id-ID")} sinyal negatif
                  </span>
                </div>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">
                  Ringkasan aspek weak-label, bukan ground truth expert.
                </p>
              </div>
            ))}
          </div>
        </SummaryCard>
      </section>

      <RandomReviewSamplesSection
        description="Sampel acak dari dataset riset yang memiliki label aspek. Refresh akan mengambil sampel baru dari backend jika ml-service aktif."
        fallbackReviews={researchSampleReviews}
        query={{ limit: 10, withAspect: true }}
        title="Tabel Sampel Aspek Riset"
      />
    </AppShell>
  );
}
