"use client";

import { useSyncExternalStore } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
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

const EMPTY_CHART_MESSAGE = "Data distribusi belum tersedia.";

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
        {EMPTY_CHART_MESSAGE}
      </div>
    );
  }

  if (!mounted) {
    return <div className="h-80 rounded-md bg-background" />;
  }

  return (
    <div
      aria-label="Grafik distribusi sentimen"
      className="space-y-5"
      role="group"
    >
      <div className="h-80 min-h-80 min-w-[200px]">
        <ResponsiveContainer height="100%" minWidth={200} width="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ bottom: 8, left: 8, right: 16, top: 8 }}
          >
            <CartesianGrid horizontal={false} stroke="#e2e8f0" />
            <XAxis
              allowDecimals={false}
              axisLine={false}
              tickFormatter={(value) => COUNT_FORMATTER.format(Number(value))}
              tickLine={false}
              type="number"
            />
            <YAxis
              axisLine={false}
              dataKey="name"
              tickLine={false}
              type="category"
              width={72}
            />
            <Tooltip
              formatter={(value) => [
                COUNT_FORMATTER.format(Number(value)),
                "Jumlah",
              ]}
            />
            <Bar dataKey="count" name="Jumlah" radius={[0, 6, 6, 0]}>
              {data.map((item) => (
                <Cell fill={item.color} key={item.label} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {data.map((item) => (
          <div
            className="rounded-md border border-border bg-background px-3 py-2 text-center"
            key={item.label}
          >
            <p className="text-xs font-medium text-muted-foreground">
              {item.name}
            </p>
            <p className="text-sm font-semibold text-foreground">
              {COUNT_FORMATTER.format(item.count)} ({item.percentage}%)
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
