"use client";

/**
 * Supplier Distribution Chart Component
 * Displays quote distribution by profile supplier as a pie chart
 * with supplier names and percentage legend
 */

import { TrendingUp } from "lucide-react";
import { Cell, Legend, Pie, PieChart } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
} from "@/components/ui/chart";
import { formatNumber, formatPercent } from "@/lib/format";
import type { SupplierDistribution } from "@/types/dashboard";
import { EmptyDashboardState } from "./empty-dashboard-state";

const PERCENTAGE_MULTIPLIER = 100;

// Color palette for pie chart slices
const COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

const chartConfig = {
  count: {
    label: "Cotizaciones",
  },
  supplierId1: {
    color: "var(--chart-1)",
    label: "Proveedor 1",
  },
  supplierId2: {
    color: "var(--chart-2)",
    label: "Proveedor 2",
  },
  supplierId3: {
    color: "var(--chart-3)",
    label: "Proveedor 3",
  },
  supplierId4: {
    color: "var(--chart-4)",
    label: "Proveedor 4",
  },
  supplierId5: {
    color: "var(--chart-5)",
    label: "Proveedor 5",
  },
} satisfies ChartConfig;

type SupplierDistributionChartProps = {
  data: SupplierDistribution[];
  tenantConfig?: { locale?: string } | null;
};

export function SupplierDistributionChart({
  data,
  tenantConfig,
}: SupplierDistributionChartProps) {
  // Empty state check
  if (!data || data.length === 0) {
    return (
      <EmptyDashboardState
        description="No hay cotizaciones en este período para mostrar distribución de fabricantes"
        title="Sin datos de fabricantes"
      />
    );
  }

  // Transform data for recharts
  const chartData = data.map((item) => ({
    count: item.count,
    name: item.supplierName,
    percentage: item.percentage * PERCENTAGE_MULTIPLIER,
  }));

  const totalQuotes = chartData.reduce((acc, curr) => acc + curr.count, 0);

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Distribución por Fabricante</CardTitle>
        <CardDescription>Cotizaciones por fabricante/proveedor</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          className="mx-auto aspect-square max-h-80 pb-0 [&_.recharts-pie-label-text]:fill-foreground"
          config={chartConfig}
        >
          <PieChart>
            <ChartTooltip
              content={({ active, payload }) => {
                if (!(active && payload) || payload.length === 0) {
                  return null;
                }

                const tooltipData = payload[0]?.payload;
                if (!tooltipData) {
                  return null;
                }

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
            <Pie
              data={chartData}
              dataKey="count"
              label
              labelLine={false}
              nameKey="name"
              outerRadius={120}
            >
              {chartData.map((item) => (
                <Cell
                  fill={COLORS[chartData.indexOf(item) % COLORS.length]}
                  key={`cell-${item.name}`}
                />
              ))}
            </Pie>
            <Legend
              formatter={(value) => {
                const item = chartData.find((d) => d.name === value);
                return (
                  <span className="text-xs">
                    {value} -{" "}
                    {item
                      ? formatPercent(item.percentage / PERCENTAGE_MULTIPLIER, {
                          context: tenantConfig,
                        })
                      : ""}
                  </span>
                );
              }}
              height={60}
              iconSize={12}
              iconType="circle"
              verticalAlign="bottom"
              wrapperStyle={{ fontSize: "12px" }}
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 font-medium leading-none">
          Total de {formatNumber(totalQuotes)} cotizaciones{" "}
          <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground leading-none">
          Distribución de cotizaciones por proveedor
        </div>
      </CardFooter>
    </Card>
  );
}
