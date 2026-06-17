import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface SimpleTableColumn<TData> {
  key: string;
  header: string;
  align?: "left" | "center" | "right";
  className?: string;
  render: (row: TData, index: number) => ReactNode;
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
  emptyMessage = "Data belum tersedia karena API Gateway belum aktif.",
  minWidthClassName = "min-w-[720px]",
}: SimpleTableProps<TData>) {
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
            {data.length === 0 ? (
              <tr>
                <td
                  className="bg-background px-4 py-8 text-center text-sm text-muted-foreground"
                  colSpan={columns.length}
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, index) => (
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
                      {column.render(row, index)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
