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

export interface RatingDistributionDatum {
  rating: number;
  count: number;
  percentage?: number;
}

interface RatingDistributionChartProps {
  data: readonly RatingDistributionDatum[];
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

export function RatingDistributionChart({
  data,
}: RatingDistributionChartProps) {
  const mounted = useSyncExternalStore(
    subscribe,
    getClientSnapshot,
    getServerSnapshot,
  );

  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-md border border-dashed border-border bg-background text-sm text-muted-foreground">
        Distribusi rating belum tersedia.
      </div>
    );
  }

  if (!mounted) {
    return <div className="h-72 rounded-md bg-background" />;
  }

  const chartData = data.map((item) => ({
    ...item,
    label: `${item.rating} bintang`,
  }));

  return (
    <div aria-label="Grafik distribusi rating" className="h-72" role="img">
      <ResponsiveContainer height="100%" width="100%">
        <BarChart data={chartData} margin={{ bottom: 8, left: 0, right: 8, top: 8 }}>
          <CartesianGrid stroke="#e2e8f0" vertical={false} />
          <XAxis axisLine={false} dataKey="label" tickLine={false} />
          <YAxis allowDecimals={false} axisLine={false} tickLine={false} />
          <Tooltip
            formatter={(value, name) => [
              typeof value === "number" ? value.toLocaleString("id-ID") : value,
              name === "count" ? "Jumlah" : name,
            ]}
          />
          <Bar dataKey="count" fill="#2563eb" name="Jumlah" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
