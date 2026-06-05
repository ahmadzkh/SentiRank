import type { Review } from "@/types/review";
import { AspectBadge } from "@/components/badges/AspectBadge";
import { SentimentBadge } from "@/components/badges/SentimentBadge";

interface ReviewTableProps {
  reviews: readonly Review[];
  emptyMessage?: string;
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
        <table className="min-w-[840px] w-full border-collapse bg-card text-left text-sm">
          <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-normal text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Ulasan</th>
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
                  <p className="mt-1 text-xs text-muted-foreground">
                    {review.userName}
                  </p>
                </td>
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
