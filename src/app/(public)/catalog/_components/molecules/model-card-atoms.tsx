/**
 * Model Card Components
 *
 * Pure presentational components for displaying model information.
 * Following Atomic Design and Single Responsibility Principle.
 */

import { ArrowLeftRight, ArrowUpDown, type LucideIcon, Shield, Snowflake, Sparkles, Volume2 } from 'lucide-react';
import Image from 'next/image';
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
  return <ProductImage productName={_productName} src={undefined} />;
}

// Small, performant SVG shimmer used as blurDataURL for image placeholder
function shimmerSvg(width = 700, height = 525) {
  return `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="g">
          <stop stop-color="#f3f4f6" offset="20%" />
          <stop stop-color="#e5e7eb" offset="50%" />
          <stop stop-color="#f3f4f6" offset="70%" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="#f3f4f6" />
      <rect width="100%" height="100%" fill="url(#g)" />
    </svg>`;
}

function shimmerDataUrl(width = 700, height = 525) {
  // Use encoded utf8 data URI to avoid depending on Buffer/btoa across runtimes
  return `data:image/svg+xml;utf8,${encodeURIComponent(shimmerSvg(width, height))}`;
}

type ProductImageProps = {
  src?: string | null;
  productName?: string;
  alt?: string;
  priority?: boolean;
  sizes?: string;
  className?: string;
  aspectRatioClass?: string; // Tailwind aspect-ratio utility class
};

/**
 * ProductImage - Atomic Component
 *
 * Improved product image with support for:
 * - optional real image `src` with fallback to placeholder
 * - responsive sizes and Next/Image `fill` mode
 * - accessible figcaption (screen reader only)
 * - blur placeholder using an inline SVG shimmer (no extra assets)
 *
 * This component is intentionally presentational and keeps server-side rendering
 * behaviour (no client-side event handlers). If you need interactive loading
 * states, convert it to a client component later.
 */
export function ProductImage({
  src,
  productName,
  alt,
  priority = false,
  sizes,
  className = '',
  aspectRatioClass = 'aspect-[4/3]',
}: ProductImageProps) {
  const imageSrc = src ?? '/placeholder.webp';
  const altText = alt ?? (productName ? `Imagen del producto: ${productName}` : 'Imagen del producto');

  return (
    <figure className={`relative ${aspectRatioClass} w-full overflow-hidden rounded-lg bg-muted ${className}`}>
      <Image
        alt={altText}
        blurDataURL={imageSrc === '/placeholder.webp' ? shimmerDataUrl(700, 525) : undefined}
        className="h-full w-full object-contain"
        fill
        placeholder={imageSrc === '/placeholder.webp' ? 'blur' : 'empty'}
        priority={priority}
        sizes={sizes ?? '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'}
        src={imageSrc}
      />
      <figcaption className="sr-only text-muted-foreground/50 text-sm">{altText}</figcaption>
    </figure>
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
  return <p className="font-bold text-foreground text-xl">{price}</p>;
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
