"use client";

/**
 * Glass Types Chart Component
 * Displays top 5 glass types as a pie chart
 * with codes, manufacturers, and percentage legend
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
import type { TopGlassType } from "@/types/dashboard";
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
		label: "Uso",
	},
	glassTypeId1: {
		color: "var(--chart-1)",
		label: "Vidrio 1",
	},
	glassTypeId2: {
		color: "var(--chart-2)",
		label: "Vidrio 2",
	},
	glassTypeId3: {
		color: "var(--chart-3)",
		label: "Vidrio 3",
	},
	glassTypeId4: {
		color: "var(--chart-4)",
		label: "Vidrio 4",
	},
	glassTypeId5: {
		color: "var(--chart-5)",
		label: "Vidrio 5",
	},
} satisfies ChartConfig;

type GlassTypesChartProps = {
	data: TopGlassType[];
	tenantConfig?: { locale?: string } | null;
};

export function GlassTypesChart({ data, tenantConfig }: GlassTypesChartProps) {
	// Empty state check
	if (!data || data.length === 0) {
		return (
			<EmptyDashboardState
				description="No hay cotizaciones en este período para mostrar tipos de vidrio populares"
				title="Sin datos de tipos de vidrio"
			/>
		);
	}

	// Transform data for recharts
	const chartData = data.map((item) => ({
		count: item.count,
		manufacturer: item.manufacturer ?? "Sin fabricante",
		name: `${item.glassTypeName} (${item.glassTypeCode})`,
		percentage: item.percentage * PERCENTAGE_MULTIPLIER,
	}));

	const totalUses = chartData.reduce((acc, curr) => acc + curr.count, 0);

	return (
		<Card className="flex flex-col">
			<CardHeader className="items-center pb-0">
				<CardTitle>Tipos de Vidrio Más Usados</CardTitle>
				<CardDescription>Top 5 vidrios por cantidad de uso</CardDescription>
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
										<p className="text-muted-foreground text-xs">
											Fabricante: {tooltipData.manufacturer}
										</p>
										<p className="mt-1 font-medium text-primary text-sm">
											{tooltipData.count} usos (
											{formatPercent(
												tooltipData.percentage / PERCENTAGE_MULTIPLIER,
												{ context: tenantConfig },
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
					Total de {formatNumber(totalUses)} usos{" "}
					<TrendingUp className="h-4 w-4" />
				</div>
				<div className="text-muted-foreground leading-none">
					Distribución de tipos de vidrio en cotizaciones
				</div>
			</CardFooter>
		</Card>
	);
}
