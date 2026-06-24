"use client";

import { useSyncExternalStore } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export interface RatingDistributionDatum {
  rating: string;
  count: number;
  share: number;
}

interface RatingBarChartProps {
  data: readonly RatingDistributionDatum[];
  description?: string;
}

const RATING_COLORS: Record<string, string> = {
  "1": "#ef4444",
  "2": "#f97316",
  "3": "#eab308",
  "4": "#22c55e",
  "5": "#16a34a",
};

const EMPTY_CHART_MESSAGE =
  "Data belum tersedia karena API Gateway belum aktif.";

function subscribe() {
  return () => {};
}

function getClientSnapshot() {
  return true;
}

function getServerSnapshot() {
  return false;
}

export function RatingBarChart({ data, description }: RatingBarChartProps) {
  const mounted = useSyncExternalStore(
    subscribe,
    getClientSnapshot,
    getServerSnapshot,
  );

  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-md border border-dashed border-border bg-background text-sm text-muted-foreground">
        {EMPTY_CHART_MESSAGE}
      </div>
    );
  }

  if (!mounted) {
    return <div className="h-80 rounded-md bg-background" />;
  }

  return (
    <div aria-label="Grafik distribusi rating" role="group">
      <div className="h-72 min-h-72">
        <ResponsiveContainer height="100%" width="100%">
          <BarChart
            data={[...data]}
            margin={{ bottom: 4, left: 4, right: 12, top: 8 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              axisLine={{ stroke: "#e2e8f0" }}
              dataKey="rating"
              tick={{ fill: "#64748b", fontSize: 13 }}
              tickFormatter={(v) => `${v}/5`}
              tickLine={false}
            />
            <YAxis
              axisLine={false}
              tick={{ fill: "#64748b", fontSize: 12 }}
              tickLine={false}
              width={48}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #e2e8f0",
                borderRadius: "6px",
                fontSize: "13px",
              }}
              formatter={(value, _name, props) => {
                const v = Number(value) || 0;
                const entry = (
                  props?.payload as
                    | RatingDistributionDatum
                    | undefined
                );
                const share = entry?.share ?? 0;
                return [
                  `${v.toLocaleString("id-ID")} (${share}%)`,
                  "Jumlah",
                ];
              }}
              labelFormatter={(label) => `Rating ${String(label)}/5`}
            />
            <Bar
              dataKey="count"
              maxBarSize={64}
              radius={[4, 4, 0, 0]}
            >
              {[...data].map((entry) => (
                <Cell
                  fill={RATING_COLORS[entry.rating] ?? "#64748b"}
                  key={entry.rating}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      {description ? (
        <p className="mt-3 text-xs leading-5 text-muted-foreground">
          {description}
        </p>
      ) : null}
    </div>
  );
}
