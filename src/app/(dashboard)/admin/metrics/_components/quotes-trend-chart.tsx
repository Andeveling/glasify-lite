"use client";

import { CartesianGrid, Line, LineChart, XAxis } from "recharts";
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
	ChartTooltipContent,
} from "@/components/ui/chart";
import { formatNumber } from "@/lib/format";
import type { TrendDataPoint } from "@/types/dashboard";
import { EmptyDashboardState } from "./empty-dashboard-state";

const chartConfig = {
	count: {
		color: "var(--chart-1)",
		label: "Cotizaciones",
	},
} satisfies ChartConfig;

type QuotesTrendChartProps = {
	/**
	 * Trend data points from tRPC query
	 * Each point has: date (ISO string), count (number), label (formatted string)
	 */
	data: TrendDataPoint[];

	/**
	 * Period label for chart title (e.g., "Últimos 30 días")
	 */
	periodLabel: string;
};

/**
 * QuotesTrendChart Component
 *
 * Displays line chart showing quote creation trend over time.
 * Shows daily quote counts with zero-filled gaps.
 *
 * Features:
 * - Responsive container (adapts to parent width)
 * - Tooltips on hover showing count and formatted date
 * - Empty state when no data
 * - Pre-formatted dates from @lib/format (tenant timezone/locale)
 * - Primary color scheme from theme
 *
 * @example
 * ```tsx
 * <QuotesTrendChart
 *   data={[
 *     { date: '2025-01-15', count: 5, label: '15 Ene' },
 *     { date: '2025-01-16', count: 3, label: '16 Ene' },
 *   ]}
 *   periodLabel="Últimos 7 días"
 * />
 * ```
 */
export function QuotesTrendChart({ data, periodLabel }: QuotesTrendChartProps) {
	// Show empty state if no data
	if (data.length === 0) {
		return (
			<EmptyDashboardState
				description="No hay cotizaciones para mostrar en este período."
				title="Sin datos de tendencia"
			/>
		);
	}

	const total = data.reduce((acc, curr) => acc + curr.count, 0);

	return (
		<Card className="py-4 sm:py-0">
			<CardHeader className="!p-0 flex flex-col items-stretch border-b sm:flex-row">
				<div className="flex flex-1 flex-col justify-center gap-1 px-6 pb-3 sm:pb-0">
					<CardTitle>Tendencia de Cotizaciones</CardTitle>
					<CardDescription>{periodLabel}</CardDescription>
				</div>
				<div className="flex">
					<div className="flex flex-1 flex-col justify-center gap-1 border-t border-l px-6 py-4 text-left sm:border-t-0 sm:px-8 sm:py-6">
						<span className="text-muted-foreground text-xs">Total</span>
						<span className="font-bold text-lg leading-none sm:text-3xl">
							{formatNumber(total)}
						</span>
					</div>
				</div>
			</CardHeader>
			<CardContent className="px-2 sm:p-6">
				<ChartContainer
					className="aspect-auto h-[250px] w-full"
					config={chartConfig}
				>
					<LineChart
						accessibilityLayer
						data={data}
						margin={{
							left: 12,
							right: 12,
						}}
					>
						<CartesianGrid vertical={false} />
						<XAxis
							axisLine={false}
							dataKey="label"
							minTickGap={32}
							tickLine={false}
							tickMargin={8}
						/>
						<ChartTooltip
							content={
								<ChartTooltipContent className="w-[150px]" nameKey="count" />
							}
						/>
						<Line
							dataKey="count"
							dot={false}
							stroke="var(--color-count)"
							strokeWidth={2}
							type="monotone"
						/>
					</LineChart>
				</ChartContainer>
			</CardContent>
		</Card>
	);
}
