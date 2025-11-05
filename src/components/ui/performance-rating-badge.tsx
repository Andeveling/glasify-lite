import { Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type PerformanceRating =
  | "basic"
  | "standard"
  | "good"
  | "very_good"
  | "excellent";

type PerformanceRatingBadgeProps = {
  className?: string;
  rating: PerformanceRating;
  showLabel?: boolean;
};

/**
 * Configuration for performance rating display
 * Maps rating levels to visual properties (stars, colors, labels)
 */
const ratingConfig: Record<
  PerformanceRating,
  {
    color: string;
    label: string;
    stars: number;
  }
> = {
  basic: {
    color: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
    label: "Básico",
    stars: 1,
  },
  excellent: {
    color: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
    label: "Excelente",
    stars: 5,
  },
  good: {
    color: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
    label: "Bueno",
    stars: 3,
  },
  standard: {
    color:
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
    label: "Estándar",
    stars: 2,
  },
  very_good: {
    color:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300",
    label: "Muy Bueno",
    stars: 4,
  },
};

/**
 * Performance Rating Badge Component (Atom)
 *
 * Displays a glass performance rating with star indicators and optional text label.
 * Used throughout the application to show glass quality in different categories:
 * - Security rating (impact resistance)
 * - Acoustic rating (sound insulation)
 * - Thermal rating (U-value)
 * - Energy rating (solar factor)
 *
 * ## Rating Levels
 * - **basic** (1⭐) - Minimal performance, standard glass
 * - **standard** (2⭐) - Standard performance, basic requirements
 * - **good** (3⭐) - Good performance, above average
 * - **very_good** (4⭐) - Very good performance, high quality
 * - **excellent** (5⭐) - Maximum performance, premium glass
 *
 * ## Visual Design
 * - Color-coded badges for quick recognition
 * - Star icons for intuitive rating display
 * - Dark mode support with adjusted colors
 * - Compact design for space efficiency
 *
 * @param props - Component props
 * @param props.rating - Performance rating level (1-5 stars)
 * @param props.showLabel - Whether to show text label (default: false)
 * @param props.className - Additional CSS classes for styling
 *
 * @example
 * ```tsx
 * // Just stars (compact)
 * <PerformanceRatingBadge rating="very_good" />
 *
 * // With label
 * <PerformanceRatingBadge rating="excellent" showLabel />
 *
 * // Custom styling
 * <PerformanceRatingBadge
 *   rating="good"
 *   className="text-xs"
 * />
 * ```
 *
 * @see {@link GlassTypeSelectorSection} - Uses this component to show glass ratings
 * @see [Glass Solutions Guide](../../../docs/glass-solutions-guide.md) - Rating standards
 */
export function PerformanceRatingBadge({
  className,
  rating,
  showLabel = false,
}: PerformanceRatingBadgeProps) {
  const config = ratingConfig[rating];

  return (
    <Badge className={cn("gap-1", config.color, className)} variant="outline">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: config.stars }).map((_, i) => (
          <Star className="h-3 w-3 fill-current" key={i} />
        ))}
      </div>
      {showLabel && <span className="ml-1 text-xs">{config.label}</span>}
    </Badge>
  );
}
