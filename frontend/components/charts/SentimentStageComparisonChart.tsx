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

export interface SentimentStageComparisonDatum {
  stage: string;
  positive: number;
  neutral: number;
  negative: number;
}

interface SentimentStageComparisonChartProps {
  data: readonly SentimentStageComparisonDatum[];
}

const EMPTY_CHART_MESSAGE =
  "Data belum tersedia karena API Gateway belum aktif.";
const COUNT_FORMATTER = new Intl.NumberFormat("id-ID");

function subscribe() {
  return () => {};
}

function getClientSnapshot() {
  return true;
}

function getServerSnapshot() {
  return false;
}

export function SentimentStageComparisonChart({
  data,
}: SentimentStageComparisonChartProps) {
  const mounted = useSyncExternalStore(
    subscribe,
    getClientSnapshot,
    getServerSnapshot,
  );

  if (data.length === 0) {
    return (
      <div className="flex h-80 items-center justify-center rounded-md border border-dashed border-border bg-background text-sm text-muted-foreground">
        {EMPTY_CHART_MESSAGE}
      </div>
    );
  }

  if (!mounted) {
    return <div className="h-80 rounded-md bg-background" />;
  }

  return (
    <div aria-label="Grafik distribusi sentimen per tahap" className="h-80 min-w-[200px]" role="img">
      <ResponsiveContainer height="100%" minWidth={200} width="100%">
        <BarChart data={data} margin={{ bottom: 8, left: 0, right: 12, top: 8 }}>
          <CartesianGrid vertical={false} stroke="#e2e8f0" />
          <XAxis axisLine={false} dataKey="stage" tickLine={false} />
          <YAxis
            allowDecimals={false}
            axisLine={false}
            tickFormatter={(value) => COUNT_FORMATTER.format(Number(value))}
            tickLine={false}
          />
          <Tooltip formatter={(value) => [COUNT_FORMATTER.format(Number(value)), "Jumlah"]} />
          <Legend />
          <Bar dataKey="positive" fill="#16a34a" name="Positif" radius={[6, 6, 0, 0]} />
          <Bar dataKey="neutral" fill="#64748b" name="Netral" radius={[6, 6, 0, 0]} />
          <Bar dataKey="negative" fill="#dc2626" name="Negatif" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
