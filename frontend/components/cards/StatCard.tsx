import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type StatCardTone = "default" | "primary" | "positive" | "neutral" | "negative";

const toneClassName: Record<StatCardTone, string> = {
  default: "border-border",
  primary: "border-blue-200",
  positive: "border-green-200",
  neutral: "border-slate-200",
  negative: "border-red-200",
};

interface StatCardProps {
  label: string;
  value: ReactNode;
  description?: string;
  footer?: ReactNode;
  tone?: StatCardTone;
  className?: string;
}

export function StatCard({
  label,
  value,
  description,
  footer,
  tone = "default",
  className,
}: StatCardProps) {
  return (
    <section
      className={cn(
        "min-h-32 rounded-lg border bg-card p-5 shadow-sm",
        toneClassName[tone],
        className,
      )}
    >
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <div className="mt-3 min-w-0 break-words text-2xl font-semibold tracking-normal text-foreground">
        {value}
      </div>
      {description ? (
        <p className="mt-2 text-sm leading-5 text-muted-foreground">
          {description}
        </p>
      ) : null}
      {footer ? <div className="mt-4">{footer}</div> : null}
    </section>
  );
}
