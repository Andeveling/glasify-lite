"use client";

/**
 * Top Models Chart Component
 * Displays top 5 most quoted models as a horizontal bar chart
 * with supplier labels and percentage tooltips
 */

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
} from "@/components/ui/chart";
import { formatPercent } from "@/lib/format";
import type { TopModel } from "@/types/dashboard";
import { EmptyDashboardState } from "./empty-dashboard-state";

const PERCENTAGE_MULTIPLIER = 100;
const MAX_LABEL_LENGTH = 35;
const BORDER_RADIUS_VALUE = 4;
const BAR_RADIUS_RIGHT: [number, number, number, number] = [
  0,
  BORDER_RADIUS_VALUE,
  BORDER_RADIUS_VALUE,
  0,
];

const chartConfig = {
  count: {
    color: "var(--chart-1)",
    label: "Cotizaciones",
  },
} satisfies ChartConfig;

interface TopModelsChartProps {
  data: TopModel[];
  tenantConfig?: { locale?: string } | null;
}

export function TopModelsChart({ data, tenantConfig }: TopModelsChartProps) {
  // Empty state check
  if (!data || data.length === 0) {
    return (
      <EmptyDashboardState
        description="No hay cotizaciones en este período para mostrar modelos populares"
        title="Sin datos de modelos"
      />
    );
  }

  // Transform data for recharts
  const chartData = data.map((item) => ({
    count: item.count,
    name: `${item.modelName} ${item.supplierName ? `(${item.supplierName})` : ""}`,
    percentage: item.percentage * PERCENTAGE_MULTIPLIER,
  }));

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Modelos Más Cotizados</CardTitle>
        <CardDescription>
          Top 5 modelos por cantidad de cotizaciones
        </CardDescription>
      </CardHeader>
      <CardContent className="pl-0">
        <ChartContainer
          className="aspect-auto h-80 w-full"
          config={chartConfig}
        >
          <BarChart
            accessibilityLayer
            data={chartData}
            layout="vertical"
            margin={{
              bottom: 8,
              left: 12,
              right: 24,
              top: 8,
            }}
          >
            <CartesianGrid horizontal={false} vertical={false} />
            <XAxis allowDecimals={false} type="number" />
            <YAxis
              dataKey="name"
              fontSize={11}
              tickFormatter={(value) =>
                value.length > MAX_LABEL_LENGTH
                  ? `${value.substring(0, MAX_LABEL_LENGTH)}...`
                  : value
              }
              type="category"
              width={180}
            />
            <ChartTooltip
              content={({ active, payload }) => {
                if (!(active && payload) || payload.length === 0) return null;

                const tooltipData = payload[0]?.payload;
                if (!tooltipData) return null;

                return (
                  <div className="rounded-lg border bg-background p-3 shadow-md">
                    <p className="font-semibold text-sm">{tooltipData.name}</p>
                    <p className="mt-1 font-medium text-primary text-sm">
                      {tooltipData.count} cotizaciones (
                      {formatPercent(
                        tooltipData.percentage / PERCENTAGE_MULTIPLIER,
                        { context: tenantConfig }
                      )}
                      )
                    </p>
                  </div>
                );
              }}
            />
            <Bar
              dataKey="count"
              fill="var(--color-count)"
              radius={BAR_RADIUS_RIGHT}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
