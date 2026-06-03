import type { AhpCriterion, PairwiseComparison } from "@/types/ahp";

interface MatrixTableProps {
  criteria: readonly AhpCriterion[];
  comparisons: readonly PairwiseComparison[];
  emptyMessage?: string;
}

function formatMatrixValue(value: number) {
  return new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 3,
  }).format(value);
}

function getComparisonValue(
  rowCriterionId: string,
  columnCriterionId: string,
  comparisons: readonly PairwiseComparison[],
) {
  if (rowCriterionId === columnCriterionId) {
    return {
      label: "1",
      note: "Sama",
    };
  }

  const directComparison = comparisons.find(
    (comparison) =>
      comparison.criterionAId === rowCriterionId &&
      comparison.criterionBId === columnCriterionId,
  );

  if (directComparison) {
    return {
      label: formatMatrixValue(directComparison.value),
      note: directComparison.scaleLabel,
    };
  }

  const reciprocalComparison = comparisons.find(
    (comparison) =>
      comparison.criterionAId === columnCriterionId &&
      comparison.criterionBId === rowCriterionId,
  );

  if (reciprocalComparison) {
    return {
      label: formatMatrixValue(reciprocalComparison.reciprocalValue),
      note: "Resiprokal",
    };
  }

  return {
    label: "-",
    note: "Belum tersedia",
  };
}

export function MatrixTable({
  criteria,
  comparisons,
  emptyMessage = "Matriks belum tersedia.",
}: MatrixTableProps) {
  if (criteria.length === 0 || comparisons.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-border bg-background px-4 py-8 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <div className="overflow-x-auto">
        <table className="min-w-[960px] w-full border-collapse bg-card text-sm">
          <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-normal text-muted-foreground">
            <tr>
              <th className="sticky left-0 z-10 min-w-56 border-r border-border bg-slate-50 px-4 py-3 text-left">
                Kriteria
              </th>
              {criteria.map((criterion) => (
                <th
                  className="min-w-40 px-4 py-3 text-center"
                  key={criterion.id}
                  scope="col"
                >
                  {criterion.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {criteria.map((rowCriterion) => (
              <tr className="hover:bg-slate-50" key={rowCriterion.id}>
                <th className="sticky left-0 z-10 border-r border-border bg-card px-4 py-4 text-left align-top font-medium text-foreground">
                  {rowCriterion.label}
                </th>
                {criteria.map((columnCriterion) => {
                  const matrixCell = getComparisonValue(
                    rowCriterion.id,
                    columnCriterion.id,
                    comparisons,
                  );

                  return (
                    <td
                      className="px-4 py-4 text-center align-top"
                      key={`${rowCriterion.id}-${columnCriterion.id}`}
                    >
                      <p className="font-semibold text-foreground">
                        {matrixCell.label}
                      </p>
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">
                        {matrixCell.note}
                      </p>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
