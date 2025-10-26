'use client';

import { ProductImagePlaceholder, ProductPrice } from '@views/catalog/_components/molecules/model-card-atoms';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardFooter } from '@/components/ui/card';

type ModelCardProps = {
  id: string;
  name: string;
  profileSupplier?: string;
  range: {
    width: [ number, number ];
    height: [ number, number ];
  };
  basePrice: string;
  /**
   * Optional URL to model design image
   * If provided, shows real image; otherwise shows placeholder
   */
  imageUrl?: string | null;
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
 * Optimized for "Don't Make Me Think" principle
 *
 * Shows only essential information:
 * - Product image (visual anchor)
 * - Product name (what is it)
 * - Price (key decision factor)
 *
 * Everything else is available on detail page.
 * Simple, fast, clear.
 */
export function ModelCard({ id, name, basePrice, imageUrl }: ModelCardProps) {
  return (
    <Card
      aria-label={`Tarjeta del modelo ${name}`}
      className="group overflow-hidden transition-all hover:shadow-lg"
      data-testid="model-card"
    >
      <Link className="block" href={`/catalog/${id}`}>
        {/* Product Image - Large and prominent */}
        {imageUrl ? (
          <div className="relative h-60 w-full bg-gray-100">
            <Image
              alt={`Imagen del modelo ${name}`}
              className="h-full w-full object-contain p-2"
              fill
              priority={false}
              sizes="(max-width: 768px) 100vw, 50vw"
              src={imageUrl}
            />
          </div>
        ) : (
          <ProductImagePlaceholder productName={name} />
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
