"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { DashboardPeriod } from "@/types/dashboard";

type PeriodSelectorProps = {
	/**
	 * Default period if no URL param is set
	 */
	defaultPeriod?: string;

	/**
	 * Additional CSS classes for the select component
	 */
	className?: string;
};

/**
 * PeriodSelector Component
 *
 * Client Component for selecting dashboard time period.
 * Syncs selection with URL search params for shareable links.
 *
 * URL State Management:
 * - Reads `period` query param on mount
 * - Updates URL when period changes
 * - Preserves other query params
 * - Browser back/forward works correctly
 *
 * Features:
 * - URL-based state (shareable links)
 * - Server-friendly (SSR compatible)
 * - Accessible select component
 * - Spanish labels for UI
 *
 * @example
 * ```tsx
 * <PeriodSelector defaultPeriod="30d" />
 * // URL updates to: /admin/metrics?period=30d
 * ```
 */
export function PeriodSelector({
	defaultPeriod = DashboardPeriod.LAST_30_DAYS,
	className,
}: PeriodSelectorProps) {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();

	// Get current period from URL or use default
	const currentPeriod = searchParams.get("period") ?? defaultPeriod;

	const handlePeriodChange = (newPeriod: string) => {
		// Create new URLSearchParams to preserve other params
		const params = new URLSearchParams(searchParams);
		params.set("period", newPeriod);

		// Update URL with new period and refresh server data
		router.push(`${pathname}?${params.toString()}`);
		router.refresh(); // Force re-fetch of server data (SSR pattern)
	};

	// Period options with Spanish labels
	const periodOptions = [
		{ label: "Últimos 7 días", value: DashboardPeriod.LAST_7_DAYS },
		{ label: "Últimos 30 días", value: DashboardPeriod.LAST_30_DAYS },
		{ label: "Últimos 90 días", value: DashboardPeriod.LAST_90_DAYS },
		{ label: "Año actual", value: DashboardPeriod.CURRENT_YEAR },
	];

	return (
		<Select onValueChange={handlePeriodChange} value={currentPeriod}>
			<SelectTrigger aria-label="Seleccionar período" className={className}>
				<SelectValue placeholder="Selecciona un período" />
			</SelectTrigger>
			<SelectContent>
				{periodOptions.map((option) => (
					<SelectItem key={option.value} value={option.value}>
						{option.label}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}
