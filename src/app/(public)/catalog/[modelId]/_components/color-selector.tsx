/**
 * T047: ColorSelector Component
 *
 * Visual color chip selector for quote configuration
 * - Displays available colors for model with surcharge badges
 * - Uses Radix UI RadioGroup for proper semantic HTML and accessibility
 * - Keyboard navigation handled automatically by RadioGroup
 * - Accessible with ARIA labels in Spanish
 * - Calls onColorChange with colorId and surchargePercentage
 * - Auto-selects default color on mount
 *
 * Architecture:
 * - Client Component for interactivity
 * - Fetches colors via tRPC (cached 5min server-side)
 * - Horizontal scroll for >6 colors, grid for ≤6
 * - RadioGroupItem hidden (sr-only), label provides visual UI
 */

"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { RadioGroup } from "@/components/ui/radio-group";
import { api } from "@/trpc/react";
import { ColorChipOption } from "./_components/color-chip-option";

// Constants
const COLOR_CACHE_MINUTES = 5;
const MINUTES_TO_MS = 60_000;
const COLOR_STALE_TIME_MS = COLOR_CACHE_MINUTES * MINUTES_TO_MS;
const GRID_BREAKPOINT = 6;
const SKELETON_ITEM_COUNT = 3;

type ColorSelectorProps = {
	modelId: string;
	/**
	 * ⚠️ NEXT.JS WARNING (FALSE POSITIVE):
	 * Next.js 15 shows warning about callback not being Server Action.
	 * This is a KNOWN ISSUE - callbacks are valid in Client-to-Client components.
	 *
	 * Context:
	 * - This component (color-selector.tsx) is a Client Component ("use client")
	 * - Parent component (model-form.tsx) is also a Client Component
	 * - Callback is NOT crossing Server/Client boundary
	 *
	 * References:
	 * - https://github.com/vercel/next.js/issues/54282
	 * - This warning can be safely ignored for Client-to-Client callbacks
	 */
	onColorChange: (
		colorId: string | undefined,
		surchargePercentage: number,
	) => void;
};

/**
 * ColorSelector Component
 * Returns null if model has no colors assigned
 */
export function ColorSelector({ modelId, onColorChange }: ColorSelectorProps) {
	const [selectedColorId, setSelectedColorId] = useState<string | undefined>();

	// Fetch model colors
	const { data, isLoading } = api.quote["get-model-colors-for-quote"].useQuery(
		{ modelId },
		{
			staleTime: COLOR_STALE_TIME_MS, // 5 minutes (matches server cache)
		},
	);

	// Auto-select default color on mount
	useEffect(() => {
		if (data?.defaultColorId && !selectedColorId) {
			setSelectedColorId(data.defaultColorId);
			const defaultColor = data.colors.find(
				(c) => c.color.id === data.defaultColorId,
			);
			if (defaultColor) {
				onColorChange(data.defaultColorId, defaultColor.surchargePercentage);
			}
		}
	}, [data, selectedColorId, onColorChange]);

	// Handle color selection
	const handleColorSelect = (value: string) => {
		const selectedColor = data?.colors.find((mc) => mc.color.id === value);
		if (selectedColor) {
			setSelectedColorId(value);
			onColorChange(value, selectedColor.surchargePercentage);
		}
	};

	// Don't render if loading or no colors
	if (isLoading) {
		return (
			<div className="space-y-2">
				<p className="font-medium text-sm">Cargando colores...</p>
				<div className="flex gap-2">
					{Array.from({ length: SKELETON_ITEM_COUNT }, () => (
						<div
							className="h-16 w-16 animate-pulse rounded-lg bg-muted"
							key={crypto.randomUUID()}
						/>
					))}
				</div>
			</div>
		);
	}

	if (!data?.hasColors) {
		return null; // No color selector if model has no colors
	}

	const useGrid = data.colors.length <= GRID_BREAKPOINT;

	return (
		<div className="space-y-3">
			<div className="flex items-center justify-between">
				<label className="font-medium text-sm" htmlFor="color-selector">
					Seleccione un Color
				</label>
				<Badge variant="secondary">
					{data.colors.length}{" "}
					{data.colors.length === 1 ? "opción" : "opciones"}
				</Badge>
			</div>

			<RadioGroup
				aria-label="Selector de color"
				className={
					useGrid
						? "grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6"
						: "flex gap-3 overflow-x-auto pb-2"
				}
				id="color-selector"
				onValueChange={handleColorSelect}
				value={selectedColorId}
			>
				{data.colors.map((modelColor, index) => (
					<ColorChipOption
						index={index}
						isSelected={selectedColorId === modelColor.color.id}
						key={modelColor.id}
						modelColor={modelColor}
						useGrid={useGrid}
					/>
				))}
			</RadioGroup>
		</div>
	);
}
