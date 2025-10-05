/**
 * Model Card Components
 *
 * Pure presentational components for displaying model information.
 * Following Atomic Design and Single Responsibility Principle.
 */

import { ArrowLeftRight, ArrowUpDown } from 'lucide-react';

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
 */
export function ProductImagePlaceholder({ productName }: ProductImagePlaceholderProps) {
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
  manufacturer?: string;
};

/**
 * ProductInfo - Atomic Component
 *
 * Displays product name and manufacturer.
 */
export function ProductInfo({ name, manufacturer }: ProductInfoProps) {
  return (
    <div>
      <h3 className="font-semibold text-foreground text-sm tracking-tight">{name}</h3>
      {manufacturer && <p className="text-foreground/60 text-xs">{manufacturer}</p>}
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
