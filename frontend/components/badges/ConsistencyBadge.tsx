import type { AhpConsistencyStatus } from "@/types/ahp";
import { cn } from "@/lib/utils";

interface ConsistencyBadgeProps {
  ratio: number | null;
  status: AhpConsistencyStatus;
  threshold: number;
  className?: string;
}

const statusMeta: Record<
  AhpConsistencyStatus,
  {
    label: string;
    className: string;
  }
> = {
  consistent: {
    label: "Konsisten",
    className: "border-green-200 bg-green-50 text-green-700",
  },
  needs_review: {
    label: "Perlu ditinjau",
    className: "border-amber-200 bg-amber-50 text-amber-700",
  },
  not_available: {
    label: "Belum tersedia",
    className: "border-slate-200 bg-slate-50 text-slate-700",
  },
};

function formatRatio(value: number | null) {
  if (value === null) {
    return "CR belum tersedia";
  }

  return `CR ${Math.round(value * 100)}%`;
}

export function ConsistencyBadge({
  ratio,
  status,
  threshold,
  className,
}: ConsistencyBadgeProps) {
  const meta = statusMeta[status];

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-medium",
        meta.className,
        className,
      )}
    >
      {meta.label} - {formatRatio(ratio)} - Ambang{" "}
      {Math.round(threshold * 100)}%
    </span>
  );
}
