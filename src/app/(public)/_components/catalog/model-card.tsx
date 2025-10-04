'use client';

import Link from 'next/link';

type ModelCardProps = {
  id: string;
  name: string;
  manufacturer: string;
  range: {
    width: [number, number];
    height: [number, number];
  };
  basePrice: string;
  compatibleGlassTypes: Array<{
    id: string;
    name: string;
    type: string;
  }>;
};

/**
 * ModelCard - Minimalist Client Component
 * Issue: #002-ui-ux-requirements
 *
 * Inspired by Saleor Storefront design:
 * - Clean typography hierarchy
 * - Generous white space
 * - Subtle hover effects
 * - No unnecessary borders or shadows
 * - Professional and minimal
 */
export function ModelCard({ id, name, manufacturer, basePrice }: ModelCardProps) {
  return (
    <Link className="group block space-y-4 transition-opacity hover:opacity-80" href={`/catalog/${id}`}>
      {/* Product Image Placeholder - Saleor style */}
      <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-muted">
        <div className="flex h-full items-center justify-center">
          <span className="text-muted-foreground/50 text-sm">Imagen del producto</span>
        </div>
      </div>

      {/* Product Info - Clean hierarchy */}
      <div className="space-y-1">
        <div>
          <h3 className="font-semibold text-foreground text-sm tracking-tight">{name}</h3>
          <p className="text-foreground/60 text-xs">{manufacturer}</p>
        </div>
        <p className="font-medium text-foreground text-sm">{basePrice}</p>
      </div>
    </Link>
  );
}
