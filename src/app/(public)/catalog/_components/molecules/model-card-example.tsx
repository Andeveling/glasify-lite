/**
 * Example: ModelCard with Glass Solutions
 *
 * This is a visual example showing how to integrate the new
 * ProductSolutions component into the ModelCard organism.
 */

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  ProductDimensions,
  ProductImagePlaceholder,
  ProductInfo,
  ProductPrice,
  ProductSolutions,
} from './model-card-atoms';

type ExampleModelCardProps = {
  model: {
    id: string;
    name: string;
    profileSupplier?: {
      name: string;
    };
    minWidthMm: number;
    maxWidthMm: number;
    minHeightMm: number;
    maxHeightMm: number;
    basePrice: number;
    // NEW: Highlighted solutions from tRPC
    highlightedSolutions?: Array<{
      icon?: string;
      nameEs: string;
      rating: 'excellent' | 'very_good' | 'good' | 'standard' | 'basic';
    }>;
  };
};

/**
 * Example ModelCard with Glass Solutions Display
 *
 * Layout structure (top to bottom):
 * 1. Product image placeholder
 * 2. 🆕 Glass solutions badges (if available)
 * 3. Product info (name, supplier)
 * 4. Dimensions (width, height)
 * 5. Price
 * 6. CTA button
 */
export function ExampleModelCard({ model }: ExampleModelCardProps) {
  const formatPrice = (price: number) =>
    new Intl.NumberFormat('es-CO', {
      currency: 'COP',
      minimumFractionDigits: 0,
      style: 'currency',
    }).format(price);

  return (
    <Card className="group overflow-hidden transition-shadow hover:shadow-md">
      <CardContent className="space-y-3 p-4">
        {/* 1. Product Image */}
        <ProductImagePlaceholder productName={model.name} />

        {/* 2. 🆕 Glass Solutions - NEW COMPONENT */}
        {model.highlightedSolutions && model.highlightedSolutions.length > 0 && (
          <ProductSolutions solutions={model.highlightedSolutions} />
        )}

        {/* 3. Product Info */}
        <ProductInfo name={model.name} profileSupplier={model.profileSupplier?.name} />

        {/* 4. Dimensions */}
        <ProductDimensions
          heightRange={[model.minHeightMm, model.maxHeightMm]}
          widthRange={[model.minWidthMm, model.maxWidthMm]}
        />

        {/* 5. Price */}
        <ProductPrice price={formatPrice(model.basePrice)} />

        {/* 6. CTA */}
        <Button className="w-full" size="sm" variant="default">
          Ver detalles
        </Button>
      </CardContent>
    </Card>
  );
}

/**
 * Example data for testing/preview
 */
export const exampleModelData = {
  basePrice: 850_000,
  // 🆕 Example highlighted solutions
  highlightedSolutions: [
    {
      icon: 'Shield',
      nameEs: 'Seguridad',
      rating: 'excellent' as const,
    },
    {
      icon: 'Snowflake',
      nameEs: 'Aislamiento Térmico',
      rating: 'very_good' as const,
    },
    {
      icon: 'Volume2',
      nameEs: 'Aislamiento Acústico',
      rating: 'good' as const,
    },
  ],
  id: '1',
  maxHeightMm: 2200,
  maxWidthMm: 2400,
  minHeightMm: 800,
  minWidthMm: 600,
  name: 'Ventana Corrediza Premium',
  profileSupplier: {
    name: 'Rehau',
  },
};

/**
 * Visual Preview:
 *
 * ┌─────────────────────────┐
 * │                         │
 * │  [Product Image]        │
 * │                         │
 * ├─────────────────────────┤
 * │ 🆕 [🛡️ Seguridad]       │  ← NEW: Blue badge (excellent)
 * │    [❄️ Térmico]         │  ← NEW: Light blue badge (very_good)
 * │    [🔊 Acústico]        │  ← NEW: Green badge (good)
 * ├─────────────────────────┤
 * │ Ventana Corrediza       │
 * │ Premium                 │
 * │ Rehau                   │
 * ├─────────────────────────┤
 * │ ↔ Ancho: 600-2400 mm    │
 * │ ↕ Alto: 800-2200 mm     │
 * ├─────────────────────────┤
 * │ $850,000                │
 * ├─────────────────────────┤
 * │   [Ver detalles]        │
 * └─────────────────────────┘
 */
