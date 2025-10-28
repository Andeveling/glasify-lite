import { generateStableKeyedArray } from "@/app/_utils/generate-keys.util";
import { ModelCardSkeleton } from "@/app/(public)/catalog/_components/molecules/model-card-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * CatalogSkeleton - Loading State
 * Issue: #002-ui-ux-requirements
 *
 * Skeleton loader shown while catalog content is streaming
 */
export function CatalogSkeleton() {
  const skeletonItemsCount = 8;

  return (
    <div className="space-y-8">
      {/* Results count skeleton - paridad visual */}
      <div>
        <Skeleton className="h-6 w-32" />
      </div>

      {/* Skeleton grid - igual que CatalogGrid */}
      <ul
        aria-label="Cargando productos..."
        className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
      >
        {generateStableKeyedArray(skeletonItemsCount, "catalog-skeleton").map(
          (item) => (
            <li key={item.key}>
              <ModelCardSkeleton />
            </li>
          )
        )}
      </ul>
    </div>
  );
}
