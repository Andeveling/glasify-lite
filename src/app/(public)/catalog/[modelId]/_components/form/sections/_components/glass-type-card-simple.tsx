"use client";

import { Check } from "lucide-react";
import { motion, type Variants } from "motion/react";
import { Label } from "@/components/ui/label";
import { PerformanceRatingBadge } from "@/components/ui/performance-rating-badge";
import { RadioGroupItem } from "@/components/ui/radio-group";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { PerformanceRating } from "@/server/api/routers/catalog";
import type { GlassTypeOption } from "../_hooks/use-glass-type-options";

/**
 * Glass Type Card Simple Component (Organism)
 *
 * Simplified version without performance bars and features.
 * Focuses on essential information: icon, title, rating, price.
 *
 * Don't Make Me Think:
 * - Minimal cognitive load
 * - Clear visual hierarchy
 * - Fast decision making
 * - Obvious selection state with enhanced animations & colors
 *
 * Visual Enhancements:
 * - Smooth transitions with Framer Motion
 * - Distinct selected state (brighter border, shadow glow)
 * - Subtle hover effects (scale + border color)
 * - Check icon with pop animation
 */

const SELECTED_SCALE = 1.02;
const SELECTED_CHECK_STAGGER_DELAY = 0.1;

// Animation variants for selected check icon
const selectedCheckVariants: Variants = {
	initial: { scale: 0, rotate: -180 },
	animate: {
		scale: 1,
		rotate: 0,
		transition: { type: "spring", damping: 10, stiffness: 200 },
	},
};

type GlassTypeCardSimpleProps = {
	isSelected: boolean;
	option: GlassTypeOption;
};

export function GlassTypeCardSimple({
	isSelected,
	option,
}: GlassTypeCardSimpleProps) {
	const Icon = option.icon;

	return (
		<motion.div
			animate={{ scale: isSelected ? SELECTED_SCALE : 1 }}
			transition={{ duration: 0.2 }}
		>
			<Label
				className={cn(
					"group relative flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition-all duration-300",
					"hover:scale-[1.02] hover:shadow-md",
					"has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring has-[:focus-visible]:ring-offset-2",
					isSelected
						? "border-primary bg-primary/8 shadow-[0_0_20px_rgba(var(--primary-rgb),0.15)] hover:border-primary hover:bg-primary/10"
						: "border-border/60 bg-card hover:border-primary/40 hover:bg-muted/40",
				)}
				htmlFor={option.id}
			>
				{/* Hidden radio input */}
				<RadioGroupItem className="sr-only" id={option.id} value={option.id} />

				{/* Icon container with animation */}
				<motion.div
					animate={{
						backgroundColor: isSelected
							? "rgb(var(--primary-rgb))"
							: "rgb(var(--muted-rgb))",
					}}
					className={cn(
						"flex size-12 shrink-0 items-center justify-center rounded-lg transition-colors duration-300",
					)}
					transition={{ duration: 0.2 }}
				>
					<Icon
						className={cn(
							"size-10 transition-colors duration-300",
							isSelected && "text-primary",
						)}
					/>
				</motion.div>

				{/* Content */}
				<div className="flex flex-1 items-center justify-between gap-3">
					{/* Title and tech name */}
					<div className="flex-1 space-y-0.5">
						<motion.h4
							animate={{
								color: isSelected ? "rgb(var(--primary-rgb))" : "inherit",
							}}
							className={cn(
								"font-semibold text-sm leading-tight transition-colors duration-300",
							)}
							transition={{ duration: 0.2 }}
						>
							{option.name}
						</motion.h4>
						<p className="line-clamp-1 text-muted-foreground text-xs">
							{option.title}
						</p>
					</div>

					{/* Rating */}
					{option.performanceRating && (
						<div className="shrink-0">
							<PerformanceRatingBadge
								rating={option.performanceRating as PerformanceRating}
							/>
						</div>
					)}

					{/* Price */}
					<div className="shrink-0 text-right">
						<motion.div
							animate={{
								color: isSelected ? "rgb(var(--primary-rgb))" : "inherit",
							}}
							className="font-bold text-base transition-colors duration-300"
							transition={{ duration: 0.2 }}
						>
							{formatCurrency(option.pricePerSqm)}
						</motion.div>
						<div className="text-muted-foreground text-xs">por m²</div>
					</div>
				</div>

				{/* Selected indicator with pop animation */}
				{isSelected && (
					<motion.div
						animate="animate"
						className="-top-2 -right-2 absolute flex size-6 items-center justify-center rounded-full bg-primary shadow-lg"
						initial="initial"
						transition={{ delay: SELECTED_CHECK_STAGGER_DELAY }}
						variants={selectedCheckVariants}
					>
						<Check className="size-4 text-primary-foreground" />
					</motion.div>
				)}
			</Label>
		</motion.div>
	);
}
