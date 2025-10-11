'use client';

import {
  ProductDimensions,
  ProductImagePlaceholder,
  ProductInfo,
  ProductPrice,
  ProductSolutions,
} from '@views/catalog/_components/molecules/model-card-atoms';
import Link from 'next/link';
import { Card, CardContent, CardFooter } from '@/components/ui/card';

type ModelCardProps = {
  id: string;
  name: string;
  profileSupplier?: string;
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
  /** Highlighted glass solutions for this model */
  highlightedSolutions?: Array<{
    icon?: string;
    nameEs: string;
    rating: 'excellent' | 'very_good' | 'good' | 'standard' | 'basic';
  }>;
};

/**
 * ModelCard - Pure Presentational Component
 * Issue: #002-ui-ux-requirements
 *
 * Displays model information in a clean, minimalist card.
 * Inspired by Saleor Storefront design principles.
 *
 * Responsibilities (Single Responsibility Principle):
 * - Compose atomic components into card layout
 * - Provide navigation link
 * - Display highlighted glass solutions
 * - No business logic, pure presentation
 *
 * Benefits:
 * - Easy to test (just snapshot tests)
 * - Easy to maintain (no complex logic)
 * - Composed from reusable atoms
 * - Follows Atomic Design methodology
 */
export function ModelCard({ id, name, profileSupplier, range, basePrice, highlightedSolutions }: ModelCardProps) {
  return (
    <Card aria-label={`Tarjeta del modelo ${name}`} className="group p-0 pb-2 transition-opacity hover:opacity-80">
      <Link className="block space-y-3" href={`/catalog/${id}`}>
        {/* Product Image */}
        <ProductImagePlaceholder productName={name} />

        {/* Product Info */}
        <CardContent className="space-y-2 px-3 py-0">
          {/* Glass Solutions - Highlighted features */}
          {highlightedSolutions && highlightedSolutions.length > 0 && (
            <ProductSolutions solutions={highlightedSolutions} />
          )}

          <ProductInfo name={name} profileSupplier={profileSupplier} />
          <ProductDimensions heightRange={range.height} widthRange={range.width} />
        </CardContent>

        {/* Product Price */}
        <CardFooter className="flex justify-end px-3">
          <ProductPrice price={basePrice} />
        </CardFooter>
      </Link>
    </Card>
  );
}
