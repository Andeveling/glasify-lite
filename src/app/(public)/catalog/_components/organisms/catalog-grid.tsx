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
  manufacturer: {
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
      <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {models.map((model) => (
          <li key={model.id}>
            <ModelCard
              basePrice={formatCurrency(model.basePrice)}
              compatibleGlassTypes={[]}
              id={model.id}
              manufacturer={model.manufacturer?.name}
              name={model.name}
              range={{
                height: [model.minHeightMm, model.maxHeightMm],
                width: [model.minWidthMm, model.maxWidthMm],
              }}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
