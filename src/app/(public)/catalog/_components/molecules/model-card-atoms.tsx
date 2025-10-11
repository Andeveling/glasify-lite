/**
 * Model Card Components
 *
 * Pure presentational components for displaying model information.
 * Following Atomic Design and Single Responsibility Principle.
 */

import { ArrowLeftRight, ArrowUpDown, type LucideIcon, Shield, Snowflake, Sparkles, Volume2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

/**
 * Map of icon names to Lucide icon components
 * Used for dynamic icon rendering from database
 */
const ICON_MAP: Record<string, LucideIcon> = {
  Shield,
  Snowflake,
  Sparkles,
  Volume2,
  // Add more icons as needed
};

/** Maximum number of solution badges to display on a card */
const MAX_DISPLAYED_SOLUTIONS = 3;

type DimensionDisplayProps = {
  icon: React.ReactNode;
  label: string;
  min: number;
  max: number;
};

/**
 * DimensionDisplay - Atomic Component
 *
 * Displays a single dimension range (width or height).
 * Pure presentational, no logic.
 */
export function DimensionDisplay({ icon, label, min, max }: DimensionDisplayProps) {
  return (
    <div className="flex items-center gap-2 text-foreground/70 text-xs">
      {icon}
      <span>
        {label}: {min} - {max} mm
      </span>
    </div>
  );
}

type ProductImagePlaceholderProps = {
  productName: string;
};

/**
 * ProductImagePlaceholder - Atomic Component
 *
 * Placeholder for product images.
 * Can be easily replaced with actual image component.
 * TODO: Integrate real images later.
 */
export function ProductImagePlaceholder({ productName: _productName }: ProductImagePlaceholderProps) {
  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-muted">
      <div className="flex h-full items-center justify-center">
        <span className="text-muted-foreground/50 text-sm">Imagen del producto</span>
      </div>
    </div>
  );
}

type ProductInfoProps = {
  name: string;
  profileSupplier?: string;
};

/**
 * ProductInfo - Atomic Component
 *
 * Displays product name and profile supplier.
 */
export function ProductInfo({ name, profileSupplier }: ProductInfoProps) {
  return (
    <div>
      <h3 className="font-semibold text-foreground text-sm tracking-tight">{name}</h3>
      {profileSupplier && <p className="text-foreground/60 text-xs">{profileSupplier}</p>}
    </div>
  );
}

type ProductDimensionsProps = {
  widthRange: [number, number];
  heightRange: [number, number];
};

/**
 * ProductDimensions - Molecule Component
 *
 * Displays width and height ranges.
 * Composed of DimensionDisplay atoms.
 */
export function ProductDimensions({ widthRange, heightRange }: ProductDimensionsProps) {
  return (
    <div className="space-y-1">
      <DimensionDisplay
        icon={<ArrowLeftRight className="h-3.5 w-3.5" />}
        label="Ancho"
        max={widthRange[1]}
        min={widthRange[0]}
      />
      <DimensionDisplay
        icon={<ArrowUpDown className="h-3.5 w-3.5" />}
        label="Alto"
        max={heightRange[1]}
        min={heightRange[0]}
      />
    </div>
  );
}

type ProductPriceProps = {
  price: string;
};

/**
 * ProductPrice - Atomic Component
 *
 * Displays product price.
 */
export function ProductPrice({ price }: ProductPriceProps) {
  return <p className="font-medium text-foreground text-sm">{price}</p>;
}

// ============================================================================
// GLASS SOLUTIONS COMPONENTS
// ============================================================================

type PerformanceRating = 'basic' | 'standard' | 'good' | 'very_good' | 'excellent';

type SolutionBadgeProps = {
  /** Lucide icon name (e.g., 'Shield', 'Snowflake') */
  icon?: string;
  /** Solution name in Spanish (from GlassSolution.nameEs) */
  label: string;
  /** Performance rating (excellent > very_good > good) */
  rating?: PerformanceRating;
};

/**
 * SolutionBadge - Atomic Component
 *
 * Displays a single glass solution badge with icon and label.
 * Visual importance based on performance rating.
 */
export function SolutionBadge({ icon, label, rating = 'good' }: SolutionBadgeProps) {
  // Get icon component from map
  const IconComponent = icon ? ICON_MAP[icon] : null;

  // Visual variants based on performance rating
  const ratingVariants = {
    basic: 'bg-muted text-muted-foreground border-muted-foreground/30',
    excellent: 'bg-primary/15 text-primary border-primary/30',
    good: 'bg-green-500/15 text-green-700 border-green-500/30 dark:text-green-400',
    standard: 'bg-muted text-muted-foreground border-muted-foreground/30',
    veryGood: 'bg-blue-500/15 text-blue-700 border-blue-500/30 dark:text-blue-400',
  };

  // Map database snake_case to camelCase for variant lookup
  const variantKey = rating === 'very_good' ? 'veryGood' : rating;
  const variantClass = ratingVariants[variantKey as keyof typeof ratingVariants];

  return (
    <Badge className={`gap-1 px-2 py-0.5 text-xs ${variantClass}`} variant="outline">
      {IconComponent && <IconComponent className="h-3 w-3" />}
      <span>{label}</span>
    </Badge>
  );
}

type HighlightedSolution = {
  icon?: string;
  nameEs: string;
  rating: PerformanceRating;
};

type ProductSolutionsProps = {
  /** Top 2-3 highlighted solutions for this window model */
  solutions: HighlightedSolution[];
};

/**
 * ProductSolutions - Molecule Component
 *
 * Displays highlighted glass solutions for a window model.
 * Shows top 2-3 solutions based on performance rating and compatibility.
 */
export function ProductSolutions({ solutions }: ProductSolutionsProps) {
  if (solutions.length === 0) return null;

  // Limit to top solutions to avoid clutter
  const topSolutions = solutions.slice(0, MAX_DISPLAYED_SOLUTIONS);

  return (
    <div className="flex flex-wrap gap-1.5">
      {topSolutions.map((solution) => (
        <SolutionBadge icon={solution.icon} key={solution.nameEs} label={solution.nameEs} rating={solution.rating} />
      ))}
    </div>
  );
}
