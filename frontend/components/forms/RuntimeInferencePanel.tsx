"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { LoaderCircle, RefreshCw, ScanSearch } from "lucide-react";
import { ApiGatewayAlert } from "@/components/alerts/ApiGatewayAlert";
import { SentimentBadge } from "@/components/badges/SentimentBadge";
import { ChartCard } from "@/components/cards/ChartCard";
import { SummaryCard } from "@/components/cards/SummaryCard";
import {
  SimpleTable,
  type SimpleTableColumn,
} from "@/components/tables/SimpleTable";
import {
  EMPTY_GATEWAY_MESSAGE,
  normalizeApiGatewayError,
} from "@/lib/api-status";
import {
  formatInferenceConfidence,
  formatInferenceDateTime,
  normalizeRuntimeSentiment,
  predictionSourceLabel,
} from "@/lib/inference-formatters";
import {
  analyzeRuntimeReview,
  getRuntimeInferenceHistory,
} from "@/services/inference-service";
import type { ApiGatewayFailure } from "@/types/api";
import type {
  RuntimeInferenceHistoryItem,
  RuntimeInferenceHistoryResponse,
  RuntimeInferenceResult,
  RuntimePredictionBase,
} from "@/types/inference";

const MAX_REVIEW_LENGTH = 2000;
const HISTORY_PAGE_SIZE = 10;
const MAX_VISIBLE_HISTORY_PAGE_BUTTONS = 5;

type RuntimeInferenceHistoryTableRow = RuntimeInferenceHistoryItem & {
  rowNumber: number;
};

function getSafeHistoryLimit(limit: number | undefined): number {
  if (typeof limit !== "number" || !Number.isFinite(limit)) {
    return HISTORY_PAGE_SIZE;
  }

  return Math.max(1, Math.trunc(limit));
}

function getSafeHistoryTotal(total: number | undefined): number {
  if (typeof total !== "number" || !Number.isFinite(total)) {
    return 0;
  }

  return Math.max(0, Math.trunc(total));
}

function getHistoryTotalPages(total: number, limit: number): number {
  if (total === 0) {
    return 1;
  }

  return Math.max(1, Math.ceil(total / limit));
}

function getHistoryOffset(page: number, limit: number): number {
  return (Math.max(1, page) - 1) * limit;
}

