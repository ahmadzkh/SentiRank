"use client";

export function SkeletonShimmer({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-[length:200%_100%] ${className}`}
      style={{ animation: "shimmer 1.5s ease-in-out infinite" }}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-background p-4">
      <SkeletonShimmer className="mb-3 h-4 w-1/3" />
      <SkeletonShimmer className="mb-2 h-8 w-1/2" />
      <SkeletonShimmer className="h-3 w-2/3" />
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-background p-6">
      <SkeletonShimmer className="mb-6 h-5 w-1/4" />
      <SkeletonShimmer className="mb-3 h-48 w-full" />
      <SkeletonShimmer className="h-3 w-3/4" />
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      <div className="flex gap-4">
        {[1, 2, 3, 4].map((i) => (
          <SkeletonShimmer key={i} className="h-8 flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          {[1, 2, 3, 4].map((j) => (
            <SkeletonShimmer key={j} className="h-6 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <SkeletonShimmer className="mb-2 h-7 w-1/3" />
      <SkeletonShimmer className="mb-6 h-4 w-2/3" />

      {/* Stat cards */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <CardSkeleton key={i} />
        ))}
      </div>

      {/* Chart */}
      <ChartSkeleton />

      {/* Table */}
      <div className="rounded-lg border border-border bg-background p-6">
        <SkeletonShimmer className="mb-4 h-5 w-1/4" />
        <TableSkeleton rows={6} />
      </div>
    </div>
  );
}
