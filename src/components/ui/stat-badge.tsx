import type { LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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

type StatBadgeProps = {
  className?: string;
  icon: LucideIcon;
  label: string;
  tooltip?: string;
  value: number; // 1-5 scale
};

// ============================================================================
// Utilities
// ============================================================================

/**
 * Get semantic color based on performance value (1-5 scale)
 * - 1-2: Poor (red)
 * - 3: Medium (yellow)
 * - 4-5: Good (green)
 */
function getPerformanceColor(value: number): string {
  if (value >= 4) return "text-green-600 dark:text-green-400";
  if (value === 3) return "text-yellow-600 dark:text-yellow-400";
  return "text-red-600 dark:text-red-400";
}

/**
 * Get background color based on performance value
 */
function getPerformanceBg(value: number): string {
  if (value >= 4) return "bg-green-50 dark:bg-green-950/20";
  if (value === 3) return "bg-yellow-50 dark:bg-yellow-950/20";
  return "bg-red-50 dark:bg-red-950/20";
}

/**
 * Render filled circles based on value (1-5 scale)
 */
function renderCircles(value: number): React.ReactNode {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          aria-hidden="true"
          className={cn(
            "h-1 w-1 rounded-full",
            index < value ? "bg-current" : "bg-muted"
          )}
          key={index}
        />
      ))}
    </div>
  );
}

// ============================================================================
// Component
// ============================================================================

/**
 * Stat Badge Component (Atom)
 *
 * Displays performance statistics with icon, label, value (1-5 scale),
 * and optional tooltip. Uses semantic colors based on performance level.
 *
 * ## Features
 * - **Icon display**: Lucide icon with semantic color coding
 * - **1-5 Scale**: Visual circles showing performance level
 * - **Semantic colors**: Green (good), yellow (medium), red (poor)
 * - **Tooltip**: Optional explanatory text on hover/focus
 * - **Accessibility**: ARIA labels, keyboard navigation
 *
 * ## Color Coding
 * - **4-5**: Green (excellent performance)
 * - **3**: Yellow (medium performance)
 * - **1-2**: Red (poor performance)
 *
 * ## Usage
 * ```tsx
 * <StatBadge
 *   icon={Shield}
 *   label="Seguridad"
 *   value={4}
 *   tooltip="Protección contra impactos y roturas"
 * />
 * ```
 *
 * @example
 * // In window preview with multiple stats
 * <div className="absolute top-4 right-4 space-y-2">
 *   <StatBadge icon={Shield} label="Seguridad" value={5} />
 *   <StatBadge icon={ThermometerSun} label="Térmico" value={3} />
 *   <StatBadge icon={Volume2} label="Acústico" value={4} />
 * </div>
 */
export function StatBadge({
  className,
  icon: Icon,
  label,
  tooltip,
  value,
}: StatBadgeProps) {
  const colorClass = getPerformanceColor(value);
  const bgClass = getPerformanceBg(value);

  const badge = (
    <Badge
      className={cn(
        "flex items-center gap-1.5 px-2 py-1",
        bgClass,
        colorClass,
        className
      )}
      variant="outline"
    >
      <Icon aria-hidden="true" className="h-3 w-3" />
      <span className="font-medium text-xs">{label}</span>
      {renderCircles(value)}
      <span className="sr-only">
        {label}: {value} de 5
      </span>
    </Badge>
  );

  if (tooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{badge}</TooltipTrigger>
          <TooltipContent>
            <p className="max-w-xs text-sm">{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return badge;
}
