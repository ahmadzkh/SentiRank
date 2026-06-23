import { ApiGatewayAlert } from "@/components/alerts/ApiGatewayAlert";
import { ChartCard } from "@/components/cards/ChartCard";
import { StatCard } from "@/components/cards/StatCard";
import { SummaryCard } from "@/components/cards/SummaryCard";
import { AppShell, PageHeader } from "@/components/layout";
import { SimpleTable } from "@/components/tables/SimpleTable";
import type { SimpleTableColumn } from "@/components/tables/SimpleTable";
import { EMPTY_GATEWAY_MESSAGE, safeGatewayData } from "@/lib/api-status";
import {
  EMPTY_PREPROCESSING_SUMMARY,
  EMPTY_RANDOM_REVIEWS,
  EMPTY_TABLE_CELL,
  EMPTY_TEXT,
  numberValue,
  recordNumber,
  stringValue,
  tableCellValue,
} from "@/lib/gateway-display";
import { getPreprocessingSummary } from "@/services/preprocessing-service";
import { getReviews } from "@/services/review-service";
import type { GatewayReviewSample } from "@/types";

export const dynamic = "force-dynamic";

function objectRows(record: Record<string, unknown>) {
  return Object.entries(record).map(([key, value]) => ({
    key,
    label: key,
    value:
      typeof value === "object" && value !== null
        ? JSON.stringify(value)
        : stringValue(String(value), EMPTY_TEXT),
  }));
}

function cleanedReviewText(row: GatewayReviewSample) {
  return tableCellValue(
    row.cleaned_content ?? row.cleaned_text ?? row.text_indobert ?? row.text_svm,
  );
}

const preprocessingReviewColumns = [
  {
    key: "no",
    header: "No",
    align: "center",
    className: "w-16",
    render: (_row, index) => index + 1,
  },
  {
    key: "originalReview",
    header: "Original Review",
    className: "min-w-[280px] max-w-[400px]",
    render: (row) => (
      <span className="line-clamp-3 break-words font-medium text-foreground">
        {tableCellValue(row.content)}
      </span>
    ),
  },
  {
    key: "cleanedReview",
    header: "Cleaned Review",
    className: "min-w-[280px] max-w-[400px]",
    render: (row) => (
      <span className="line-clamp-3 break-words text-muted-foreground">
        {cleanedReviewText(row)}
      </span>
    ),
  },
  {
    key: "textLengthBefore",
    header: "Text Length Before",
    align: "right",
    render: (row) => tableCellValue(row.text_length_before),
  },
  {
    key: "textLengthAfter",
    header: "Text Length After",
    align: "right",
    render: (row) => tableCellValue(row.text_length_after),
  },
  {
    key: "noiseFlag",
    header: "Noise Flag",
    render: (row) => tableCellValue(row.noise_flag),
  },
  {
    key: "dropReason",
    header: "Drop Reason",
    render: (row) => tableCellValue(row.drop_reason),
  },
  {
    key: "preprocessingStatus",
    header: "Preprocessing Status",
    render: (row) => tableCellValue(row.preprocessing_status, EMPTY_TABLE_CELL),
  },
] satisfies SimpleTableColumn<GatewayReviewSample>[];

