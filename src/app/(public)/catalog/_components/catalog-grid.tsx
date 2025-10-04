import { formatCurrency } from '@/lib/utils';
import { ModelCard } from './model-card';

type Model = {
  accessoryPrice: number | null;
  basePrice: number;
  compatibleGlassTypeIds: string[];
  costPerMmHeight: number;
  costPerMmWidth: number;
  createdAt: Date;
  id: string;
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
 * Catalog Grid Component
 * Issue: #002-ui-ux-requirements
 *
 * Minimalist grid layout inspired by Saleor Storefront
 * Clean spacing, clear hierarchy, professional presentation
 */
export function CatalogGrid({ models }: CatalogGridProps) {
  return (
    <div className="space-y-8">
      {/* Results count - subtle and minimal */}
      <div>
        <h2 className="sr-only">Lista de productos</h2>
        <p className="text-foreground/60 text-sm">
          {models.length} {models.length === 1 ? 'producto' : 'productos'}
        </p>
      </div>

      {/* Models grid - responsive and clean */}
      <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {models.map((model) => (
          <li key={model.id}>
            <ModelCard
              basePrice={formatCurrency(model.basePrice)}
              compatibleGlassTypes={[]}
              id={model.id}
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
