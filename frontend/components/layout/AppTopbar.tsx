import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AppTopbarProps {
  title?: string;
  contextLabel?: string;
  actions?: ReactNode;
  className?: string;
}

export function AppTopbar({
  title = "SentiRank",
  contextLabel = "Fondasi frontend",
  actions,
  className,
}: AppTopbarProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex min-h-16 shrink-0 items-center justify-between gap-4 border-b border-border bg-card/95 px-4 backdrop-blur sm:px-6 lg:px-8",
        className,
      )}
    >
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-normal text-muted-foreground">
          {contextLabel}
        </p>
        <h1 className="truncate text-base font-semibold text-foreground">
          {title}
        </h1>
      </div>

      {actions ? (
        <div className="flex shrink-0 items-center gap-2">{actions}</div>
      ) : null}
    </header>
  );
}
