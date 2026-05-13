"use client";

import type { ReactElement } from "react";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface SentimentDataPoint {
  readonly label: string;
  readonly value: number;
  readonly color: string;
}

const sentimentDistributionData: readonly SentimentDataPoint[] = [
  { label: "Positive", value: 54, color: "hsl(var(--chart-1))" },
  { label: "Neutral", value: 28, color: "hsl(var(--chart-3))" },
  { label: "Negative", value: 18, color: "hsl(var(--chart-5))" },
];

function SentimentDistributionChart(): ReactElement {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sentiment Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-72 w-full">
          <ResponsiveContainer height="100%" width="100%">
            <PieChart>
              <Pie
                cx="50%"
                cy="50%"
                data={sentimentDistributionData}
                dataKey="value"
                innerRadius={56}
                nameKey="label"
                outerRadius={88}
                paddingAngle={2}
              >
                {sentimentDistributionData.map((item) => (
                  <Cell fill={item.color} key={item.label} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export { SentimentDistributionChart };
