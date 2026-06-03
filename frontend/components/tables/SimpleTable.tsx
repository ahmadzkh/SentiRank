import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface SimpleTableColumn<TData> {
  key: string;
  header: string;
  align?: "left" | "center" | "right";
  className?: string;
  render: (row: TData) => ReactNode;
}

interface SimpleTableProps<TData> {
  columns: readonly SimpleTableColumn<TData>[];
  data: readonly TData[];
  rowKey: (row: TData, index: number) => string;
  emptyMessage?: string;
  minWidthClassName?: string;
}

const alignClassName: Record<
  NonNullable<SimpleTableColumn<unknown>["align"]>,
  string
> = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

export function SimpleTable<TData>({
  columns,
  data,
  rowKey,
  emptyMessage = "Data belum tersedia.",
  minWidthClassName = "min-w-[720px]",
}: SimpleTableProps<TData>) {
  if (data.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-border bg-background px-4 py-8 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <div className="overflow-x-auto">
        <table
          className={cn(
            "w-full border-collapse bg-card text-left text-sm",
            minWidthClassName,
          )}
        >
          <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-normal text-muted-foreground">
            <tr>
              {columns.map((column) => (
                <th
                  className={cn(
                    "px-4 py-3",
                    alignClassName[column.align ?? "left"],
                    column.className,
                  )}
                  key={column.key}
                  scope="col"
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data.map((row, index) => (
              <tr className="align-top hover:bg-slate-50" key={rowKey(row, index)}>
                {columns.map((column) => (
                  <td
                    className={cn(
                      "px-4 py-4",
                      alignClassName[column.align ?? "left"],
                      column.className,
                    )}
                    key={column.key}
                  >
                    {column.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
