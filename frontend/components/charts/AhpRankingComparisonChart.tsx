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

export interface AhpRankingComparisonDatum {
  criterionId: string;
  label: string;
  shortLabel: string;
  ahpWeight: number;
  fuzzyAhpWeight: number;
}

interface AhpRankingComparisonChartProps {
  data: readonly AhpRankingComparisonDatum[];
}

const SCORE_FORMATTER = new Intl.NumberFormat("id-ID", {
  maximumFractionDigits: 4,
});

function subscribe() {
  return () => {};
}

function getClientSnapshot() {
  return true;
}

function getServerSnapshot() {
  return false;
}

export function AhpRankingComparisonChart({
  data,
}: AhpRankingComparisonChartProps) {
  const mounted = useSyncExternalStore(
    subscribe,
    getClientSnapshot,
    getServerSnapshot,
  );

  if (data.length === 0) {
    return (
      <div className="flex h-80 items-center justify-center rounded-md border border-dashed border-border bg-background text-sm text-muted-foreground">
        Data belum tersedia
      </div>
    );
  }

  if (!mounted) {
    return <div className="h-80 rounded-md bg-background" />;
  }

  return (
    <div aria-label="Grafik perbandingan AHP dan Fuzzy AHP" className="h-80" role="img">
      <ResponsiveContainer height="100%" width="100%">
        <BarChart data={data} margin={{ bottom: 8, left: 0, right: 12, top: 8 }}>
          <CartesianGrid vertical={false} stroke="#e2e8f0" />
          <XAxis axisLine={false} dataKey="shortLabel" tickLine={false} />
          <YAxis
            axisLine={false}
            tickFormatter={(value) => SCORE_FORMATTER.format(Number(value))}
            tickLine={false}
          />
          <Tooltip
            formatter={(value) => [SCORE_FORMATTER.format(Number(value)), "Skor"]}
          />
          <Legend />
          <Bar dataKey="ahpWeight" fill="#2563eb" name="AHP" radius={[6, 6, 0, 0]} />
          <Bar
            dataKey="fuzzyAhpWeight"
            fill="#0f766e"
            name="Fuzzy AHP"
            radius={[6, 6, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
