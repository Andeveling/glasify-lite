"use client";

/**
 * Price Ranges Chart Component
 * Displays distribution of quotes by price ranges as a bar chart
 * with count and percentage tooltips
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
import {
	formatCurrency,
	formatCurrencyCompact,
	formatPercent,
} from "@/lib/format";
import type { PriceRange } from "@/types/dashboard";
import { EmptyDashboardState } from "./empty-dashboard-state";

const BORDER_RADIUS_VALUE = 4;
const BAR_RADIUS_RIGHT: [number, number, number, number] = [
	0,
	BORDER_RADIUS_VALUE,
	BORDER_RADIUS_VALUE,
	0,
];

const chartConfig = {
	count: {
		color: "var(--chart-2)",
		label: "Cotizaciones",
	},
} satisfies ChartConfig;

type PriceRangesChartProps = {
	/**
	 * Price range distribution from tRPC query
	 */
	data: PriceRange[];

	/**
	 * Tenant configuration for currency/locale formatting
	 */
	tenantConfig?: { currency?: string; locale?: string } | null;
};

/**
 * PriceRangesChart Component
 *
 * Displays horizontal bar chart showing quote distribution across price ranges.
 * Shows count of quotes in each configurable price bucket.
 *
 * Features:
 * - Horizontal bars for easy reading
 * - Tooltips with count and percentage
 * - Formatted currency labels from @lib/format (tenant-aware)
 * - Empty state when no data
 * - Responsive design
 *
 * @example
 * ```tsx
 * <PriceRangesChart
 *   data={[
 *     { label: '0 - 1M', count: 10, percentage: 0.25, min: 0, max: 1000000 },
 *     { label: '1M - 5M', count: 20, percentage: 0.50, min: 1000000, max: 5000000 },
 *     { label: '5M - 10M', count: 8, percentage: 0.20, min: 5000000, max: 10000000 },
 *     { label: '10M+', count: 2, percentage: 0.05, min: 10000000, max: null },
 *   ]}
 *   tenantConfig={{ currency: 'COP', locale: 'es-CO' }}
 * />
 * ```
 */
export function PriceRangesChart({
	data,
	tenantConfig,
}: PriceRangesChartProps) {
	// Empty state check
	if (!data || data.length === 0) {
		return (
			<EmptyDashboardState
				description="No hay cotizaciones en este período para mostrar distribución de precios"
				title="Sin datos de rangos de precio"
			/>
		);
	}

	// Transform data for recharts with formatted labels
	const chartData = data.map((item) => {
		// Format range label using formatCurrencyCompact
		const minFormatted = formatCurrencyCompact(item.min, tenantConfig);
		const maxFormatted = item.max
			? formatCurrencyCompact(item.max, tenantConfig)
			: "+";
		const rangeLabel = item.max
			? `${minFormatted} - ${maxFormatted}`
			: `${minFormatted}${maxFormatted}`;

		return {
			count: item.count,
			label: rangeLabel,
			max: item.max,
			min: item.min,
			percentage: item.percentage,
		};
	});

	return (
		<Card>
			<CardHeader className="pb-3">
				<CardTitle>Distribución por Rango de Precio</CardTitle>
				<CardDescription>
					Cantidad de cotizaciones por rango de valor
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
						<YAxis dataKey="label" fontSize={11} type="category" width={100} />
						<ChartTooltip
							content={({ active, payload }) => {
								if (!(active && payload) || payload.length === 0) {
									return null;
								}

								const tooltipData = payload[0]?.payload;
								if (!tooltipData) {
									return null;
								}

								// Format detailed range for tooltip
								const minFormatted = formatCurrency(tooltipData.min, {
									context: tenantConfig,
								});
								const maxFormatted = tooltipData.max
									? formatCurrency(tooltipData.max, { context: tenantConfig })
									: "+";
								const detailedRange = tooltipData.max
									? `${minFormatted} - ${maxFormatted}`
									: `${minFormatted}${maxFormatted}`;

								return (
									<div className="rounded-lg border bg-background p-3 shadow-md">
										<p className="font-semibold text-sm">{detailedRange}</p>
										<p className="mt-1 font-medium text-primary text-sm">
											{tooltipData.count} cotizaciones (
											{formatPercent(tooltipData.percentage, {
												context: tenantConfig,
											})}
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
