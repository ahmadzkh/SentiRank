"use client";

import { useSyncExternalStore } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { AspectLabel } from "@/types/aspect";

export interface AspectRankingDatum {
  aspect: AspectLabel;
  label: string;
  count: number;
}

interface AspectRankingChartProps {
  data: readonly AspectRankingDatum[];
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

export function AspectRankingChart({ data }: AspectRankingChartProps) {
  const mounted = useSyncExternalStore(
    subscribe,
    getClientSnapshot,
    getServerSnapshot,
  );

  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-md border border-dashed border-border bg-background text-sm text-muted-foreground">
        No negative aspect data available.
      </div>
    );
  }

  if (!mounted) {
    return <div className="h-72 rounded-md bg-background" />;
  }

  return (
    <div aria-label="Negative aspect ranking chart" className="h-72" role="img">
      <ResponsiveContainer height="100%" width="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ bottom: 8, left: 12, right: 16, top: 8 }}
        >
          <CartesianGrid horizontal={false} stroke="#e2e8f0" />
          <XAxis
            allowDecimals={false}
            axisLine={false}
            tickLine={false}
            type="number"
          />
          <YAxis
            axisLine={false}
            dataKey="label"
            tickLine={false}
            type="category"
            width={132}
          />
          <Tooltip />
          <Bar dataKey="count" fill="#2563eb" radius={[0, 6, 6, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
