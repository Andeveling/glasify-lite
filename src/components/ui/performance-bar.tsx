"use client";

import type { LucideIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

// ============================================================================
// Types
// ============================================================================

type PerformanceBarProps = {
  className?: string;
  icon?: LucideIcon;
  label?: string;
  max?: number;
  showLabel?: boolean;
  tooltip?: string;
  value: number;
};

// ============================================================================
// Component
// ============================================================================

/**
 * Performance Bar Component (Atom)
 *
 * Visual progress bar with semantic colors to represent performance metrics.
 * Uses custom implementation with inline styles for dynamic theming.
 *
 * ## Features
 * - **Visual bars**: Clean progress bars with smooth transitions
 * - **Semantic colors**: Green (80%+), Blue (60-79%), Yellow (40-59%), Red (<40%)
 * - **Icon with tooltip**: Visual indicator with explanatory hover tooltip
 * - **Rating display**: Shows numeric value (e.g., "4/5") next to bar
 * - **Responsive**: Adapts to container width
 *
 * ## Layout
 * ```
 * [🛡️] [████████░░] 4/5
 * Icon    Progress    Rating
 * ```
 *
 * ## Theme Integration
 * Uses CSS variables from globals.css (OKLCH color space):
 * - `--success`: Excellent (≥80%) - Green
 * - `--chart-4`: Good (60-79%) - Blue
 * - `--chart-5`: Medium (40-59%) - Yellow
 * - `--destructive`: Poor (<40%) - Red
 * - `--muted`: Background bar color
 *
 * @example
 * ```tsx
 * <PerformanceBar
 *   icon={Shield}
 *   value={4}
 *   max={5}
 *   tooltip="Protección contra impactos y roturas"
 * />
 * ```
 */
export function PerformanceBar({
  className,
  icon: Icon,
  label,
  max = 5,
  showLabel = false,
  tooltip,
  value,
}: PerformanceBarProps) {
  const clampedValue = Math.max(0, Math.min(max, value));
  const percentage = (clampedValue / max) * 100;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* Icon with tooltip */}
      {Icon && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex shrink-0">
                <Icon className="size-4 text-muted-foreground" />
              </div>
            </TooltipTrigger>
            {tooltip && (
              <TooltipContent className="max-w-xs" side="top">
                <p className="text-xs">{tooltip}</p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      )}
      {/* Progress bar with semantic color */}
      <div className="relative min-w-0 flex-1">
        <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{
              backgroundColor:
                percentage >= 80
                  ? "oklch(var(--success))"
                  : percentage >= 60
                    ? "oklch(var(--chart-4))"
                    : percentage >= 40
                      ? "oklch(var(--chart-5))"
                      : "oklch(var(--destructive))",
              width: `${percentage}%`,
            }}
          />
        </div>
      </div>
      {/* Rating value */}
      <span className="min-w-[32px] shrink-0 text-right font-medium text-muted-foreground text-xs tabular-nums">
        {clampedValue}/{max}
      </span>
    </div>
  );
}
