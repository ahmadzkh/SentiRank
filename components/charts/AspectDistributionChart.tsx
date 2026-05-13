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

interface AspectDataPoint {
  readonly aspect: string;
  readonly count: number;
}

const aspectDistributionData: readonly AspectDataPoint[] = [
  { aspect: "UI/UX", count: 42 },
  { aspect: "Performance", count: 31 },
  { aspect: "Features", count: 27 },
  { aspect: "Stability", count: 19 },
  { aspect: "Customer Service", count: 13 },
];

function AspectDistributionChart(): ReactElement {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Aspect Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-72 w-full">
          <ResponsiveContainer height="100%" width="100%">
            <BarChart data={aspectDistributionData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="aspect" tickLine={false} />
              <YAxis allowDecimals={false} tickLine={false} />
              <Tooltip />
              <Bar
                dataKey="count"
                fill="hsl(var(--chart-2))"
                name="Reviews"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export { AspectDistributionChart };
