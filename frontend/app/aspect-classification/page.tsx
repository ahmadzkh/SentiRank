import { AspectBadge } from "@/components/badges/AspectBadge";
import { SentimentBadge } from "@/components/badges/SentimentBadge";
import { ChartCard } from "@/components/cards/ChartCard";
import { StatCard } from "@/components/cards/StatCard";
import { SummaryCard } from "@/components/cards/SummaryCard";
import { AspectRankingChart } from "@/components/charts/AspectRankingChart";
import type { AspectRankingDatum } from "@/components/charts/AspectRankingChart";
import { AppShell, PageHeader } from "@/components/layout";
import { SimpleTable } from "@/components/tables/SimpleTable";
import { researchResults } from "@/lib/research-results";
import { researchAspectSampleResults } from "@/lib/research-sample-reviews";

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

      <ChartCard
        description="Sampel kecil dari dataset aspek weak-label; bukan ground truth expert dan bukan inferensi runtime frontend."
        title="Tabel Sampel Aspek Riset"
      >
        <SimpleTable
          columns={[
            {
              key: "review",
              header: "Ulasan",
              className: "max-w-[420px]",
              render: (row) => (
                <p className="line-clamp-2 font-medium leading-6 text-foreground">
                  {row.reviewText}
                </p>
              ),
            },
            {
              key: "aspect",
              header: "Aspek",
              render: (row) => (
                <div className="space-y-1">
                  <AspectBadge aspect={row.aspectLabel} />
                  <p className="text-xs text-muted-foreground">
                    {row.sourceAspectLabel}
                  </p>
                </div>
              ),
            },
            {
              key: "sentiment",
              header: "Sentimen",
              render: (row) => <SentimentBadge sentiment={row.sentimentLabel} />,
            },
            {
              key: "confidence",
              header: "Confidence",
              render: (row) => (
                <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-medium capitalize text-slate-700">
                  {row.confidenceLevel}
                </span>
              ),
            },
            {
              key: "evidence",
              header: "Bukti Keyword",
              render: (row) => (
                <span className="text-xs leading-5 text-muted-foreground">
                  {row.evidenceTerms.join(", ")}
                </span>
              ),
            },
          ]}
          data={researchAspectSampleResults}
          minWidthClassName="min-w-[940px]"
          rowKey={(row) => row.id}
        />
      </ChartCard>
    </AppShell>
  );
}
