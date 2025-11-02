"use client";

import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";

type MetricCardProps = {
	/**
	 * Title of the metric (e.g., "Total de Cotizaciones")
	 */
	title: string;

	/**
	 * Main metric value to display (e.g., 142)
	 */
	value: string | number;

	/**
	 * Optional description or subtitle
	 */
	description?: string;

	/**
	 * Percentage change from previous period
	 * Positive = improvement, Negative = decline, undefined = no change
	 */
	trend?: number;

	/**
	 * Icon component to display in the header
	 */
	icon?: React.ComponentType<{ className?: string }>;

	/**
	 * Additional CSS classes for the card
	 */
	className?: string;
};

/**
 * MetricCard Component
 *
 * Reusable card for displaying dashboard metrics with trend indicators.
 * Shows value, optional trend arrow, and icon.
 *
 * Features:
 * - Trend visualization (up/down/neutral arrows with colors)
 * - Responsive typography
 * - Consistent spacing and alignment
 * - Accessible color scheme
 *
 * @example
 * ```tsx
 * <MetricCard
 *   title="Total de Cotizaciones"
 *   value={142}
 *   description="Últimos 30 días"
 *   trend={12.5}
 *   icon={FileText}
 * />
 * ```
 */
export function MetricCard({
	title,
	value,
	description,
	trend,
	icon: Icon,
	className,
}: MetricCardProps) {
	const hasTrend = trend !== undefined && trend !== 0;
	const isPositive = trend && trend > 0;
	const isNegative = trend && trend < 0;

	// Determine trend icon based on value direction
	let TrendIcon = Minus;
	if (isPositive) {
		TrendIcon = ArrowUp;
	} else if (isNegative) {
		TrendIcon = ArrowDown;
	}

	return (
		<Card className={cn("transition-shadow hover:shadow-md", className)}>
			<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle className="font-medium text-sm">{title}</CardTitle>
				{Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
			</CardHeader>
			<CardContent>
				<div className="font-bold text-2xl">{value}</div>
				{(description || hasTrend) && (
					<div className="flex items-center gap-2 text-muted-foreground text-xs">
						{hasTrend && (
							<>
								<span
									className={cn("flex items-center gap-1 font-medium", {
										"text-emerald-600 dark:text-emerald-400": isPositive,
										"text-red-600 dark:text-red-400": isNegative,
									})}
								>
									<TrendIcon className="h-3 w-3" />
									{formatNumber(Math.abs(trend), { decimals: 1 })}%
								</span>
								<span>vs período anterior</span>
							</>
						)}
						{description && !hasTrend && <span>{description}</span>}
					</div>
				)}
			</CardContent>
		</Card>
	);
}
