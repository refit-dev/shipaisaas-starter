"use client";

import * as React from "react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const chartConfig = {
  tokens: { label: "Tokens" },
  inputTokens: { label: "Input Tokens", color: "var(--chart-1)" },
  outputTokens: { label: "Output Tokens", color: "var(--chart-2)" },
} satisfies ChartConfig;

export function UsageChart({ dailyData }: { dailyData: any[] }) {
  const [activeChart, setActiveChart] =
    React.useState<keyof typeof chartConfig>("inputTokens");

  const total = React.useMemo(
    () => ({
      inputTokens: dailyData.reduce((acc, curr) => acc + curr.inputTokens, 0),
      outputTokens: dailyData.reduce((acc, curr) => acc + curr.outputTokens, 0),
    }),
    [dailyData],
  );

  return (
    <Card>
      <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
          <CardTitle>Daily Token Usage</CardTitle>
          <CardDescription>
            Showing token consumption across all days
          </CardDescription>
        </div>
        <div className="flex">
          {["inputTokens", "outputTokens"].map((key) => {
            const chart = key as keyof typeof chartConfig;
            return (
              <button
                key={chart}
                data-active={activeChart === chart}
                className="data-[active=true]:bg-muted/50 relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l sm:border-t-0 sm:border-l sm:px-8 sm:py-6"
                onClick={() => setActiveChart(chart)}
              >
                <span className="text-muted-foreground text-xs">
                  {chartConfig[chart].label}
                </span>
                <span className="text-lg leading-none font-bold sm:text-3xl">
                  {total[key as keyof typeof total].toLocaleString()}
                </span>
              </button>
            );
          })}
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <BarChart
            accessibilityLayer
            data={dailyData}
            margin={{ left: 12, right: 12 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                return new Date(value).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
              }}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-[150px]"
                  nameKey="tokens"
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    });
                  }}
                />
              }
            />

            {/* 👇 THE FIX: Added background to create the two-color fill effect */}
            <Bar
              dataKey={activeChart}
              fill={`var(--color-${activeChart})`}
              radius={[4, 4, 0, 0]}
              background={{ fill: "var(--muted)" }}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
