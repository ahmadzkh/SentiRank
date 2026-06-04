"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { RefreshCcw } from "lucide-react";
import { ChartCard } from "@/components/cards/ChartCard";
import { getRandomReviews } from "@/services/review-service";
import type {
  RandomReviewQuery,
  RandomReviewResponse,
  ResearchReviewSample,
  Review,
  ReviewSentimentLabel,
} from "@/types";

interface RandomReviewSamplesSectionProps {
  title: string;
  description: string;
  fallbackReviews: readonly Review[];
  query?: RandomReviewQuery;
}

type ReviewSampleStatus = "loading" | "backend" | "fallback";

function formatDate(value: string | null) {
  if (!value) {
    return "Belum tersedia";
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function getSentimentLabel(sentiment: string | null) {
  const normalized = sentiment?.toLowerCase();

  if (normalized === "positive") {
    return "Positif";
  }

  if (normalized === "neutral") {
    return "Netral";
  }

  if (normalized === "negative") {
    return "Negatif";
  }

  return "Belum tersedia";
}

function getSentimentClassName(sentiment: string | null) {
  const normalized = sentiment?.toLowerCase();

  if (normalized === "positive") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (normalized === "negative") {
    return "border-red-200 bg-red-50 text-red-700";
  }

  if (normalized === "neutral") {
    return "border-slate-200 bg-slate-50 text-slate-700";
  }

  return "border-slate-200 bg-slate-50 text-slate-600";
}

function normalizeAspectLabel(value: string | null) {
  return value?.trim() || "Belum tersedia";
}

function mapFallbackReview(review: Review): ResearchReviewSample {
  return {
    aspect: review.aspectLabels?.join(", ") ?? null,
    id: review.id,
    rating: review.rating,
    reviewedAt: review.reviewDate,
    reviewText: review.text,
    sentiment: review.sentimentLabel ?? null,
    source: review.source,
  };
}

function getFallbackResponse(
  fallbackReviews: readonly Review[],
  limit: number,
): RandomReviewResponse {
  const items = fallbackReviews.slice(0, limit).map(mapFallbackReview);

  return {
    count: items.length,
    items,
    limit,
    source: "frontend/lib/research-sample-reviews.ts",
  };
}

function statusCopy(status: ReviewSampleStatus) {
  if (status === "backend") {
    return "Backend aktif";
  }

  if (status === "loading") {
    return "Memuat";
  }

  return "Mode fallback";
}

function sentimentQueryCopy(sentiment?: string) {
  const normalized = sentiment?.toLowerCase() as ReviewSentimentLabel | undefined;

  if (!normalized) {
    return null;
  }

  return getSentimentLabel(normalized);
}

export function RandomReviewSamplesSection({
  title,
  description,
  fallbackReviews,
  query,
}: RandomReviewSamplesSectionProps) {
  const limit = query?.limit ?? 10;
  const fallbackResponse = useMemo(
    () => getFallbackResponse(fallbackReviews, limit),
    [fallbackReviews, limit],
  );
  const [response, setResponse] =
    useState<RandomReviewResponse>(fallbackResponse);
  const [status, setStatus] = useState<ReviewSampleStatus>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadSamples = useCallback(async () => {
    setStatus("loading");
    setErrorMessage(null);

    const result = await getRandomReviews({
      ...query,
      limit,
    });

    if (result.success && result.data) {
      setResponse(result.data);
      setStatus("backend");
      return;
    }

    setResponse(fallbackResponse);
    setStatus("fallback");
    setErrorMessage(
      result.error?.message ??
        "Backend API belum aktif. Jalankan ml-service terlebih dahulu.",
    );
  }, [fallbackResponse, limit, query]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadSamples();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadSamples]);

  return (
    <ChartCard
      actions={
        <button
          className="inline-flex items-center gap-2 rounded-md border border-blue-200 bg-white px-3 py-2 text-sm font-medium text-blue-700 shadow-sm transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={status === "loading"}
          onClick={() => void loadSamples()}
          type="button"
        >
          <RefreshCcw className="h-4 w-4" />
          Refresh Sampel
        </button>
      }
      description={description}
      title={title}
    >
      <div className="mb-4 grid gap-3 rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-muted-foreground md:grid-cols-3">
        <div>
          <span className="block text-xs font-medium uppercase text-slate-500">
            Status
          </span>
          <span className="font-medium text-foreground">{statusCopy(status)}</span>
        </div>
        <div>
          <span className="block text-xs font-medium uppercase text-slate-500">
            Jumlah sampel
          </span>
          <span className="font-medium text-foreground">
            {response.count.toLocaleString("id-ID")} dari limit{" "}
            {response.limit.toLocaleString("id-ID")}
          </span>
        </div>
        <div>
          <span className="block text-xs font-medium uppercase text-slate-500">
            Sumber data
          </span>
          <span className="block break-words font-medium text-foreground">
            {response.source}
          </span>
        </div>
      </div>

      {query?.sentiment || query?.aspect || query?.withAspect ? (
        <div className="mb-4 flex flex-wrap gap-2 text-xs font-medium">
          {query.sentiment ? (
            <span className="rounded-md border border-blue-200 bg-blue-50 px-2 py-1 text-blue-700">
              Sentimen: {sentimentQueryCopy(query.sentiment)}
            </span>
          ) : null}
          {query.aspect ? (
            <span className="rounded-md border border-blue-200 bg-blue-50 px-2 py-1 text-blue-700">
              Aspek: {query.aspect}
            </span>
          ) : null}
          {query.withAspect ? (
            <span className="rounded-md border border-blue-200 bg-blue-50 px-2 py-1 text-blue-700">
              Hanya ulasan dengan aspek
            </span>
          ) : null}
        </div>
      ) : null}

      {errorMessage ? (
        <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
          <p className="font-medium">
            Backend API belum aktif. Jalankan ml-service terlebih dahulu.
          </p>
          <p className="mt-1 break-words text-xs">{errorMessage}</p>
          <p className="mt-1 text-xs">
            Tabel sementara memakai fallback sampel riset lokal, bukan hasil
            backend.
          </p>
        </div>
      ) : null}

      {response.items.length === 0 ? (
        <div className="rounded-md border border-dashed border-border bg-background px-4 py-8 text-center text-sm text-muted-foreground">
          Belum ada sampel ulasan yang sesuai dengan filter.
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] border-collapse bg-card text-left text-sm">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-normal text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Ulasan</th>
                  <th className="px-4 py-3">Sentimen</th>
                  <th className="px-4 py-3">Aspek</th>
                  <th className="px-4 py-3 text-right">Rating</th>
                  <th className="px-4 py-3">Tanggal</th>
                  <th className="px-4 py-3">Sumber</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {response.items.map((sample) => (
                  <tr className="align-top hover:bg-slate-50" key={sample.id}>
                    <td className="max-w-[460px] px-4 py-4">
                      <p className="line-clamp-3 break-words font-medium leading-6 text-foreground">
                        {sample.reviewText}
                      </p>
                      <p className="mt-1 break-all text-xs text-muted-foreground">
                        {sample.id}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex rounded-md border px-2 py-1 text-xs font-medium ${getSentimentClassName(sample.sentiment)}`}
                      >
                        {getSentimentLabel(sample.sentiment)}
                      </span>
                    </td>
                    <td className="max-w-[260px] px-4 py-4">
                      <div className="space-y-1">
                        <span className="inline-flex max-w-full rounded-md border border-blue-200 bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                          <span className="truncate">
                            {normalizeAspectLabel(sample.aspect)}
                          </span>
                        </span>
                        {sample.aspectConfidence ? (
                          <p className="text-xs text-muted-foreground">
                            Confidence: {sample.aspectConfidence}
                          </p>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right font-medium text-foreground">
                      {sample.rating ? `${sample.rating}/5` : "Belum tersedia"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-muted-foreground">
                      {formatDate(sample.reviewedAt)}
                    </td>
                    <td className="max-w-[220px] px-4 py-4">
                      <span className="block break-words text-muted-foreground">
                        {sample.source ?? "Belum tersedia"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </ChartCard>
  );
}
