import { AspectBadge } from "@/components/badges/AspectBadge";
import { SentimentBadge } from "@/components/badges/SentimentBadge";
import { ChartCard } from "@/components/cards/ChartCard";
import { StatCard } from "@/components/cards/StatCard";
import { SummaryCard } from "@/components/cards/SummaryCard";
import { AspectRankingChart } from "@/components/charts/AspectRankingChart";
import type { AspectRankingDatum } from "@/components/charts/AspectRankingChart";
import { AppShell, PageHeader } from "@/components/layout";
import { SimpleTable } from "@/components/tables/SimpleTable";
import { ASPECT_LABELS, ASPECT_META } from "@/constants/aspect";
import {
  mockAspectResults,
  mockAspectSummary,
  mockReviews,
} from "@/lib/mock-data";
import type { AspectLabel } from "@/types/aspect";

function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`;
}

const aspectRankingData = ASPECT_LABELS.map((aspect) => ({
  aspect,
  label: ASPECT_META[aspect].label,
  count: mockAspectSummary.counts[aspect],
}))
  .filter((item) => item.count > 0)
  .sort((first, second) => second.count - first.count) satisfies AspectRankingDatum[];

const negativeReviewGroups = ASPECT_LABELS.map((aspect) => ({
  aspect,
  label: ASPECT_META[aspect].label,
  description: ASPECT_META[aspect].description,
  reviews: mockReviews.filter(
    (review) => {
      const aspectLabels = review.aspectLabels as
        | readonly AspectLabel[]
        | undefined;

      return (
        review.sentimentLabel === "negative" && aspectLabels?.includes(aspect)
      );
    },
  ),
}))
  .filter((group) => group.reviews.length > 0)
  .sort((first, second) => second.reviews.length - first.reviews.length);

const topNegativeAspect = mockAspectSummary.topNegativeAspect;

export default function AspectClassificationPage() {
  return (
    <AppShell>
      <PageHeader
        description="Tampilan mock untuk melihat hasil klasifikasi aspek SVM, ranking frekuensi aspek, pengelompokan ulasan negatif, dan tabel hasil klasifikasi."
        eyebrow="SVM"
        title="Klasifikasi Aspek"
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        <StatCard
          description="Total ulasan yang sudah memiliki label aspek mock."
          label="Ulasan Diklasifikasi"
          value={mockAspectSummary.totalClassified}
        />
        <StatCard
          description="Aspek paling sering muncul pada seluruh data mock."
          label="Aspek Dominan"
          tone="primary"
          value={ASPECT_META[mockAspectSummary.topAspect].label}
        />
        <StatCard
          description="Aspek negatif paling sering pada ulasan bermasalah."
          label="Aspek Negatif Utama"
          tone="negative"
          value={ASPECT_META[topNegativeAspect].label}
        />
        <StatCard
          description="Ulasan yang memiliki lebih dari satu aspek."
          label="Multi-aspek"
          value={mockAspectSummary.multiAspectReviewCount}
        />
        <StatCard
          description="Jumlah label aspek hasil mock SVM."
          label="Hasil Aspek"
          tone="primary"
          value={mockAspectResults.length}
        />
        <StatCard
          description={mockAspectSummary.modelVersion}
          label="Model"
          value={mockAspectSummary.modelName}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <ChartCard
          description="Frekuensi aspek dari seluruh ulasan mock. Chart tetap data-driven dan tidak mengunci daftar aspek final."
          insight={`${ASPECT_META[mockAspectSummary.topAspect].label} menjadi aspek dominan pada dataset mock.`}
          title="Frekuensi / Ranking Aspek"
        >
          <AspectRankingChart data={aspectRankingData} />
        </ChartCard>

        <SummaryCard
          description="Grouping ini membantu menjelaskan tema keluhan sebelum diprioritaskan pada FE-11."
          title="Pengelompokan Ulasan Negatif"
        >
          <div className="space-y-3">
            {negativeReviewGroups.map((group) => (
              <div
                className="rounded-md border border-border bg-background px-4 py-3"
                key={group.aspect}
              >
                <div className="flex items-center justify-between gap-3">
                  <AspectBadge aspect={group.aspect} count={group.reviews.length} />
                  <span className="text-xs font-medium text-muted-foreground">
                    {group.reviews.length} ulasan negatif
                  </span>
                </div>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">
                  {group.description}
                </p>
              </div>
            ))}
          </div>
        </SummaryCard>
      </section>

      <ChartCard
        description="Tabel hasil klasifikasi aspek dari data mock. Tidak ada inferensi SVM nyata pada frontend."
        title="Tabel Hasil Aspek"
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
              render: (row) => <AspectBadge aspect={row.label} />,
            },
            {
              key: "sentiment",
              header: "Sentimen",
              render: (row) => <SentimentBadge sentiment={row.sentimentLabel} />,
            },
            {
              key: "confidence",
              header: "Confidence",
              align: "right",
              render: (row) => formatPercent(row.confidence),
            },
            {
              key: "evidence",
              header: "Evidence",
              render: (row) => (
                <span className="text-xs leading-5 text-muted-foreground">
                  {row.evidenceTerms.join(", ")}
                </span>
              ),
            },
          ]}
          data={mockAspectResults}
          minWidthClassName="min-w-[900px]"
          rowKey={(row) => row.id}
        />
      </ChartCard>
    </AppShell>
  );
}
