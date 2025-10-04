import { generateStableKeyedArray } from '@/app/_utils/generate-keys.util';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * CatalogSkeleton - Loading State
 * Issue: #002-ui-ux-requirements
 *
 * Skeleton loader shown while catalog content is streaming
 */
export function CatalogSkeleton() {
  const skeletonItemsCount = 8;

  return (
    <main>
      <div className="mb-4 flex items-center justify-between">
        <Skeleton className="h-6 w-32" />
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {generateStableKeyedArray(skeletonItemsCount, 'catalog-skeleton').map((item) => (
          <div className="overflow-hidden rounded-lg border bg-card" key={item.key}>
            <Skeleton className="h-48" />
            <div className="p-4">
              <Skeleton className="mb-2 h-6" />
              <Skeleton className="mb-4 h-4 w-3/4" />
              <div className="flex items-center justify-between">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-8 w-20" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
