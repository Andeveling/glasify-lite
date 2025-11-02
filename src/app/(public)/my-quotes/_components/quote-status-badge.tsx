/**
 * Quote Status Badge Component
 *
 * Displays quote status with icon, tooltip, and color-coded badge.
 * Client Component with interactive tooltip behavior.
 *
 * @module QuoteStatusBadge
 */

"use client";

import type { Quote } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
	getStatusConfig,
	getStatusIconComponent,
	type QuoteStatus,
} from "../_utils/status-config";

/**
 * QuoteStatusBadge props
 */
export type QuoteStatusBadgeProps = {
	/** Quote status (draft, sent, canceled) */
	status: QuoteStatus | Quote["status"];

	/** Show icon next to label (default: true) */
	showIcon?: boolean;

	/** Enable tooltip on hover (default: true) */
	showTooltip?: boolean;

	/** Additional CSS classes */
	className?: string;

	/** Badge size variant */
	size?: "sm" | "default" | "lg";
};

/**
 * Size variant classes for badge
 */
const sizeVariants = {
	default: "text-sm px-2.5 py-0.5",
	lg: "text-base px-3 py-1",
	sm: "text-xs px-2 py-0.5",
};

/**
 * Icon size variants
 */
const iconSizeVariants = {
	default: "h-3.5 w-3.5",
	lg: "h-4 w-4",
	sm: "h-3 w-3",
};

/**
 * Quote Status Badge
 *
 * Renders a color-coded badge with icon and tooltip for quote status.
 * Automatically selects appropriate label, icon, color, and tooltip based
 * on status configuration.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <QuoteStatusBadge status="draft" />
 *
 * // Without icon
 * <QuoteStatusBadge status="sent" showIcon={false} />
 *
 * // Without tooltip
 * <QuoteStatusBadge status="canceled" showTooltip={false} />
 *
 * // Custom size
 * <QuoteStatusBadge status="draft" size="lg" />
 * ```
 */
export function QuoteStatusBadge({
	status,
	showIcon = true,
	showTooltip = true,
	className,
	size = "default",
}: QuoteStatusBadgeProps) {
	const config = getStatusConfig(status);
	const IconComponent = getStatusIconComponent(status);

	// Badge content
	const badgeContent = (
		<Badge
			className={cn(
				"inline-flex items-center gap-1.5 font-medium",
				sizeVariants[size],
				className,
			)}
			data-status={status}
			data-testid="quote-status-badge"
			variant={config.variant}
		>
			{showIcon && (
				<IconComponent
					aria-hidden="true"
					className={cn("flex-shrink-0", iconSizeVariants[size])}
					data-testid="status-icon"
				/>
			)}
			<span data-testid="status-label">{config.label}</span>
		</Badge>
	);

	// Return without tooltip if disabled
	if (!showTooltip) {
		return badgeContent;
	}

	// Wrap with tooltip
	return (
		<TooltipProvider delayDuration={200}>
			<Tooltip>
				<TooltipTrigger asChild>{badgeContent}</TooltipTrigger>
				<TooltipContent
					align="center"
					className="max-w-xs"
					data-testid="status-tooltip"
					side="bottom"
				>
					<p>{config.tooltip}</p>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
}

export type {
	QuoteStatus,
	StatusConfig,
	StatusCTA,
} from "../_utils/status-config";
/**
 * Export status utilities for convenience
 *
 * Note: This is intentionally a re-export (barrel) to provide a cleaner API.
 * The utilities are closely related to the StatusBadge component.
 */
// biome-ignore lint/performance/noBarrelFile: Intentional re-export of closely related utilities
export {
	getStatusConfig,
	getStatusIconComponent,
} from "../_utils/status-config";
