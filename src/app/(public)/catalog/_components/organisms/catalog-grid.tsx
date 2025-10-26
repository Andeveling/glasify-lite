import { ModelCard } from '@views/catalog/_components/molecules/model-card';
import { formatCurrency } from '@/app/_utils/format-currency.util';

type Model = {
  accessoryPrice: number | null;
  basePrice: number;
  compatibleGlassTypeIds: string[];
  costPerMmHeight: number;
  costPerMmWidth: number;
  createdAt: Date;
  id: string;
  imageUrl: string | null;
  profileSupplier: {
    id: string;
    name: string;
  } | null;
  maxHeightMm: number;
  maxWidthMm: number;
  minHeightMm: number;
  minWidthMm: number;
  name: string;
  status: string;
  updatedAt: Date;
};

type CatalogGridProps = {
  models: Model[];
};

/**
 * Generate mock highlighted solutions for demo purposes
 * TODO: Replace with real data from tRPC query
 */
function getMockHighlightedSolutions(modelId: string) {
  // Mock data - different solutions for different models
  const mockSolutions = [
    [
      { icon: 'Shield', nameEs: 'Seguridad', rating: 'excellent' as const },
      { icon: 'Snowflake', nameEs: 'Aislamiento Térmico', rating: 'very_good' as const },
    ],
    [
      { icon: 'Volume2', nameEs: 'Aislamiento Acústico', rating: 'excellent' as const },
      { icon: 'Shield', nameEs: 'Seguridad', rating: 'good' as const },
    ],
    [
      { icon: 'Snowflake', nameEs: 'Aislamiento Térmico', rating: 'excellent' as const },
      { icon: 'Sparkles', nameEs: 'Decorativo', rating: 'very_good' as const },
      { icon: 'Volume2', nameEs: 'Aislamiento Acústico', rating: 'good' as const },
    ],
  ];

  // Use model ID to pseudo-randomly assign solutions
  const index = modelId.charCodeAt(0) % mockSolutions.length;
  return mockSolutions[ index ];
}

/**
 * CatalogGrid - Pure Presentational Component
 * Issue: #002-ui-ux-requirements
 *
 * Minimalist grid layout inspired by Saleor Storefront.
 *
 * Responsibilities (Single Responsibility Principle):
 * - Render grid layout
 * - Map models to ModelCard components
 * - Transform data for display
 *
 * Benefits:
 * - Pure presentation
 * - Easy to test
 * - No side effects
 * - Follows Open/Closed Principle (open for extension via props)
 */
export function CatalogGrid({ models }: CatalogGridProps) {
  return (
    <div className="space-y-8">
      {/* Models grid - responsive and clean */}
      <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {models.map((model) => (
          <li key={model.id}>
            <ModelCard
              basePrice={formatCurrency(model.basePrice)}
              compatibleGlassTypes={[]}
              highlightedSolutions={getMockHighlightedSolutions(model.id)}
              id={model.id}
              imageUrl={model.imageUrl}
              name={model.name}
              profileSupplier={model.profileSupplier?.name}
              range={{
                height: [ model.minHeightMm, model.maxHeightMm ],
                width: [ model.minWidthMm, model.maxWidthMm ],
              }}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
