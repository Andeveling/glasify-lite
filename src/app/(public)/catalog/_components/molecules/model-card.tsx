'use client';

import type { MaterialType } from '@prisma/client';
import { ProductPrice } from '@views/catalog/_components/molecules/model-card-atoms';
import Link from 'next/link';
import { useMemo } from 'react';
import { DesignFallback } from '@/app/_components/design/design-fallback';
import { DesignRenderer } from '@/app/_components/design/design-renderer';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import type { StoredDesignConfig } from '@/lib/design/types';
import designAdapterService from '@/server/services/design-adapter-service';

type ModelCardProps = {
  basePrice: string;
  compatibleGlassTypes: Array<{
    id: string;
    name: string;
    type: string;
  }>;
  design?: {
    config: StoredDesignConfig;
    id: string;
    name: string;
    nameEs: string;
  } | null;
  /** Highlighted glass solutions for this model */
  highlightedSolutions?: Array<{
    icon?: string;
    nameEs: string;
    rating: 'excellent' | 'very_good' | 'good' | 'standard' | 'basic';
  }>;
  id: string;
  material?: MaterialType;
  name: string;
  profileSupplier?: string;
  range: {
    height: [number, number];
    width: [number, number];
  };
};

/**
 * ModelCard - Pure Presentational Component
 * Optimized for "Don't Make Me Think" principle
 *
 * Shows only essential information:
 * - Product design or image (visual anchor)
 * - Product name (what is it)
 * - Price (key decision factor)
 *
 * Everything else is available on detail page.
 * Simple, fast, clear.
 */
export function ModelCard({ basePrice, design, id, material, name }: ModelCardProps) {
  // Card dimensions in pixels for design rendering
  const cardWidth = 280; // Aproximadamente el ancho de una tarjeta en grid
  const cardHeight = 210; // Aspect ratio 4:3

  // Adapt design if available
  const adaptedDesign = useMemo(() => {
    if (!design) return null;
    if (!material) return null;

    try {
      return designAdapterService.adaptDesign(design.config, cardWidth, cardHeight, material);
    } catch {
      // Failed to adapt design, will show fallback
      return null;
    }
  }, [design, material]);

  return (
    <Card
      aria-label={`Tarjeta del modelo ${name}`}
      className="group overflow-hidden transition-all hover:shadow-lg"
      data-testid="model-card"
    >
      <Link className="block" href={`/catalog/${id}`}>
        {/* Product Design or Fallback */}
        {adaptedDesign ? (
          <DesignRenderer className="w-full" design={adaptedDesign} height={cardHeight} width={cardWidth} />
        ) : (
          <DesignFallback height={cardHeight} width={cardWidth} />
        )}

        {/* Product Info - Minimal and clear */}
        <CardContent className="space-y-2 p-4">
          <h3 className="font-medium text-foreground text-sm tracking-tight">{name}</h3>
        </CardContent>

        {/* Product Price - Prominent */}
        <CardFooter className="flex justify-end">
          <ProductPrice price={basePrice} />
        </CardFooter>
      </Link>
    </Card>
  );
}
