"use client";

import { Check, Sparkles } from "lucide-react";
import { Label } from "@/components/ui/label";
import { PerformanceRatingBadge } from "@/components/ui/performance-rating-badge";
import { PriceImpactBadge } from "@/components/ui/price-impact-badge";
import { RadioGroupItem } from "@/components/ui/radio-group";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { PerformanceRating } from "@/server/api/routers/catalog";
import type { GlassTypeOption } from "../_hooks/use-glass-type-options";

/**
 * Glass Type Card Component (Organism)
 *
 * Individual selectable card for a glass type option.
 * Follows "Don't Make Me Think" principles:
 * - Clear visual hierarchy (icon → title → performance → price)
 * - Obvious selection state
 * - Scannable information
 * - No cognitive overload
 *
 * ## Layout
 * ```
 * ┌─────────────────────────────────┐
 * │ [✓] 🏠 Título           [★ Rec] │
 * │     Nombre técnico              │
 * │                                 │
 * │ [████] Seguridad        4/5     │
 * │ [████] Térmico          5/5     │
 * │ [████] Acústico         3/5     │
 * │                                 │
 * │ • Feature 1                     │
 * │ • Feature 2                     │
 * │ ─────────────────────────────── │
 * │ [Badge]              $XX.XX/m²  │
 * └─────────────────────────────────┘
 * ```
 */

type GlassTypeCardProps = {
	basePrice?: number;
	isSelected: boolean;
	option: GlassTypeOption;
};

export function GlassTypeCard({
	basePrice,
	isSelected,
	option,
}: GlassTypeCardProps) {
	const Icon = option.icon;

	return (
		<Label
			className={cn(
				"group relative flex cursor-pointer flex-col gap-3 rounded-xl border-2 p-4 transition-all duration-200",
				"hover:scale-[1.02] hover:border-primary/50 hover:shadow-md",
				"has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring has-[:focus-visible]:ring-offset-2",
				isSelected
					? "border-primary bg-primary/5 shadow-lg"
					: "border-border bg-card",
			)}
			htmlFor={option.id}
		>
			{/* Recommended badge (top-right) */}
			{option.isRecommended && (
				<div className="-top-3 -right-2 absolute z-10 flex items-center gap-1 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 px-3 py-1 font-bold text-white text-xs shadow-lg">
					<Sparkles className="size-3" />
					Recomendado
				</div>
			)}

			{/* Hidden radio input */}
			<RadioGroupItem className="sr-only" id={option.id} value={option.id} />
			{/* Selected indicator (top-right inside card) */}
			{isSelected && (
				<div className="absolute top-3 right-3 flex size-6 items-center justify-center rounded-full bg-primary">
					<Check className="size-4 text-primary-foreground" />
				</div>
			)}

			{/* Header: Icon + Title */}
			<div className="flex items-start gap-3">
				<div
					className={cn(
						"flex size-10 shrink-0 items-center justify-center rounded-lg transition-colors",
						isSelected
							? "bg-primary text-primary-foreground"
							: "bg-muted text-muted-foreground group-hover:bg-primary/10",
					)}
				>
					<Icon className="size-5" />
				</div>
				<div className="flex-1 space-y-1">
					<h4
						className={cn(
							"font-semibold text-sm leading-tight",
							isSelected && "text-primary",
						)}
					>
						{option.title}
					</h4>
					<p className="line-clamp-1 text-muted-foreground text-xs">
						{option.name}
					</p>
				</div>
			</div>

			{/* Performance indicators */}
			{/* <GlassTypePerformance
          acoustic={option.acousticRating}
          security={option.securityRating}
          thermal={option.thermalRating}
        /> */}

			{/* Features (limit to 3 for scannability) */}
			{/* {option.features.length > 0 && (
          <div className="space-y-1.5">
            <p className="font-medium text-muted-foreground text-xs">Características</p>
            <div className="flex flex-wrap gap-1">
              {option.features.slice(0, 3).map((feature, idx) => (
                <Badge className="text-xs" key={idx} variant="outline">
                  {feature}
                </Badge>
              ))}
            </div>
          </div>
        )} */}

			{/* Footer: Performance rating + Price */}
			<div className="flex items-end justify-between gap-2 border-t pt-3">
				<div className="flex flex-col gap-1">
					{option.performanceRating && (
						<PerformanceRatingBadge
							rating={option.performanceRating as PerformanceRating}
						/>
					)}
					{basePrice && option.priceModifier !== 0 && (
						<PriceImpactBadge
							basePrice={basePrice}
							currency="$"
							priceModifier={option.priceModifier}
						/>
					)}
				</div>
				<div className="text-right">
					<div className="font-bold text-lg text-primary">
						{formatCurrency(option.pricePerSqm)}
					</div>
					<div className="text-muted-foreground text-xs">por m²</div>
				</div>
			</div>
		</Label>
	);
}
