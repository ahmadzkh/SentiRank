import { ASPECT_META } from "@/constants/aspect";
import type { AspectLabel } from "@/types/aspect";
import { cn } from "@/lib/utils";

interface AspectBadgeProps {
  aspect?: AspectLabel;
  count?: number;
  className?: string;
}

export function AspectBadge({ aspect, count, className }: AspectBadgeProps) {
  if (!aspect) {
    return (
      <span
        className={cn(
          "inline-flex items-center rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-medium text-slate-600",
          className,
        )}
      >
        Belum diklasifikasi
      </span>
    );
  }

  const meta = ASPECT_META[aspect];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium",
        meta.badgeClassName,
        className,
      )}
    >
      {meta.label}
      {typeof count === "number" ? (
        <span className="text-[11px] opacity-75">({count})</span>
      ) : null}
    </span>
  );
}
