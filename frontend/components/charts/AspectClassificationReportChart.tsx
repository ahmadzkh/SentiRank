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

export interface AspectClassificationReportDatum {
  label: string;
  precision: number;
  recall: number;
  f1Score: number;
  support: number;
}

interface AspectClassificationReportChartProps {
  data: readonly AspectClassificationReportDatum[];
}

const EMPTY_CHART_MESSAGE = "Classification report belum tersedia.";

const PERCENT_FORMATTER = new Intl.NumberFormat("id-ID", {
  maximumFractionDigits: 1,
  minimumFractionDigits: 0,
});
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

export function AspectClassificationReportChart({
  data,
}: AspectClassificationReportChartProps) {
  const mounted = useSyncExternalStore(
    subscribe,
    getClientSnapshot,
    getServerSnapshot,
  );

  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-md border border-dashed border-border bg-background text-sm text-muted-foreground">
        {EMPTY_CHART_MESSAGE}
      </div>
    );
  }

  if (!mounted) {
    return <div className="h-80 rounded-md bg-background" />;
  }

  return (
    <div
      aria-label="Grafik classification report SVM"
      className="h-96 min-w-[200px]"
      role="img"
    >
      <ResponsiveContainer height="100%" minWidth={200} width="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ bottom: 0, left: 16, right: 16, top: 0 }}
        >
          <CartesianGrid horizontal={false} stroke="#e2e8f0" />
          <XAxis
            axisLine={false}
            domain={[0, 100]}
            tickFormatter={(value) =>
              `${PERCENT_FORMATTER.format(Number(value))}%`
            }
            tickLine={false}
            type="number"
          />
          <YAxis
            axisLine={false}
            dataKey="label"
            tickLine={false}
            type="category"
            width={150}
          />
          <Tooltip
            formatter={(value, name) => [
              `${PERCENT_FORMATTER.format(Number(value))}%`,
              name,
            ]}
            labelFormatter={(label) => {
              const datum = data.find((item) => item.label === label);
              return datum
                ? `${label} — support ${COUNT_FORMATTER.format(datum.support)}`
                : String(label);
            }}
          />
          <Legend />
          <Bar
            dataKey="precision"
            fill="#2563eb"
            name="Precision"
            radius={[0, 4, 4, 0]}
          />
          <Bar
            dataKey="recall"
            fill="#f59e0b"
            name="Recall"
            radius={[0, 4, 4, 0]}
          />
          <Bar
            dataKey="f1Score"
            fill="#16a34a"
            name="F1-score"
            radius={[0, 4, 4, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
