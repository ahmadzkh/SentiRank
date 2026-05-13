"use client";

import type { ReactElement } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface RankingDataPoint {
  readonly criterion: string;
  readonly priorityScore: number;
}

const rankingData: readonly RankingDataPoint[] = [
  { criterion: "Performance", priorityScore: 0.34 },
  { criterion: "Stability", priorityScore: 0.27 },
  { criterion: "Features", priorityScore: 0.21 },
  { criterion: "UI/UX", priorityScore: 0.12 },
  { criterion: "Customer Service", priorityScore: 0.06 },
];

function RankingBarChart(): ReactElement {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Priority Ranking</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-72 w-full">
          <ResponsiveContainer height="100%" width="100%">
            <BarChart data={rankingData} layout="vertical">
              <CartesianGrid horizontal={false} strokeDasharray="3 3" />
              <XAxis domain={[0, 0.4]} tickLine={false} type="number" />
              <YAxis
                dataKey="criterion"
                tickLine={false}
                type="category"
                width={120}
              />
              <Tooltip />
              <Bar
                dataKey="priorityScore"
                fill="hsl(var(--chart-1))"
                name="Priority Score"
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export { RankingBarChart };
