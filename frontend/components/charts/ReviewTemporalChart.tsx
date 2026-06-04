"use client";

import { useSyncExternalStore } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export interface ReviewTemporalDatum {
  year: string;
  total: number;
}

interface ReviewTemporalChartProps {
  data: readonly ReviewTemporalDatum[];
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

export function ReviewTemporalChart({ data }: ReviewTemporalChartProps) {
  const mounted = useSyncExternalStore(
    subscribe,
    getClientSnapshot,
    getServerSnapshot,
  );

  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-md border border-dashed border-border bg-background text-sm text-muted-foreground">
        Distribusi temporal belum tersedia.
      </div>
    );
  }

  if (!mounted) {
    return <div className="h-72 rounded-md bg-background" />;
  }

  return (
    <div aria-label="Grafik ulasan per tahun" className="h-72" role="img">
      <ResponsiveContainer height="100%" width="100%">
        <LineChart data={data} margin={{ bottom: 8, left: 0, right: 12, top: 8 }}>
          <CartesianGrid stroke="#e2e8f0" vertical={false} />
          <XAxis axisLine={false} dataKey="year" tickLine={false} />
          <YAxis allowDecimals={false} axisLine={false} tickLine={false} />
          <Tooltip
            formatter={(value) => [
              typeof value === "number" ? value.toLocaleString("id-ID") : value,
              "Jumlah ulasan",
            ]}
            labelFormatter={(label) => `Tahun ${label}`}
          />
          <Line
            activeDot={{ r: 5 }}
            dataKey="total"
            dot={{ r: 3 }}
            name="Jumlah ulasan"
            stroke="#2563eb"
            strokeWidth={2}
            type="monotone"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