export default async function PreprocessingPage() {
  const [preprocessingResult, reviewsResult] = await Promise.all([
    safeGatewayData(getPreprocessingSummary, EMPTY_PREPROCESSING_SUMMARY),
    safeGatewayData(() => getReviews({ limit: 10, seed: 30 }), EMPTY_RANDOM_REVIEWS),
  ]);
  const preprocessing = preprocessingResult.data;
  const relabeling = preprocessing.relabeling_changes;
  const reviews = reviewsResult.data.reviews;
  const apiError = preprocessingResult.error ?? reviewsResult.error;
  const pipelineRows = preprocessingResult.isAvailable
    ? [
        {
          id: "relabeling",
          name: "Relabeling sentimen",
          rowsAffected: recordNumber(relabeling, "changed_label_count"),
          status: "available",
          description: "Ringkasan perubahan label dari output preprocessing.",
        },
        {
          id: "aspect",
          name: "Weak aspect labeling",
          rowsAffected: numberValue(preprocessing.total_rows),
          status: preprocessing.aspect_taxonomy_summary_available
            ? "available"
            : "partial",
          description: "Ringkasan weak label aspek untuk SVM.",
        },
      ]
    : [];

  return (
    <AppShell>
      <PageHeader
        description="Menjelaskan pipeline pembersihan teks sebelum hasil ulasan digunakan oleh IndoBERT dan SVM."
        eyebrow="Persiapan teks"
        title="Prapemrosesan"
      />

      <ApiGatewayAlert error={apiError} />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          description={preprocessing.data_status ? `Status: ${preprocessing.data_status}` : "Menunggu data."}
          label="Total Ulasan Bersih"
          value={preprocessing.valid_review_count ?? preprocessing.total_rows ?? 0}
        />
        <StatCard
          description="Jumlah ulasan sebelum filtering kualitas."
          label="Ulasan Input"
          value={preprocessing.input_review_count ?? 0}
        />
        <StatCard
          description="Ulasan yang dihapus saat tahap filtering kualitas."
          label="Ulasan Dihapus"
          tone="negative"
          value={preprocessing.dropped_review_count ?? 0}
        />
        <StatCard
          description={preprocessing.aspect_data_status ? `Aspek: ${preprocessing.aspect_data_status}` : "Status data aspek."}
          label="Status Aspek"
          tone="neutral"
          value={stringValue(preprocessing.aspect_data_status, "Tidak diketahui")}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <ChartCard
          description="Urutan proses dibuat eksplisit agar transformasi data dapat dijelaskan saat demo skripsi."
          title="Ringkasan Tahap Pipeline"
        >
          <SimpleTable
            columns={[
              {
                key: "name",
                header: "Tahap",
                render: (row) => (
                  <span className="font-medium text-foreground">
                    {row.name}
                  </span>
                ),
              },
              {
                key: "description",
                header: "Penjelasan",
                render: (row) => row.description,
              },
              {
                key: "rowsAffected",
                header: "Baris",
                align: "right",
                render: (row) => row.rowsAffected,
              },
              {
                key: "status",
                header: "Status",
                render: (row) => (
                  <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-medium text-slate-700">
                    {row.status}
                  </span>
                ),
              },
            ]}
            data={pipelineRows}
            emptyMessage={EMPTY_GATEWAY_MESSAGE}
            minWidthClassName="min-w-[760px]"
            rowKey={(row) => row.id}
          />
        </ChartCard>

        <SummaryCard
          description="Catatan ini membantu menjelaskan batas UI: frontend menampilkan output, bukan menjalankan pipeline ML."
          title="Ringkasan Proses"
        >
          <SimpleTable
            columns={[
              {
                key: "label",
                header: "Item",
                render: (row) => row.label,
              },
              {
                key: "value",
                header: "Nilai",
                render: (row) => row.value,
              },
            ]}
            data={preprocessingResult.isAvailable ? objectRows(relabeling) : []}
            emptyMessage={EMPTY_GATEWAY_MESSAGE}
            minWidthClassName="min-w-[420px]"
            rowKey={(row) => row.key}
          />
        </SummaryCard>
      </section>

      <ChartCard
        description="Contoh before/after ditampilkan bila tersedia dari dataset penelitian."
        title="Sampel Teks Sebelum / Sesudah"
      >
        <SimpleTable
          columns={[
            {
              key: "label",
              header: "Sumber",
              render: (row) => row.label,
            },
            {
              key: "value",
              header: "Ringkasan",
              render: (row) => row.value,
            },
          ]}
          data={
            preprocessingResult.isAvailable &&
            typeof preprocessing.text_cleaning_summary === "object" &&
            preprocessing.text_cleaning_summary !== null
              ? objectRows(preprocessing.text_cleaning_summary as Record<string, unknown>)
              : []
          }
          emptyMessage={EMPTY_GATEWAY_MESSAGE}
          minWidthClassName="min-w-[720px]"
          rowKey={(row) => row.key}
        />
      </ChartCard>

      <ChartCard
        description="Tabel ini menunjukkan status before/after cleaning jika metadata tersedia dari API Gateway."
        title="Tabel Prapemrosesan Review"
      >
        <SimpleTable
          columns={preprocessingReviewColumns}
          data={reviews}
          emptyMessage={EMPTY_GATEWAY_MESSAGE}
          minWidthClassName="min-w-[1280px]"
          rowKey={(row, index) => row.external_id ?? `preprocessing-review-${index}`}
        />
      </ChartCard>
    </AppShell>
  );
}
