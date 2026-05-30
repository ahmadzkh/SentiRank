import { cn } from "@/lib/utils";

export interface RankingCardItem {
  id: string;
  rank: number;
  label: string;
  score: string;
  description?: string;
}

interface RankingCardProps {
  title: string;
  description?: string;
  items: readonly RankingCardItem[];
  emptyMessage?: string;
  className?: string;
}

export function RankingCard({
  title,
  description,
  items,
  emptyMessage = "No ranking data available.",
  className,
}: RankingCardProps) {
  return (
    <section
      className={cn(
        "rounded-lg border border-border bg-card p-5 shadow-sm",
        className,
      )}
    >
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      {description ? (
        <p className="mt-1 text-sm leading-5 text-muted-foreground">
          {description}
        </p>
      ) : null}

      {items.length === 0 ? (
        <div className="mt-5 rounded-md border border-dashed border-border bg-background px-4 py-6 text-sm text-muted-foreground">
          {emptyMessage}
        </div>
      ) : (
        <ol className="mt-5 space-y-3">
          {items.map((item) => (
            <li
              className="flex gap-3 rounded-md border border-border bg-background p-3"
              key={item.id}
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-blue-50 text-sm font-semibold text-blue-700">
                {item.rank}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <p className="truncate text-sm font-medium text-foreground">
                    {item.label}
                  </p>
                  <p className="text-sm font-semibold text-primary">
                    {item.score}
                  </p>
                </div>
                {item.description ? (
                  <p className="mt-1 text-sm leading-5 text-muted-foreground">
                    {item.description}
                  </p>
                ) : null}
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
