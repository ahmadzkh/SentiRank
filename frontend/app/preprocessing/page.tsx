import { ApiGatewayAlert } from "@/components/alerts/ApiGatewayAlert";
import { ChartCard } from "@/components/cards/ChartCard";
import { StatCard } from "@/components/cards/StatCard";
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

function relabelingRows(relabeling: Record<string, unknown>) {
  const labelMap: Record<string, string> = {
    changed_label_count: "Jumlah label berubah",
    total_before: "Total sebelum",
    total_after: "Total sesudah",
    negative_to_positive: "Negatif ke positif",
    positive_to_negative: "Positif ke negatif",
    neutral_to_negative: "Netral ke negatif",
    neutral_to_positive: "Netral ke positif",
    positive_to_neutral: "Positif ke netral",
    negative_to_neutral: "Negatif ke netral",
  };
  return Object.entries(relabeling).map(([key, value]) => ({
    key,
    label: labelMap[key] ?? key,
    value:
      typeof value === "object" && value !== null
        ? JSON.stringify(value)
        : stringValue(String(value), EMPTY_TEXT),
  }));
}

function textCleaningRows(summary: Record<string, unknown>) {
  const labelMap: Record<string, string> = {
    total_stopwords_removed: "Stopwords dihapus",
    total_mentions_removed: "Mention dihapus",
    total_urls_removed: "URL dihapus",
    total_emojis_removed: "Emoji dihapus",
    total_whitespace_normalized: "Spasi dinormalisasi",
    avg_token_length_before: "Panjang token rata-rata (sebelum)",
    avg_token_length_after: "Panjang token rata-rata (sesudah)",
    avg_review_length_before: "Panjang ulasan rata-rata (sebelum)",
    avg_review_length_after: "Panjang ulasan rata-rata (sesudah)",
  };
  return Object.entries(summary).map(([key, value]) => ({
    key,
    label: labelMap[key] ?? key,
    value:
      typeof value === "object" && value !== null
        ? JSON.stringify(value)
        : stringValue(String(value), EMPTY_TEXT),
  }));
}

function cleanedReviewText(row: GatewayReviewSample) {
  return tableCellValue(
    row.cleaned_content ??
      row.cleaned_text ??
      row.text_indobert ??
      row.text_svm,
  );
}

const pipelineTableColumns = [
  {
    key: "name",
    header: "Tahap",
    render: (row) => (
      <span className="font-medium text-foreground">{String(row.name)}</span>
    ),
  },
  {
    key: "description",
    header: "Penjelasan",
    render: (row) => String(row.description),
  },
  {
    key: "rowsAffected",
    header: "Baris",
    align: "right" as const,
    render: (row) => String(row.rowsAffected),
  },
  {
    key: "status",
    header: "Status",
    render: (row) => (
      <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-medium text-slate-700">
        {String(row.status)}
      </span>
    ),
  },
] satisfies SimpleTableColumn<Record<string, unknown>>[];

const relabelingTableColumns = [
  {
    key: "label",
    header: "Item",
    render: (row) => (
      <span className="font-medium text-foreground">{String(row.label)}</span>
    ),
  },
  {
    key: "value",
    header: "Nilai",
    render: (row) => String(row.value),
  },
] satisfies SimpleTableColumn<Record<string, unknown>>[];

const textCleaningColumns = [
  {
    key: "label",
    header: "Sumber",
    render: (row) => (
      <span className="font-medium text-foreground">{String(row.label)}</span>
    ),
  },
  {
    key: "value",
    header: "Ringkasan",
    render: (row) => String(row.value),
  },
] satisfies SimpleTableColumn<Record<string, unknown>>[];

