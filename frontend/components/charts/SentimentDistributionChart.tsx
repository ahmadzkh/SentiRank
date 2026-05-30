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
        No sentiment data available.
      </div>
    );
  }

  if (!mounted) {
    return <div className="h-64 rounded-md bg-background" />;
  }

  return (
    <div
      aria-label="Sentiment distribution chart"
      className="h-64"
      role="img"
    >
      <ResponsiveContainer height="100%" width="100%">
        <PieChart>
          <Pie
            cx="50%"
            cy="50%"
            data={data}
            dataKey="count"
            innerRadius={58}
            nameKey="name"
            outerRadius={86}
            paddingAngle={3}
          >
            {data.map((item) => (
              <Cell fill={item.color} key={item.label} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
      <div className="mt-2 grid grid-cols-3 gap-2">
        {data.map((item) => (
          <div className="text-center" key={item.label}>
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
