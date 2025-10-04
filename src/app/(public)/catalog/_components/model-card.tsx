'use client';

import { ArrowLeftRight, ArrowUpDown } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardFooter } from '@/components/ui/card';

type ModelCardProps = {
  id: string;
  name: string;
  manufacturer?: string;
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
export function ModelCard({
  id,
  name,
  manufacturer,
  range: {
    width: [minWidthMm, maxWidthMm],
    height: [minHeightMm, maxHeightMm],
  },
  basePrice,
}: ModelCardProps) {
  return (
    <Card aria-label={`Tarjeta del modelo ${name}`} className="group p-0 pb-2 transition-opacity hover:opacity-80">
      <Link className="block space-y-3" href={`/catalog/${id}`}>
        {/* Product Image Placeholder - Saleor style */}
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-muted">
          <div className="flex h-full items-center justify-center">
            <span className="text-muted-foreground/50 text-sm">Imagen del producto</span>
          </div>
        </div>

        {/* Product Info - Clean hierarchy */}
        <CardContent className="space-y-2 px-3 py-0">
          <div>
            <h3 className="font-semibold text-foreground text-sm tracking-tight">{name}</h3>
            {manufacturer && <p className="text-foreground/60 text-xs">{manufacturer}</p>}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-foreground/70 text-xs">
              <ArrowLeftRight className="h-3.5 w-3.5" />
              <span>
                Ancho: {minWidthMm} - {maxWidthMm} mm
              </span>
            </div>
            <div className="flex items-center gap-2 text-foreground/70 text-xs">
              <ArrowUpDown className="h-3.5 w-3.5" />
              <span>
                Alto: {minHeightMm} - {maxHeightMm} mm
              </span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end px-3">
          <p className="font-medium text-foreground text-sm">{basePrice}</p>
        </CardFooter>
      </Link>
    </Card>
  );
}
