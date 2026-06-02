import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface SummaryCardItem {
  label: string;
  value: ReactNode;
  description?: string;
}

interface SummaryCardProps {
  title: string;
  description?: string;
  items?: readonly SummaryCardItem[];
  children?: ReactNode;
  className?: string;
}

export function SummaryCard({
  title,
  description,
  items,
  children,
  className,
}: SummaryCardProps) {
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

      {items?.length ? (
        <dl className="mt-5 grid gap-3 sm:grid-cols-2">
          {items.map((item) => (
            <div
              className="rounded-md border border-border bg-background px-4 py-3"
              key={item.label}
            >
              <dt className="text-xs font-medium uppercase tracking-normal text-muted-foreground">
                {item.label}
              </dt>
              <dd className="mt-1 text-sm font-semibold text-foreground">
                {item.value}
              </dd>
              {item.description ? (
                <dd className="mt-1 text-xs leading-5 text-muted-foreground">
                  {item.description}
                </dd>
              ) : null}
            </div>
          ))}
        </dl>
      ) : null}

      {children ? <div className="mt-5">{children}</div> : null}
    </section>
  );
}
