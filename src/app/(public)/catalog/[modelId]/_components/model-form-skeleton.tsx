/** biome-ignore-all lint/suspicious/noArrayIndexKey: Using array index as key is acceptable here because skeleton items are purely presentational and do not require stable identity. */
/** biome-ignore-all lint/style/noMagicNumbers: Magic numbers are used intentionally for animation delays and skeleton layout to match the design specification. */
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ModelFormLayout } from "./model-form-layout";

export function ModelFormSkeleton() {
  const sidebar = (
    <Card className="space-y-4 p-6">
      {/* Model name skeleton */}
      <Skeleton className="h-6 w-3/4" />

      {/* Dimensions skeleton */}
      <Skeleton className="h-4 w-1/2" />

      {/* Price skeleton */}
      <div className="space-y-2 pt-4">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
      </div>

      {/* Add to cart button skeleton */}
      <Skeleton className="h-12 w-full" />
    </Card>
  );

  const main = (
    <div className="space-y-6">
      {/* Dimensions Section Skeleton */}
      <Card className="p-6">
        <Skeleton className="mb-2 h-6 w-1/3" />
        <Skeleton className="mb-4 h-4 w-2/3" />
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </Card>

      {/* Glass Type Selector Skeleton */}
      <Card className="p-6">
        <Skeleton className="mb-2 h-6 w-1/4" />
        <Skeleton className="mb-4 h-4 w-3/4" />
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-40 w-full rounded-lg" />
          <Skeleton className="h-40 w-full rounded-lg" />
          <Skeleton className="h-40 w-full rounded-lg" />
          <Skeleton className="h-40 w-full rounded-lg" />
        </div>
      </Card>

      {/* Services Selector Skeleton */}
      <Card className="p-6">
        <Skeleton className="mb-2 h-6 w-1/3" />
        <Skeleton className="mb-4 h-4 w-2/3" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-24 w-full rounded-lg" />
          <Skeleton className="h-24 w-full rounded-lg" />
          <Skeleton className="h-24 w-full rounded-lg" />
          <Skeleton className="h-24 w-full rounded-lg" />
          <Skeleton className="h-24 w-full rounded-lg" />
          <Skeleton className="h-24 w-full rounded-lg" />
        </div>
      </Card>

      {/* Quote Summary Skeleton */}
      <Card className="p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1">
            <Skeleton className="mb-2 h-8 w-40" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-12 w-full sm:w-48" />
        </div>
      </Card>
    </div>
  );

  return <ModelFormLayout main={main} sidebar={sidebar} />;
}
