import { formatCurrency } from '@/lib/utils';
import { ModelCard } from '../../_components/catalog/model-card';

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
  manufacturer: string;
  models: Model[];
  total: number;
};

/**
 * Catalog Grid Component
 * Issue: #002-ui-ux-requirements
 *
 * Server Component that displays models in a responsive grid.
 * Pure presentation component with no client-side logic.
 */
export function CatalogGrid({ manufacturer, models, total }: CatalogGridProps) {
  return (
    <>
      {/* Results count */}
      <div className="mb-6">
        <p className="text-muted-foreground text-sm">
          Mostrando {models.length} de {total} {total === 1 ? 'modelo' : 'modelos'}
        </p>
      </div>

      {/* Models grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {models.map((model) => (
          <ModelCard
            basePrice={formatCurrency(model.basePrice)}
            compatibleGlassTypes={[]}
            id={model.id}
            key={model.id}
            manufacturer={manufacturer}
            name={model.name}
            range={{
              height: [model.minHeightMm, model.maxHeightMm],
              width: [model.minWidthMm, model.maxWidthMm],
            }}
          />
        ))}
      </div>
    </>
  );
}
