import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface RecommendationCardProps {
  title: string;
  recommendation: ReactNode;
  basis?: readonly string[];
  note?: ReactNode;
  className?: string;
}

export function RecommendationCard({
  title,
  recommendation,
  basis,
  note,
  className,
}: RecommendationCardProps) {
  return (
    <section
      className={cn(
        "rounded-lg border border-blue-100 bg-blue-50 p-5 shadow-sm",
        className,
      )}
    >
      <h3 className="text-base font-semibold text-blue-950">{title}</h3>
      <div className="mt-3 text-sm leading-6 text-blue-950">
        {recommendation}
      </div>

      {basis?.length ? (
        <ul className="mt-5 grid gap-3 md:grid-cols-2">
          {basis.map((item) => (
            <li
              className="rounded-md border border-blue-100 bg-white px-4 py-3 text-sm leading-6 text-slate-700"
              key={item}
            >
              {item}
            </li>
          ))}
        </ul>
      ) : null}

      {note ? (
        <div className="mt-5 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
          {note}
        </div>
      ) : null}
    </section>
  );
}
