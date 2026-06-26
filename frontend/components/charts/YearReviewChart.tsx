"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export interface YearReviewDatum {
  year: number;
  [sentiment: string]: number;
}

const SENTIMENT_CONFIG: Record<string, { label: string; color: string }> = {
  Negatif: { label: "Negatif", color: "#ef4444" },
  Netral: { label: "Netral", color: "#f59e0b" },
  Positif: { label: "Positif", color: "#22c55e" },
};

const SENTIMENT_KEYS = ["Negatif", "Netral", "Positif"];

interface YearReviewChartProps {
  data: YearReviewDatum[];
}

export function YearReviewChart({ data }: YearReviewChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex min-h-[200px] items-center justify-center rounded-lg border border-dashed px-4 text-center text-sm text-muted-foreground">
        Grafik sebaran tahunan akan tersedia setelah dataset dimuat.
      </div>
    );
  }

  return (
    <div className="min-w-[200px]">
      <ResponsiveContainer width="100%" height={280} minWidth={200}>
      <LineChart
        data={data}
        margin={{ top: 8, right: 8, left: -8, bottom: 4 }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="year"
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => String(v)}
          fontSize={12}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          fontSize={12}
          tickFormatter={(v) => Number(v).toLocaleString("id-ID")}
        />
        <Tooltip
          labelFormatter={(label) => `Tahun ${String(label)}`}
          formatter={(value, name) => {
            const v = Number(value) || 0;
            return [
              v.toLocaleString("id-ID"),
              SENTIMENT_CONFIG[String(name)]?.label ?? String(name),
            ];
          }}
        />
        <Legend
          wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
          iconType="circle"
        />
        {SENTIMENT_KEYS.map((key) => (
          <Line
            key={key}
            type="monotone"
            dataKey={key}
            stroke={SENTIMENT_CONFIG[key].color}
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
            name={key}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
    </div>
  );
}
