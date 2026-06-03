"use client";

import { useSyncExternalStore } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { ReviewSentimentLabel } from "@/types/sentiment";

export interface SentimentDistributionDatum {
  label: ReviewSentimentLabel;
  name: string;
  count: number;
  percentage: number;
  color: string;
}

interface SentimentDistributionChartProps {
  data: readonly SentimentDistributionDatum[];
}

function subscribe() {
  return () => {};
}

function getClientSnapshot() {
  return true;
}

function getServerSnapshot() {
  return false;
}

export function SentimentDistributionChart({
  data,
}: SentimentDistributionChartProps) {
  const mounted = useSyncExternalStore(
    subscribe,
    getClientSnapshot,
    getServerSnapshot,
  );

  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-md border border-dashed border-border bg-background text-sm text-muted-foreground">
        Data sentimen belum tersedia.
      </div>
    );
  }

  if (!mounted) {
    return <div className="h-96 rounded-md bg-background" />;
  }

  return (
    <div
      aria-label="Grafik distribusi sentimen"
      className="space-y-5"
      role="group"
    >
      <div className="h-72 min-h-72">
        <ResponsiveContainer height="100%" width="100%">
          <PieChart>
            <Pie
              cx="50%"
              cy="50%"
              data={data}
              dataKey="count"
              innerRadius={58}
              nameKey="name"
              outerRadius={92}
              paddingAngle={3}
            >
              {data.map((item) => (
                <Cell fill={item.color} key={item.label} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => [value, "Jumlah"]} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {data.map((item) => (
          <div
            className="rounded-md border border-border bg-background px-3 py-2 text-center"
            key={item.label}
          >
            <p className="text-xs font-medium text-muted-foreground">
              {item.name}
            </p>
            <p className="text-sm font-semibold text-foreground">
              {item.count} ({item.percentage}%)
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
