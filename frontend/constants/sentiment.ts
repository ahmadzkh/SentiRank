import type { ReviewSentimentLabel } from "@/types/sentiment";

export const SENTIMENT_LABELS = [
  "positive",
  "neutral",
  "negative",
] as const satisfies readonly ReviewSentimentLabel[];

export const SENTIMENT_META: Record<
  ReviewSentimentLabel,
  {
    label: string;
    description: string;
    tone: "success" | "neutral" | "danger";
    chartColor: string;
    badgeClassName: string;
  }
> = {
  positive: {
    label: "Positif",
    description: "Ulasan menunjukkan kepuasan atau persetujuan yang jelas.",
    tone: "success",
    chartColor: "#16a34a",
    badgeClassName: "bg-green-50 text-green-700 border-green-200",
  },
  neutral: {
    label: "Netral",
    description: "Ulasan bersifat campuran, informatif, atau rendah emosi.",
    tone: "neutral",
    chartColor: "#64748b",
    badgeClassName: "bg-slate-50 text-slate-700 border-slate-200",
  },
  negative: {
    label: "Negatif",
    description: "Ulasan menunjukkan ketidakpuasan, masalah, atau keluhan.",
    tone: "danger",
    chartColor: "#dc2626",
    badgeClassName: "bg-red-50 text-red-700 border-red-200",
  },
};
