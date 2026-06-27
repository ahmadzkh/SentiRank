import { cn } from "@/lib/utils";

interface ModelMetricCardProps {
  label: string;
  value: string;
  modelName?: string;
  description?: string;
  className?: string;
}

export function ModelMetricCard({
  label,
  value,
  description,
  className,
}: ModelMetricCardProps) {
  return (
    <section
      className={cn(
        "rounded-lg border border-border bg-card p-5 shadow-sm",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="mt-3 text-2xl font-semibold tracking-normal text-foreground">
            {value}
          </p>
        </div>
      </div>
      {description ? (
        <p className="mt-3 text-sm leading-5 text-muted-foreground">
          {description}
        </p>
      ) : null}
    </section>
  );
}
