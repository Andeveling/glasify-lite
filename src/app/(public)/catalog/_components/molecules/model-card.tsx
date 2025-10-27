'use client';

import { ProductImagePlaceholder, ProductPrice } from '@views/catalog/_components/molecules/model-card-atoms';
import { Maximize2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';

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
 * ModelCard - Enhanced Presentational Component
 * Optimized for "Don't Make Me Think" principle
 *
 * Shows essential information:
 * - Product image (visual anchor)
 * - Product name (what is it)
 * - Dimension ranges (key specification)
 * - Price (decision factor)
 * - Link to details
 */
export function ModelCard({ id, name, basePrice, imageUrl, range }: ModelCardProps) {
  const minWidth = Math.round(range.width[ 0 ]);
  const maxWidth = Math.round(range.width[ 1 ]);
  const minHeight = Math.round(range.height[ 0 ]);
  const maxHeight = Math.round(range.height[ 1 ]);

  return (
    <Card
      aria-label={`Tarjeta del modelo ${name}`}
      className="group flex flex-col overflow-hidden py-0 transition-all duration-300 hover:border-primary/50 hover:shadow-xl"
      data-testid="model-card"
    >
      <Link className="w-full" href={`/catalog/${id}`}>
        {/* Image Section */}
        <div className="relative h-64 w-full overflow-hidden bg-transparent">
          {imageUrl ? (
            <Image
              alt={`Imagen del modelo ${name}`}
              className="h-full w-full object-contain p-1 transition-transform duration-300 group-hover:scale-105"
              fill
              priority={false}
              sizes="(max-width: 768px) 100vw, 50vw"
              src={imageUrl || '/placeholder.svg'}
            />
          ) : (
            <ProductImagePlaceholder productName={name} />
          )}
        </div>

        {/* Content Section */}
        <CardContent className="flex flex-1 flex-col gap-2 p-3">
          {/* Model Name */}
          <h4 className='truncate font-semibold text-base text-foreground transition-colors group-hover:text-primary'>
            {name}
          </h4>

          {/* Dimensions Section */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground text-xs">
              <Maximize2 className="h-4 w-4" />
              <span className="font-medium">Dimensiones</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="space-y-0.5">
                <p className="text-muted-foreground text-xs">Ancho</p>
                <p className="font-semibold">
                  {minWidth}
                  <span className="text-muted-foreground text-xs"> - </span>
                  {maxWidth}
                  <span className="text-muted-foreground text-xs">mm</span>
                </p>
              </div>
              <div className="space-y-0.5">
                <p className="text-muted-foreground text-xs">Alto</p>
                <p className="font-semibold">
                  {minHeight}
                  <span className="text-muted-foreground text-xs"> - </span>
                  {maxHeight}
                  <span className="text-muted-foreground text-xs">mm</span>
                </p>
              </div>
            </div>
          </div>

          <div className="flex w-full items-center justify-between pt-1">
            <span className="font-medium text-muted-foreground text-xs">Precio base</span>
            <ProductPrice price={basePrice} />
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}
