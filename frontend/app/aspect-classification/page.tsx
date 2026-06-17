import { ApiGatewayAlert } from "@/components/alerts/ApiGatewayAlert";
import { ChartCard } from "@/components/cards/ChartCard";
import { StatCard } from "@/components/cards/StatCard";
import { SummaryCard } from "@/components/cards/SummaryCard";
import { AspectRankingChart } from "@/components/charts/AspectRankingChart";
import { AppShell, PageHeader } from "@/components/layout";
import { SimpleTable } from "@/components/tables/SimpleTable";
import type { SimpleTableColumn } from "@/components/tables/SimpleTable";
import { EMPTY_GATEWAY_MESSAGE, safeGatewayData } from "@/lib/api-status";
import {
  EMPTY_ASPECT_EVALUATION,
  EMPTY_ASPECT_SUMMARY,
  EMPTY_RANDOM_REVIEWS,
  EMPTY_TABLE_CELL,
  EMPTY_TEXT,
  aspectRankingData,
  formatPercent,
  tableCellValue,
} from "@/lib/gateway-display";
import {
  getAspectEvaluation,
  getAspectSummary,
} from "@/services/aspect-service";
import { getReviews } from "@/services/review-service";
import type { GatewayReviewSample } from "@/types";

export const dynamic = "force-dynamic";

function cleanedReviewText(row: GatewayReviewSample) {
  return tableCellValue(
    row.cleaned_content ?? row.cleaned_text ?? row.text_indobert ?? row.text_svm,
  );
}

function confidenceValue(value: number | string | null | undefined) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return formatPercent(value);
  }

  return tableCellValue(value);
}

function aspectResultColumns(
  modelVersion: string,
): readonly SimpleTableColumn<GatewayReviewSample>[] {
  return [
    {
      key: "no",
      header: "No",
      align: "center",
      className: "w-16",
      render: (_row, index) => index + 1,
    },
    {
      key: "cleanedReview",
      header: "Cleaned Review",
      className: "min-w-[320px] max-w-[460px]",
      render: (row) => (
        <span className="line-clamp-3 break-words font-medium text-foreground">
          {cleanedReviewText(row)}
        </span>
      ),
    },
    {
      key: "sentiment",
      header: "Sentimen",
      render: (row) => tableCellValue(row.final_sentiment ?? row.initial_sentiment),
    },
    {
      key: "predictedAspect",
      header: "Predicted Aspect",
      render: (row) => tableCellValue(row.predicted_aspect ?? row.aspect_label),
    },
    {
      key: "confidence",
      header: "Confidence",
      align: "right",
      render: (row) => confidenceValue(row.aspect_confidence),
    },
    {
      key: "model",
      header: "Model",
      render: () => "SVM",
    },
    {
      key: "modelVersion",
      header: "Model Version",
      className: "min-w-[180px]",
      render: () => modelVersion,
    },
    {
      key: "predictionSource",
      header: "Prediction Source",
      render: (row) => tableCellValue(row.aspect_prediction_source),
    },
  ] satisfies SimpleTableColumn<GatewayReviewSample>[];
}

export default async function AspectClassificationPage() {
  const [summaryResult, evaluationResult, reviewsResult] = await Promise.all([
    safeGatewayData(getAspectSummary, EMPTY_ASPECT_SUMMARY),
    safeGatewayData(getAspectEvaluation, EMPTY_ASPECT_EVALUATION),
    safeGatewayData(() => getReviews({ limit: 10, seed: 50 }), EMPTY_RANDOM_REVIEWS),
  ]);
  const summary = summaryResult.data;
  const evaluation = evaluationResult.data;
  const aspectRows = aspectRankingData(
    Object.keys(summary.negative_aspect_distribution).length
      ? summary.negative_aspect_distribution
      : summary.aspect_distribution,
  );
  const topAspect = aspectRows[0];
  const reviews = reviewsResult.data.reviews;
  const apiError = summaryResult.error ?? evaluationResult.error ?? reviewsResult.error;

  return (
    <AppShell>
      <PageHeader
        description="Ringkasan klasifikasi aspek SVM dan distribusi aspek ulasan negatif."
        eyebrow="SVM"
        title="Klasifikasi Aspek"
      />

      <ApiGatewayAlert error={apiError} />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        <StatCard
          description="Total count dari distribusi aspek."
          label="Ulasan Diklasifikasi"
          value={aspectRows.reduce((total, row) => total + row.count, 0)}
        />
        <StatCard
          description="Aspek paling sering muncul pada ringkasan klasifikasi."
          label="Aspek Dominan"
          tone="primary"
          value={topAspect?.label ?? "-"}
        />
        <StatCard
          description="Aspek negatif dengan jumlah tertinggi."
          label="Aspek Negatif Utama"
          tone="negative"
          value={topAspect?.label ?? "-"}
        />
        <StatCard
          description="Data multi-aspek belum tersedia."
          label="Multi-aspek"
          value={0}
        />
        <StatCard
          description="Jumlah label final dari taxonomy aspek."
          label="Hasil Aspek"
          tone="primary"
          value={summary.final_aspect_labels.length}
        />
        <StatCard
          description={summary.model_status}
          label="Model"
          value={summary.selected_classifier}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <ChartCard
          description="Frekuensi aspek dari hasil klasifikasi."
          insight={
            topAspect
              ? `${topAspect.label} menjadi aspek tertinggi pada ringkasan klasifikasi.`
              : EMPTY_GATEWAY_MESSAGE
          }
          title="Frekuensi / Ranking Aspek"
        >
          <AspectRankingChart data={aspectRows} />
        </ChartCard>

        <SummaryCard
          description={
            summaryResult.isAvailable
              ? "Taxonomy final dari SVM merged_5class."
              : EMPTY_GATEWAY_MESSAGE
          }
          title="Taxonomy Aspek"
        >
          <SimpleTable
            columns={[
              {
                key: "label",
                header: "Kriteria",
                render: (row) => row.label,
              },
            ]}
            data={
              summary.final_aspect_labels.map((label) => ({
                id: label,
                label,
              }))
            }
            emptyMessage={EMPTY_GATEWAY_MESSAGE}
            minWidthClassName="min-w-[420px]"
            rowKey={(row) => row.id}
          />
        </SummaryCard>
      </section>

      <ChartCard
        description="Tabel ini menampilkan sampel hasil klasifikasi aspek jika field prediksi tersedia dari API Gateway."
        title="Tabel Hasil Aspek"
      >
        <SimpleTable
          columns={aspectResultColumns(
            summaryResult.isAvailable ? summary.selected_classifier : EMPTY_TABLE_CELL,
          )}
          data={reviewsResult.isAvailable ? reviews : []}
          emptyMessage={EMPTY_GATEWAY_MESSAGE}
          minWidthClassName="min-w-[1180px]"
          rowKey={(row, index) => row.external_id ?? `aspect-review-${index}`}
        />
      </ChartCard>

      <SummaryCard
        description="Catatan metodologi klasifikasi aspek."
        title="Catatan Klasifikasi Aspek"
      >
        <p className="rounded-md border border-border bg-background px-4 py-3 text-sm leading-6 text-muted-foreground">
          {summaryResult.isAvailable
            ? summary.weak_label_limitation || evaluation.limitations[0] || EMPTY_TEXT
            : EMPTY_TEXT}
        </p>
      </SummaryCard>
    </AppShell>
  );
}
