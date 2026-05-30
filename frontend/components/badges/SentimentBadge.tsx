import { SENTIMENT_META } from "@/constants/sentiment";
import type { ReviewSentimentLabel } from "@/types/sentiment";
import { cn } from "@/lib/utils";

interface SentimentBadgeProps {
  sentiment?: ReviewSentimentLabel;
  className?: string;
}

export function SentimentBadge({ sentiment, className }: SentimentBadgeProps) {
  if (!sentiment) {
    return (
      <span
        className={cn(
          "inline-flex items-center rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-medium text-slate-600",
          className,
        )}
      >
        Unknown
      </span>
    );
  }

  const meta = SENTIMENT_META[sentiment];

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-1 text-xs font-medium",
        meta.badgeClassName,
        className,
      )}
    >
      {meta.label}
    </span>
  );
}
