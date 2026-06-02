import type { AhpCriterion, PairwiseComparison } from "@/types/ahp";

interface PairwiseComparisonInputProps {
  criteria: readonly AhpCriterion[];
  comparisons: readonly PairwiseComparison[];
  emptyMessage?: string;
}

function formatValue(value: number) {
  return new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 3,
  }).format(value);
}

export function PairwiseComparisonInput({
  criteria,
  comparisons,
  emptyMessage = "Pairwise comparison belum tersedia.",
}: PairwiseComparisonInputProps) {
  const criteriaById = new Map(criteria.map((criterion) => [criterion.id, criterion]));

  if (criteria.length === 0 || comparisons.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-border bg-background px-4 py-8 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {comparisons.map((comparison) => {
        const criterionA = criteriaById.get(comparison.criterionAId);
        const criterionB = criteriaById.get(comparison.criterionBId);

        return (
          <div
            className="rounded-md border border-border bg-background px-4 py-3"
            key={comparison.id}
          >
            <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
              <div>
                <p className="text-sm font-medium text-foreground">
                  {criterionA?.label ?? comparison.criterionAId}
                  <span className="px-2 text-muted-foreground">vs</span>
                  {criterionB?.label ?? comparison.criterionBId}
                </p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  {comparison.scaleLabel}. Nilai ini berasal dari mock data dan
                  belum merepresentasikan judgement final.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-md border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                  Nilai {formatValue(comparison.value)}
                </span>
                <span className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700">
                  Resiprokal {formatValue(comparison.reciprocalValue)}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
