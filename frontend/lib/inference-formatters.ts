import type { ReviewSentimentLabel } from "@/types/sentiment";

const percentageFormatter = new Intl.NumberFormat("id-ID", {
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
  style: "percent",
});

const dateTimeFormatter = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Jakarta",
});

export function formatInferenceConfidence(
  value: number | null | undefined,
): string {
  return typeof value === "number" && Number.isFinite(value)
    ? percentageFormatter.format(value)
    : "-";
}

export function formatInferenceDateTime(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "-" : dateTimeFormatter.format(date);
}

export function predictionSourceLabel(
  source: string | null | undefined,
  isFallback: boolean,
): string {
  if (isFallback || source?.startsWith("fallback")) {
    return "Fallback";
  }

  return source === "model" ? "Model aktif" : "-";
}

export function normalizeRuntimeSentiment(
  label: string | null | undefined,
): ReviewSentimentLabel | undefined {
  const normalized = label?.trim().toLowerCase();
  return normalized === "positive" ||
    normalized === "neutral" ||
    normalized === "negative"
    ? normalized
    : undefined;
}
