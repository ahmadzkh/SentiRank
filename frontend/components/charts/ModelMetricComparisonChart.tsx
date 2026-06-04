"use client";

import { useSyncExternalStore } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export interface ModelMetricComparisonDatum {
  metric: string;
  indobert: number;
  svm: number;
}

interface ModelMetricComparisonChartProps {
  data: readonly ModelMetricComparisonDatum[];
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

export function ModelMetricComparisonChart({
  data,
}: ModelMetricComparisonChartProps) {
  const mounted = useSyncExternalStore(
    subscribe,
    getClientSnapshot,
    getServerSnapshot,
  );

  if (data.length === 0) {
    return (
      <div className="flex h-72 items-center justify-center rounded-md border border-dashed border-border bg-background text-sm text-muted-foreground">
        Metrik model belum tersedia.
      </div>
    );
  }

  if (!mounted) {
    return <div className="h-80 rounded-md bg-background" />;
  }

  return (
    <div aria-label="Grafik perbandingan metrik model" className="h-80" role="img">
      <ResponsiveContainer height="100%" width="100%">
        <BarChart data={data} margin={{ bottom: 8, left: 0, right: 8, top: 8 }}>
          <CartesianGrid stroke="#e2e8f0" vertical={false} />
          <XAxis axisLine={false} dataKey="metric" tickLine={false} />
          <YAxis
            allowDecimals
            axisLine={false}
            domain={[0, 100]}
            tickFormatter={(value) => `${value}%`}
            tickLine={false}
          />
          <Tooltip
            formatter={(value) => [
              typeof value === "number" ? `${value.toFixed(2)}%` : value,
              "",
            ]}
          />
          <Legend />
          <Bar dataKey="indobert" fill="#2563eb" name="IndoBERT" radius={[5, 5, 0, 0]} />
          <Bar dataKey="svm" fill="#0f766e" name="SVM" radius={[5, 5, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
