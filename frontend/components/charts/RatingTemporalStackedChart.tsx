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

export interface RatingTemporalDatum {
  month: string;
  rating1: number;
  rating2: number;
  rating3: number;
  rating4: number;
  rating5: number;
  total: number;
}

interface RatingTemporalStackedChartProps {
  data: readonly RatingTemporalDatum[];
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

export function RatingTemporalStackedChart({
  data,
}: RatingTemporalStackedChartProps) {
  const mounted = useSyncExternalStore(
    subscribe,
    getClientSnapshot,
    getServerSnapshot,
  );

  if (data.length === 0) {
    return (
      <div className="flex h-72 items-center justify-center rounded-md border border-dashed border-border bg-background text-sm text-muted-foreground">
        Distribusi bulanan per rating belum tersedia.
      </div>
    );
  }

  if (!mounted) {
    return <div className="h-80 rounded-md bg-background" />;
  }

  return (
    <div aria-label="Grafik distribusi bulanan per rating" className="h-80" role="img">
      <ResponsiveContainer height="100%" width="100%">
        <BarChart data={data} margin={{ bottom: 8, left: 0, right: 8, top: 8 }}>
          <CartesianGrid stroke="#e2e8f0" vertical={false} />
          <XAxis axisLine={false} dataKey="month" tickLine={false} />
          <YAxis allowDecimals={false} axisLine={false} tickLine={false} />
          <Tooltip
            formatter={(value, name) => [
              typeof value === "number" ? value.toLocaleString("id-ID") : value,
              String(name).replace("rating", "Rating "),
            ]}
          />
          <Legend />
          <Bar dataKey="rating1" fill="#ef4444" name="Rating 1" stackId="rating" />
          <Bar dataKey="rating2" fill="#f97316" name="Rating 2" stackId="rating" />
          <Bar dataKey="rating3" fill="#64748b" name="Rating 3" stackId="rating" />
          <Bar dataKey="rating4" fill="#38bdf8" name="Rating 4" stackId="rating" />
          <Bar dataKey="rating5" fill="#22c55e" name="Rating 5" stackId="rating" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
