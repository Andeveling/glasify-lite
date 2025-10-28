import { Skeleton } from "@/components/ui/skeleton";

/**
 * ModelCardSkeleton - Placeholder for ModelCard
 * Issue: #002-ui-ux-requirements
 *
 * Skeleton loader matching ModelCard layout for uniform loading states
 */
export function ModelCardSkeleton() {
  return (
    <div className="group block space-y-4 transition-opacity">
      {/* Product Image Skeleton */}
      <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-muted">
        <Skeleton className="absolute inset-0 h-full w-full rounded-lg" />
      </div>

      {/* Product Info Skeleton */}
      <div className="space-y-1">
        <div>
          <Skeleton className="mb-1 h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <Skeleton className="mt-2 h-5 w-1/3" />
      </div>
    </div>
  );
}
