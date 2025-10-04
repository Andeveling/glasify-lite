import { generateStableKeyedArray } from '@/app/_utils/generate-keys.util';
import { ModelCardSkeleton } from '@/app/(public)/catalog/_components/model-card-skeleton';
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
      <div className="mb-6 flex items-center justify-between">
        <Skeleton className="h-6 w-32" />
      </div>

      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {generateStableKeyedArray(skeletonItemsCount, 'catalog-skeleton').map((item) => (
          <ModelCardSkeleton key={item.key} />
        ))}
      </div>
    </main>
  );
}
