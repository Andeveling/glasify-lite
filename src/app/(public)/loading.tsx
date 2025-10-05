import { generateStableKeyedArray } from '@/app/_utils/generate-keys.util';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Skeleton } from '@/components/ui/skeleton';

const PUBLIC_CATALOG_SKELETON_COUNT = 8;

export default function PublicLoading() {
  const catalogItems = generateStableKeyedArray(PUBLIC_CATALOG_SKELETON_COUNT, 'catalog-skeleton');

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header skeleton */}
      <div className="mb-8 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* Main content skeleton - catalog/quote layout */}
      <div className="grid gap-6">
        {/* Navigation/filters skeleton */}
        <div className="flex flex-wrap gap-4 border-border border-b pb-4">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-24" />
        </div>

        {/* Content grid skeleton */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {catalogItems.map((item) => (
            <div className="space-y-3" key={item.key}>
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-8 w-16" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Centered loading indicator */}
      <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        <div className="space-y-4 text-center">
          <LoadingSpinner size="lg" />
          <p className="text-muted-foreground text-sm">Cargando catálogo...</p>
        </div>
      </div>
    </div>
  );
}