function getVisibleHistoryPages(currentPage: number, totalPages: number): number[] {
  if (totalPages <= MAX_VISIBLE_HISTORY_PAGE_BUTTONS) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (currentPage <= 3) {
    return [1, 2, 3, 4, totalPages];
  }

  if (currentPage >= totalPages - 2) {
    return [1, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }

  return [1, currentPage - 1, currentPage, currentPage + 1, totalPages];
}

function hasPaginationMetadata(history: RuntimeInferenceHistoryResponse): boolean {
  return (
    typeof history.page === "number" &&
    Number.isFinite(history.page) &&
    typeof history.limit === "number" &&
    Number.isFinite(history.limit) &&
    typeof history.total_pages === "number" &&
    Number.isFinite(history.total_pages)
  );
}

interface RuntimeInferencePanelProps {
  initialHistory: RuntimeInferenceHistoryResponse;
  initialGatewayError: ApiGatewayFailure | null;
}

function sourceStatusClassName(prediction: RuntimePredictionBase): string {
  return prediction.is_fallback ||
    prediction.prediction_source?.startsWith("fallback")
    ? "border-amber-200 bg-amber-50 text-amber-800"
    : "border-green-200 bg-green-50 text-green-800";
}

const historyColumns = [
  {
    key: "number",
    header: "No",
    align: "center",
    className: "w-16",
    render: (row) => row.rowNumber,
  },
  {
    key: "review",
    header: "Teks Ulasan",
    className: "min-w-[300px] max-w-[420px]",
    render: (row) => (
      <span
        className="line-clamp-3 break-words font-medium text-foreground"
        title={row.text}
      >
        {row.text}
      </span>
    ),
  },
  {
    key: "sentiment",
    header: "Sentimen",
    render: (row) => (
      <SentimentBadge sentiment={normalizeRuntimeSentiment(row.sentiment.label)} />
    ),
  },
  {
    key: "sentimentConfidence",
    header: "Konfidensi Sentimen",
    align: "right",
    render: (row) => formatInferenceConfidence(row.sentiment.confidence),
  },
  {
    key: "aspect",
    header: "Label Aspek",
    className: "min-w-[190px]",
    render: (row) => (
      <span className="inline-flex rounded-md border border-blue-200 bg-blue-50 px-2 py-1 text-xs font-medium text-blue-800">
        {row.aspect.label ?? "Belum diklasifikasi"}
      </span>
    ),
  },
  {
    key: "aspectConfidence",
    header: "Konfidensi Aspek",
    align: "right",
    render: (row) => formatInferenceConfidence(row.aspect.confidence),
  },
  {
    key: "source",
    header: "Sumber prediksi",
    className: "min-w-[180px]",
    render: (row) => (
      <div className="space-y-1 text-xs text-muted-foreground">
        <p>
          Sentimen: {predictionSourceLabel(row.sentiment.prediction_source, row.sentiment.is_fallback)}
        </p>
        <p>
          Aspek: {predictionSourceLabel(row.aspect.prediction_source, row.aspect.is_fallback)}
        </p>
      </div>
    ),
  },
  {
    key: "createdAt",
    header: "Waktu",
    className: "min-w-[170px]",
    render: (row) => formatInferenceDateTime(row.created_at),
  },
] satisfies readonly SimpleTableColumn<RuntimeInferenceHistoryTableRow>[];

export function RuntimeInferencePanel({
  initialHistory,
  initialGatewayError,
}: RuntimeInferencePanelProps) {
  const [reviewText, setReviewText] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [result, setResult] = useState<RuntimeInferenceResult | null>(null);
  const initialHistoryLimit = getSafeHistoryLimit(initialHistory.limit);
  const initialHistoryTotal = getSafeHistoryTotal(initialHistory.total);
  const initialHistoryTotalPages = getHistoryTotalPages(
    initialHistoryTotal,
    initialHistoryLimit,
  );
  const [history, setHistory] = useState(initialHistory.items);
  const [historyTotal, setHistoryTotal] = useState(initialHistoryTotal);
  const [historyPage, setHistoryPage] = useState(
    Math.min(Math.max(1, initialHistory.page ?? 1), initialHistoryTotalPages),
  );
  const [historyLimit, setHistoryLimit] = useState(initialHistoryLimit);
  const [historyTotalPages, setHistoryTotalPages] = useState(
    Math.max(initialHistory.total_pages ?? 1, initialHistoryTotalPages),
  );
  const [historyHasReliablePagination, setHistoryHasReliablePagination] = useState(
    hasPaginationMetadata(initialHistory),
  );
  const [gatewayError, setGatewayError] =
    useState<ApiGatewayFailure | null>(initialGatewayError);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const warnings = result
    ? Array.from(
        new Set([
          ...(result.warnings ?? []),
          ...(result.sentiment.is_fallback
            ? ["Prediksi sentimen menggunakan fallback layanan."]
            : []),
          ...(result.aspect.is_fallback
            ? ["Klasifikasi aspek menggunakan fallback layanan."]
            : []),
          ...(!result.saved
            ? ["Hasil berhasil dianalisis, tetapi belum tersimpan ke riwayat."]
            : []),
        ]),
      )
    : [];
  const sentimentProbabilities = result
    ? Object.entries(result.sentiment.probabilities).filter(
        ([, probability]) =>
          Number.isFinite(probability) && probability >= 0 && probability <= 1,
      )
    : [];

  const historyOffset = getHistoryOffset(historyPage, historyLimit);
  const loadedHistoryEndNumber = history.length === 0 ? 0 : historyOffset + history.length;
  const historyStartNumber = history.length === 0 ? 0 : historyOffset + 1;
  const historyEndNumber = historyHasReliablePagination
    ? Math.min(historyTotal, loadedHistoryEndNumber)
    : loadedHistoryEndNumber;
  const historyRows = history.map((item, index) => ({
    ...item,
    rowNumber: historyOffset + index + 1,
  }));
  const historyPageNumbers = getVisibleHistoryPages(historyPage, historyTotalPages);
  const historyTotalLabel = historyHasReliablePagination
    ? `${historyTotal.toLocaleString("id-ID")} riwayat`
    : `minimal ${historyEndNumber.toLocaleString("id-ID")} riwayat`;
  const canGoToPreviousHistoryPage = historyPage > 1 && !isRefreshing && !isSubmitting;
  const canGoToNextHistoryPage =
    historyPage < historyTotalPages && !isRefreshing && !isSubmitting;

  function applyHistory(nextHistory: RuntimeInferenceHistoryResponse) {
    const nextLimit = getSafeHistoryLimit(nextHistory.limit);
    const nextTotal = getSafeHistoryTotal(nextHistory.total);
    const computedTotalPages = getHistoryTotalPages(nextTotal, nextLimit);
    const nextTotalPages = Math.max(nextHistory.total_pages ?? 1, computedTotalPages);
    const nextPage = Math.min(
      Math.max(1, nextHistory.page ?? 1),
      nextTotalPages,
    );

    setHistory(nextHistory.items);
    setHistoryTotal(nextTotal);
    setHistoryPage(nextPage);
    setHistoryLimit(nextLimit);
    setHistoryTotalPages(nextTotalPages);
    setHistoryHasReliablePagination(hasPaginationMetadata(nextHistory));
  }

  function clearHistory() {
    setHistory([]);
    setHistoryTotal(0);
    setHistoryPage(1);
    setHistoryLimit(HISTORY_PAGE_SIZE);
    setHistoryTotalPages(1);
    setHistoryHasReliablePagination(true);
  }

  async function loadHistoryPage(page: number) {
    const targetPage = Math.min(Math.max(1, page), historyTotalPages);

    setIsRefreshing(true);
    try {
      const nextHistory = await getRuntimeInferenceHistory({
        limit: HISTORY_PAGE_SIZE,
        page: targetPage,
      });
      applyHistory(nextHistory);
      setGatewayError(null);
    } catch (error) {
      clearHistory();
      setGatewayError(normalizeApiGatewayError(error));
    } finally {
      setIsRefreshing(false);
    }
  }

  async function refreshHistory() {
    await loadHistoryPage(historyPage);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = reviewText.trim();

    if (!text) {
      setFieldError("Teks ulasan wajib diisi.");
      return;
    }

    if (text.length > MAX_REVIEW_LENGTH) {
      setFieldError("Teks ulasan maksimal 2.000 karakter.");
      return;
    }

    setFieldError(null);
    setIsSubmitting(true);

    try {
      const nextResult = await analyzeRuntimeReview({ text });
      setResult(nextResult);
      setGatewayError(null);
    } catch (error) {
      setResult(null);
      clearHistory();
      setGatewayError(normalizeApiGatewayError(error));
      setIsSubmitting(false);
      return;
    }

    try {
      const nextHistory = await getRuntimeInferenceHistory({
        limit: HISTORY_PAGE_SIZE,
        page: 1,
      });
      applyHistory(nextHistory);
    } catch (error) {
      clearHistory();
      setGatewayError(normalizeApiGatewayError(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <ApiGatewayAlert error={gatewayError} />

      <section className="grid gap-6 xl:grid-cols-2">
        <ChartCard
          description="Analisis satu ulasan Spotify."
          title="Input Ulasan"
        >
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <div className="flex items-center justify-between gap-4">
                <label
                  className="text-sm font-medium text-foreground"
                  htmlFor="runtime-review-text"
                >
                  Teks ulasan
                </label>
                <span className="text-xs text-muted-foreground">
                  {reviewText.length.toLocaleString("id-ID")} / {MAX_REVIEW_LENGTH.toLocaleString("id-ID")}
                </span>
              </div>
              <textarea
                aria-describedby={
                  fieldError
                    ? "runtime-review-help runtime-review-error"
                    : "runtime-review-help"
                }
                aria-invalid={fieldError ? "true" : "false"}
                className="mt-2 min-h-36 w-full resize-y rounded-md border border-input bg-white px-3 py-2 text-sm leading-6 text-foreground outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isSubmitting}
                id="runtime-review-text"
                onChange={(event) => {
                  setReviewText(event.target.value);
                  if (fieldError) {
                    setFieldError(null);
                  }
                }}
                placeholder="Contoh: iklan terlalu banyak dan aplikasi sering lag"
                value={reviewText}
              />
              <p
                className="mt-2 text-xs leading-5 text-muted-foreground"
                id="runtime-review-help"
              >
                Teks hanya dipangkas pada spasi awal dan akhir sebelum dikirim.
              </p>
              {fieldError ? (
                <p
                  className="mt-2 text-sm font-medium text-red-700"
                  id="runtime-review-error"
                  role="alert"
                >
                  {fieldError}
                </p>
              ) : null}
            </div>

            <button
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground outline-none transition-colors hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? (
                <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
              ) : (
                <ScanSearch aria-hidden="true" className="size-4" />
              )}
              {isSubmitting ? "Menganalisis..." : "Analisis ulasan"}
            </button>
          </form>
        </ChartCard>

        <div aria-live="polite">
          {result ? (
            <section className="space-y-6" aria-label="Hasil analisis ulasan">
              <SummaryCard
                description="Output model sentimen."
                items={[
                  {
                    label: "Teks dianalisis",
                    value: <span className="break-words">{result.text}</span>,
                  },
                  {
                    label: "Sentimen",
                    value: (
                      <SentimentBadge
                        sentiment={normalizeRuntimeSentiment(result.sentiment.label)}
                      />
                    ),
                  },
                  {
                    label: "Konfidensi",
                    value: formatInferenceConfidence(result.sentiment.confidence),
                  },
                  {
                    label: "Model sentimen",
                    value: result.sentiment.model_name === "rule_based_fallback" ? "Rule-based (fallback)" : "IndoBERT",
                  },
                  {
                    label: "Sumber prediksi",
                    value: (
                      <span
                        className={`inline-flex rounded-md border px-2 py-1 text-xs font-medium ${sourceStatusClassName(result.sentiment)}`}
                      >
                        {predictionSourceLabel(
                          result.sentiment.prediction_source,
                          result.sentiment.is_fallback,
                        )}
                      </span>
                    ),
                  },
                ]}
                title="Hasil Prediksi Sentimen"
              >
                {sentimentProbabilities.length > 0 ? (
                  <div className="space-y-3">
                    <p className="text-xs font-semibold uppercase tracking-normal text-muted-foreground">
                      Probabilitas kelas
                    </p>
                    {sentimentProbabilities.map(([label, probability]) => (
                      <div className="space-y-1" key={label}>
                        <div className="flex items-center justify-between gap-4 text-xs">
                          <span className="font-medium text-foreground">
                            {label}
                          </span>
                          <span className="text-muted-foreground">
                            {formatInferenceConfidence(probability)}
                          </span>
                        </div>
                        <progress
                          aria-label={`Probabilitas ${label}`}
                          className="h-2 w-full overflow-hidden rounded-full accent-blue-600"
                          max={1}
                          value={probability}
                        />
                      </div>
                    ))}
                  </div>
                ) : null}
              </SummaryCard>

              <SummaryCard
                description="Klasifikasi aspek ulasan."
                items={[
                  {
                    label: "Aspek/kriteria",
                    value: (
                      <span className="inline-flex rounded-md border border-blue-200 bg-blue-50 px-2 py-1 text-xs font-medium text-blue-800">
                        {result.aspect.label ?? "Belum diklasifikasi"}
                      </span>
                    ),
                  },
                  {
                    label: "Konfidensi",
                    value: formatInferenceConfidence(result.aspect.confidence),
                    description:
                      result.aspect.confidence === null
                        ? "Probabilitas tidak tersedia."
                        : undefined,
                  },
                  {
                    label: "Model aspek",
                    value: result.aspect.model_name === "rule_based_fallback" ? "Rule-based (fallback)" : "SVM",
                  },
                  {
                    label: "Sumber prediksi",
                    value: (
                      <span
                        className={`inline-flex rounded-md border px-2 py-1 text-xs font-medium ${sourceStatusClassName(result.aspect)}`}
                      >
                        {predictionSourceLabel(
                          result.aspect.prediction_source,
                          result.aspect.is_fallback,
                        )}
                      </span>
                    ),
                  },
                ]}
                title="Hasil Label Aspek"
              />

              {warnings.length > 0 ? (
                <section
                  className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900"
                  role="status"
                >
                  <p className="font-semibold">Catatan hasil</p>
                  <ul className="mt-1 list-disc pl-5">
                    {warnings.map((warning) => (
                      <li key={warning}>{warning}</li>
                    ))}
                  </ul>
                </section>
              ) : null}
            </section>
          ) : (
            <section className="space-y-6" aria-label="Hasil analisis ulasan belum tersedia">
              <SummaryCard
                description="Hasil akan muncul setelah satu ulasan dianalisis."
                items={[
                  {
                    label: "Prediksi",
                    value: <SentimentBadge />,
                    description: "Belum ada ulasan yang dikirim pada sesi ini.",
                  },
                  {
                    label: "Status",
                    value: "-",
                    description: "Masukkan teks ulasan di kolom kiri.",
                  },
                ]}
                title="Hasil Prediksi Sentimen"
              />

              <SummaryCard
                description="Label aspek akan muncul setelah satu ulasan dianalisis."
                items={[
                  {
                    label: "Aspek/kriteria",
                    value: "-",
                    description: "Belum ada ulasan yang dikirim pada sesi ini.",
                  },
                  {
                    label: "Status",
                    value: "-",
                    description: "Masukkan teks ulasan di kolom kiri.",
                  },
                ]}
                title="Hasil Label Aspek"
              />
            </section>
          )}
        </div>
      </section>

      <ChartCard
        actions={
          <button
            className="inline-flex min-h-9 items-center gap-2 rounded-md border border-border bg-white px-3 py-2 text-xs font-medium text-foreground outline-none transition-colors hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isRefreshing || isSubmitting}
            onClick={refreshHistory}
            type="button"
          >
            <RefreshCw
              aria-hidden="true"
              className={`size-3.5 ${isRefreshing ? "animate-spin" : ""}`}
            />
            {isRefreshing ? "Memuat..." : "Muat ulang riwayat"}
          </button>
        }
        description="Riwayat prediksi terbaru."
        insight={
          historyRows.length === 0
            ? "Belum ada riwayat analisis ulasan."
            : `Menampilkan ${historyStartNumber.toLocaleString("id-ID")}-${historyEndNumber.toLocaleString("id-ID")} dari ${historyTotalLabel}.`
        }
        title="Riwayat Analisis Ulasan"
      >
        <SimpleTable
          columns={historyColumns}
          data={gatewayError ? [] : historyRows}
          emptyMessage={
            gatewayError
              ? EMPTY_GATEWAY_MESSAGE
              : isRefreshing
                ? "Memuat riwayat analisis ulasan..."
                : "Belum ada riwayat analisis ulasan."
          }
          minWidthClassName="min-w-[1280px]"
          rowKey={(row) => row.id}
        />

        <nav
          aria-label="Navigasi halaman riwayat analisis ulasan"
          className="mt-4 flex flex-col gap-3 border-t border-border pt-4 text-sm text-muted-foreground lg:flex-row lg:items-center lg:justify-between"
        >
          <p>
            {historyHasReliablePagination
              ? `Halaman ${historyPage.toLocaleString("id-ID")} dari ${historyTotalPages.toLocaleString("id-ID")}`
              : `Halaman ${historyPage.toLocaleString("id-ID")} dari total yang belum tersedia`}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <button
              className="inline-flex min-h-9 items-center rounded-md border border-border bg-white px-3 py-2 text-xs font-medium text-foreground outline-none transition-colors hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!canGoToPreviousHistoryPage}
              onClick={() => loadHistoryPage(historyPage - 1)}
              type="button"
            >
              Sebelumnya
            </button>

            <div className="flex flex-wrap items-center gap-1" role="group" aria-label="Nomor halaman riwayat">
              {historyPageNumbers.map((pageNumber) => {
                const isActivePage = pageNumber === historyPage;

                return (
                  <button
                    aria-current={isActivePage ? "page" : undefined}
                    aria-label={`Buka halaman ${pageNumber.toLocaleString("id-ID")}`}
                    className={`inline-flex min-h-9 min-w-9 items-center justify-center rounded-md border px-3 py-2 text-xs font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${
                      isActivePage
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-white text-foreground hover:bg-slate-50"
                    }`}
                    disabled={isActivePage || isRefreshing || isSubmitting}
                    key={pageNumber}
                    onClick={() => loadHistoryPage(pageNumber)}
                    type="button"
                  >
                    {pageNumber.toLocaleString("id-ID")}
                  </button>
                );
              })}
            </div>

            <button
              className="inline-flex min-h-9 items-center rounded-md border border-border bg-white px-3 py-2 text-xs font-medium text-foreground outline-none transition-colors hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!canGoToNextHistoryPage}
              onClick={() => loadHistoryPage(historyPage + 1)}
              type="button"
            >
              Berikutnya
            </button>
          </div>
        </nav>
      </ChartCard>
    </>
  );
}
