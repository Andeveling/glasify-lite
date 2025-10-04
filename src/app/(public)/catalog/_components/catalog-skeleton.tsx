/**
 * CatalogSkeleton - Loading State
 * Issue: #002-ui-ux-requirements
 *
 * Skeleton loader shown while catalog content is streaming
 */
export function CatalogSkeleton() {
  return (
    <main>
      <div className="mb-4 flex items-center justify-between">
        <div className="h-6 w-32 animate-pulse rounded bg-muted" />
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div className="overflow-hidden rounded-lg border bg-card" key={i}>
            <div className="h-48 animate-pulse bg-muted" />
            <div className="p-4">
              <div className="mb-2 h-6 animate-pulse rounded bg-muted" />
              <div className="mb-4 h-4 w-3/4 animate-pulse rounded bg-muted" />
              <div className="flex items-center justify-between">
                <div className="h-8 w-24 animate-pulse rounded bg-muted" />
                <div className="h-8 w-20 animate-pulse rounded bg-muted" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
