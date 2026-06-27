import type { Review } from "@/types/review";
import { AspectBadge } from "@/components/badges/AspectBadge";
import { SentimentBadge } from "@/components/badges/SentimentBadge";

const COUNT_FORMATTER = new Intl.NumberFormat("id-ID");

interface ReviewTableProps {
  reviews: readonly Review[];
  emptyMessage?: string;
  reviewHeader?: string;
  reviewerHeader?: string;
  showReviewerColumn?: boolean;
  showWordCount?: boolean;
  wordCountHeader?: string;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export function ReviewTable({
  reviews,
  emptyMessage = "Belum ada ulasan yang tersedia.",
  reviewHeader = "Ulasan",
  reviewerHeader = "Reviewer",
  showReviewerColumn = false,
  showWordCount = false,
  wordCountHeader = "Jumlah Kata",
}: ReviewTableProps) {
  if (reviews.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-border bg-background px-4 py-8 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <div className="overflow-x-auto">
        <table className="min-w-[960px] w-full border-collapse bg-card text-left text-sm">
          <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-normal text-muted-foreground">
            <tr>
              <th className="px-4 py-3">{reviewHeader}</th>
              {showReviewerColumn ? (
                <th className="px-4 py-3">{reviewerHeader}</th>
              ) : null}
              {showWordCount ? (
                <th className="px-4 py-3 text-right">{wordCountHeader}</th>
              ) : null}
              <th className="px-4 py-3">Sentimen</th>
              <th className="px-4 py-3">Aspek</th>
              <th className="px-4 py-3 text-right">Rating</th>
              <th className="px-4 py-3">Tanggal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {reviews.map((review) => (
              <tr className="align-top hover:bg-slate-50" key={review.id}>
                <td className="max-w-[360px] px-4 py-4">
                  <p className="line-clamp-2 font-medium leading-6 text-foreground">
                    {review.text}
                  </p>
                  {!showReviewerColumn ? (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {review.userName}
                    </p>
                  ) : null}
                </td>
                {showReviewerColumn ? (
                  <td className="max-w-[180px] px-4 py-4 text-muted-foreground">
                    <span className="line-clamp-2 break-all">{review.userName}</span>
                  </td>
                ) : null}
                {showWordCount ? (
                  <td className="px-4 py-4 text-right font-medium text-foreground">
                    {COUNT_FORMATTER.format(review.wordCount ?? 0)}
                  </td>
                ) : null}
                <td className="px-4 py-4">
                  <SentimentBadge sentiment={review.sentimentLabel} />
                </td>
                <td className="px-4 py-4">
                  <div className="flex max-w-72 flex-wrap gap-1.5">
                    {review.aspectLabels?.length ? (
                      review.aspectLabels.map((aspect) => (
                        <AspectBadge aspect={aspect} key={aspect} />
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        Tidak tersedia
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-4 text-right font-medium text-foreground">
                  {review.rating}/5
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-muted-foreground">
                  {formatDate(review.reviewDate)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
