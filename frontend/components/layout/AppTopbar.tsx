import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AppTopbarProps {
  title?: string;
  contextLabel?: string;
  statusLabel?: string;
  actions?: ReactNode;
  className?: string;
}

export function AppTopbar({
  title = "SentiRank",
  contextLabel = "Frontend foundation",
  statusLabel = "Light Mode",
  actions,
  className,
}: AppTopbarProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-20 flex min-h-16 items-center justify-between gap-4 border-b border-border bg-card/95 px-4 backdrop-blur sm:px-6 lg:px-8",
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

      <div className="flex shrink-0 items-center gap-2">
        <span className="rounded-md border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
          {statusLabel}
        </span>
        {actions}
      </div>
    </header>
  );
}
