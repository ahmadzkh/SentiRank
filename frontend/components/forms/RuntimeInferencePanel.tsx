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
const HISTORY_LIMIT = 20;

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
    render: (_row, index) => index + 1,
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
    header: "Confidence Sentimen",
    align: "right",
    render: (row) => formatInferenceConfidence(row.sentiment.confidence),
  },
  {
    key: "aspect",
    header: "Aspek/Kriteria",
    className: "min-w-[190px]",
    render: (row) => (
      <span className="inline-flex rounded-md border border-blue-200 bg-blue-50 px-2 py-1 text-xs font-medium text-blue-800">
        {row.aspect.label ?? "Belum diklasifikasi"}
      </span>
    ),
  },
  {
    key: "aspectConfidence",
    header: "Confidence Aspek",
    align: "right",
    render: (row) => formatInferenceConfidence(row.aspect.confidence),
  },
  {
    key: "source",
    header: "Sumber Prediksi",
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
] satisfies readonly SimpleTableColumn<RuntimeInferenceHistoryItem>[];

export function RuntimeInferencePanel({
  initialHistory,
  initialGatewayError,
}: RuntimeInferencePanelProps) {
  const [reviewText, setReviewText] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [result, setResult] = useState<RuntimeInferenceResult | null>(null);
  const [history, setHistory] = useState(initialHistory.items);
  const [historyTotal, setHistoryTotal] = useState(initialHistory.total);
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

  async function refreshHistory() {
    setIsRefreshing(true);
    try {
      const nextHistory = await getRuntimeInferenceHistory({
        limit: HISTORY_LIMIT,
      });
      setHistory(nextHistory.items);
      setHistoryTotal(nextHistory.total);
      setGatewayError(null);
    } catch (error) {
      setHistory([]);
      setHistoryTotal(0);
      setGatewayError(normalizeApiGatewayError(error));
    } finally {
      setIsRefreshing(false);
    }
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
      setHistory([]);
      setHistoryTotal(0);
      setGatewayError(normalizeApiGatewayError(error));
      setIsSubmitting(false);
      return;
    }

    try {
      const nextHistory = await getRuntimeInferenceHistory({
        limit: HISTORY_LIMIT,
      });
      setHistory(nextHistory.items);
      setHistoryTotal(nextHistory.total);
    } catch (error) {
      setHistory([]);
      setHistoryTotal(0);
      setGatewayError(normalizeApiGatewayError(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <ApiGatewayAlert error={gatewayError} />

      <ChartCard
        description="Masukkan satu ulasan Spotify untuk dianalisis oleh IndoBERT dan SVM melalui API Gateway."
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
            {isSubmitting ? "Menganalisis..." : "Analisis Ulasan"}
          </button>
        </form>
      </ChartCard>

      <div aria-live="polite">
        {result ? (
          <section className="space-y-6" aria-label="Hasil analisis ulasan">
            <SummaryCard
              description="Ringkasan hasil runtime dari layanan model dan status penyimpanan riwayat."
              items={[
                {
                  label: "Teks dianalisis",
                  value: <span className="break-words">{result.text}</span>,
                },
                {
                  label: "Status riwayat",
                  value: result.saved ? "Tersimpan" : "Belum tersimpan",
                },
                {
                  label: "Waktu analisis",
                  value: formatInferenceDateTime(result.created_at),
                },
              ]}
              title="Ringkasan Hasil"
            />

            <div className="grid gap-6 xl:grid-cols-2">
              <SummaryCard
                description="Prediksi sentimen dari layanan IndoBERT."
                items={[
                  {
                    label: "Sentimen",
                    value: (
                      <SentimentBadge
                        sentiment={normalizeRuntimeSentiment(result.sentiment.label)}
                      />
                    ),
                  },
                  {
                    label: "Confidence",
                    value: formatInferenceConfidence(result.sentiment.confidence),
                  },
                  {
                    label: "Model",
                    value: result.sentiment.model_name ?? "-",
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
                title="Hasil Sentimen"
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
                description="Klasifikasi aspek atau kriteria dari layanan SVM."
                items={[
                  {
                    label: "Aspek/Kriteria",
                    value: (
                      <span className="inline-flex rounded-md border border-blue-200 bg-blue-50 px-2 py-1 text-xs font-medium text-blue-800">
                        {result.aspect.label ?? "Belum diklasifikasi"}
                      </span>
                    ),
                  },
                  {
                    label: "Confidence",
                    value: formatInferenceConfidence(result.aspect.confidence),
                    description:
                      result.aspect.confidence === null
                        ? "Model SVM dapat tidak menyediakan probability."
                        : undefined,
                  },
                  {
                    label: "Model",
                    value: result.aspect.model_name ?? "-",
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
                title="Hasil Aspek"
              />
            </div>

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
        ) : null}
      </div>

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
            {isRefreshing ? "Memuat..." : "Muat Ulang Riwayat"}
          </button>
        }
        description={`Menampilkan ${history.length.toLocaleString("id-ID")} dari ${historyTotal.toLocaleString("id-ID")} riwayat terbaru yang tersedia.`}
        title="Riwayat Analisis Ulasan"
      >
        <SimpleTable
          columns={historyColumns}
          data={gatewayError ? [] : history}
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
      </ChartCard>
    </>
  );
}
