import type { AhpCriterion } from "@/types/ahp";

interface CriteriaEditorProps {
  criteria: readonly AhpCriterion[];
  emptyMessage?: string;
}

function formatSource(source: AhpCriterion["source"]) {
  const sourceLabels: Record<AhpCriterion["source"], string> = {
    aspect_classification: "Klasifikasi aspek",
    manual_research_input: "Input manual penelitian",
    expert_judgement: "Expert judgement",
  };

  return sourceLabels[source];
}

export function CriteriaEditor({
  criteria,
  emptyMessage = "Kriteria belum tersedia.",
}: CriteriaEditorProps) {
  if (criteria.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-border bg-background px-4 py-8 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {criteria.map((criterion) => (
        <div
          className="rounded-md border border-border bg-background px-4 py-3"
          key={criterion.id}
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">
                {criterion.label}
              </p>
              <p className="mt-1 text-sm leading-5 text-muted-foreground">
                {criterion.description}
              </p>
            </div>
            <span className="w-fit rounded-md border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
              {criterion.isActive ? "Aktif" : "Nonaktif"}
            </span>
          </div>

          <dl className="mt-3 grid gap-2 text-xs text-muted-foreground sm:grid-cols-3">
            <div>
              <dt className="font-medium text-slate-600">Sumber</dt>
              <dd>{formatSource(criterion.source)}</dd>
            </div>
            <div>
              <dt className="font-medium text-slate-600">Bukti</dt>
              <dd>{criterion.evidenceCount} sinyal</dd>
            </div>
            <div>
              <dt className="font-medium text-slate-600">Ulasan negatif</dt>
              <dd>{criterion.negativeReviewCount} ulasan</dd>
            </div>
          </dl>
        </div>
      ))}
    </div>
  );
}