const preprocessingReviewColumns = [
  {
    key: "no",
    header: "No",
    align: "center" as const,
    className: "w-16",
    render: (_row, index) => index + 1,
  },
  {
    key: "originalReview",
    header: "Teks Asli",
    className: "min-w-[280px] max-w-[400px]",
    render: (row: GatewayReviewSample) => (
      <span className="line-clamp-3 break-words font-medium text-foreground">
        {tableCellValue(row.content)}
      </span>
    ),
  },
  {
    key: "cleanedReview",
    header: "Teks Bersih",
    className: "min-w-[280px] max-w-[400px]",
    render: (row: GatewayReviewSample) => (
      <span className="line-clamp-3 break-words text-muted-foreground">
        {cleanedReviewText(row)}
      </span>
    ),
  },
  {
    key: "textLengthBefore",
    header: "Panjang Sebelum",
    align: "right" as const,
    render: (row: GatewayReviewSample) =>
      tableCellValue(row.text_length_before),
  },
  {
    key: "textLengthAfter",
    header: "Panjang Sesudah",
    align: "right" as const,
    render: (row: GatewayReviewSample) => tableCellValue(row.text_length_after),
  },
  {
    key: "noiseFlag",
    header: "Flag Gangguan",
    render: (row: GatewayReviewSample) => {
      const flag = row.noise_flag;
      if (typeof flag === "boolean") return flag ? "Ya" : "Tidak";
      return tableCellValue(flag);
    },
  },
  {
    key: "dropReason",
    header: "Alasan Dihapus",
    render: (row: GatewayReviewSample) => {
      const reason = row.drop_reason;
      if (!reason) return EMPTY_TABLE_CELL;
      const labelMap: Record<string, string> = {
        duplicate: "Duplikat",
        too_short: "Terlalu pendek",
        non_indonesian: "Bukan Bahasa Indonesia",
        empty_after_cleaning: "Kosong setelah cleaning",
        low_quality: "Kualitas rendah",
      };
      return labelMap[String(reason)] ?? tableCellValue(reason);
    },
  },
  {
    key: "preprocessingStatus",
    header: "Status Prapemrosesan",
    render: (row: GatewayReviewSample) => {
      const status = row.preprocessing_status;
      if (!status) return EMPTY_TABLE_CELL;
      const labelMap: Record<string, string> = {
        processed: "Terproses",
        valid: "Valid",
        dropped: "Dihapus",
        cleaned: "Dibersihkan",
      };
      return labelMap[String(status)] ?? tableCellValue(status);
    },
  },
] satisfies SimpleTableColumn<GatewayReviewSample>[];

export default async function PreprocessingPage() {
  const [preprocessingResult, reviewsResult] = await Promise.all([
    safeGatewayData(getPreprocessingSummary, EMPTY_PREPROCESSING_SUMMARY),
    safeGatewayData(
      () => getReviews({ limit: 10, seed: 30 }),
      EMPTY_RANDOM_REVIEWS,
    ),
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
        description="Pipeline pembersihan teks sebelum analisis."
        eyebrow="Persiapan teks"
        title="Prapemrosesan"
      />

      <ApiGatewayAlert error={apiError} />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          description="Ulasan valid setelah filtering."
          label="Ulasan Bersih"
          value={
            preprocessing.valid_review_count ?? preprocessing.total_rows ?? 0
          }
        />
        <StatCard
          description="Ulasan sebelum filtering."
          label="Ulasan Mentah"
          value={preprocessing.input_review_count ?? 0}
        />
        <StatCard
          description="Ulasan dihapus saat filtering."
          label="Ulasan Dihapus"
          tone="negative"
          value={preprocessing.dropped_review_count ?? 0}
        />
        <StatCard
          description="Status data aspek untuk SVM."
          label="Status Aspek"
          tone="neutral"
          value={
            preprocessing.aspect_data_status ? "Tersedia" : "Belum tersedia"
          }
        />
      </section>

      {/* Pipeline table — full width */}
      <ChartCard
        description="Urutan proses pipeline."
        title="Ringkasan Tahap Pipeline"
      >
        <SimpleTable
          columns={pipelineTableColumns}
          data={pipelineRows}
          emptyMessage={EMPTY_GATEWAY_MESSAGE}
          minWidthClassName="min-w-[760px]"
          rowKey={(row) => row.id}
        />
      </ChartCard>

      {/* Relabeling table — full width */}
      <ChartCard
        description="Ringkasan perubahan label dari output preprocessing."
        title="Ringkasan Relabeling Sentimen"
      >
        <SimpleTable
          columns={relabelingTableColumns}
          data={
            preprocessingResult.isAvailable ? relabelingRows(relabeling) : []
          }
          emptyMessage={EMPTY_GATEWAY_MESSAGE}
          minWidthClassName="min-w-[420px]"
          rowKey={(row) => row.key}
        />
      </ChartCard>

      {/* Text cleaning summary — full width */}
      <ChartCard
        description="Contoh teks sebelum dan sesudah."
        title="Ringkasan Pembersihan Teks"
      >
        <SimpleTable
          columns={textCleaningColumns}
          data={
            preprocessingResult.isAvailable &&
            typeof preprocessing.text_cleaning_summary === "object" &&
            preprocessing.text_cleaning_summary !== null
              ? textCleaningRows(
                  preprocessing.text_cleaning_summary as Record<
                    string,
                    unknown
                  >,
                )
              : []
          }
          emptyMessage={EMPTY_GATEWAY_MESSAGE}
          minWidthClassName="min-w-[720px]"
          rowKey={(row) => row.key}
        />
      </ChartCard>

      {/* Sample review table — full width */}
      <ChartCard
        description="Tabel sampel teks sebelum dan sesudah."
        title="Tabel Prapemrosesan"
      >
        <SimpleTable
          columns={preprocessingReviewColumns}
          data={reviews}
          emptyMessage={EMPTY_GATEWAY_MESSAGE}
          minWidthClassName="min-w-[1280px]"
          rowKey={(row, index) =>
            row.external_id ?? `preprocessing-review-${index}`
          }
        />
      </ChartCard>
    </AppShell>
  );
}
