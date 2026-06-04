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

export interface TextLengthHistogramDatum {
  range: string;
  count: number;
}

interface TextLengthHistogramChartProps {
  data: readonly TextLengthHistogramDatum[];
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

export function TextLengthHistogramChart({
  data,
}: TextLengthHistogramChartProps) {
  const mounted = useSyncExternalStore(
    subscribe,
    getClientSnapshot,
    getServerSnapshot,
  );

  if (data.length === 0) {
    return (
      <div className="flex h-72 items-center justify-center rounded-md border border-dashed border-border bg-background text-sm text-muted-foreground">
        Histogram panjang teks belum tersedia.
      </div>
    );
  }

  if (!mounted) {
    return <div className="h-80 rounded-md bg-background" />;
  }

  return (
    <div aria-label="Histogram panjang teks ulasan" className="h-80" role="img">
      <ResponsiveContainer height="100%" width="100%">
        <BarChart data={data} margin={{ bottom: 8, left: 0, right: 8, top: 8 }}>
          <CartesianGrid stroke="#e2e8f0" vertical={false} />
          <XAxis
            axisLine={false}
            dataKey="range"
            interval={4}
            tickLine={false}
          />
          <YAxis allowDecimals={false} axisLine={false} tickLine={false} />
          <Tooltip
            formatter={(value) => [
              typeof value === "number" ? value.toLocaleString("id-ID") : value,
              "Jumlah ulasan",
            ]}
            labelFormatter={(label) => `Rentang ${label} karakter`}
          />
          <Bar dataKey="count" fill="#2563eb" name="Jumlah ulasan" radius={[5, 5, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
