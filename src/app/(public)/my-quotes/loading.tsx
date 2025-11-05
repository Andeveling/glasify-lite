/**
 * Loading Skeleton for My Quotes Page
 *
 * Displays a loading state while the server fetches user's quotes.
 * Uses skeleton components to provide visual feedback during data fetch.
 */
/** biome-ignore-all lint/suspicious/noArrayIndexKey: Using array index as key is acceptable here because skeleton items are purely presentational and do not require stable identity. */
/** biome-ignore-all lint/style/noMagicNumbers: Magic numbers are used intentionally for animation delays and skeleton layout to match the design specification. */

import { ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function MyQuotesLoading() {
  return (
    <div className="container mx-auto max-w-7xl py-8">
      {/* Header skeleton */}
      <div className="mb-8">
        {/* Back link skeleton */}
        <div className="mb-4 flex items-center gap-2">
          <ArrowLeft className="size-4 text-muted-foreground" />
          <Skeleton className="h-4 w-32" />
        </div>

        {/* Title skeleton */}
        <Skeleton className="h-9 w-48" />

        {/* Subtitle skeleton */}
        <Skeleton className="mt-2 h-4 w-96" />
      </div>

      {/* Search and Filters skeleton */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:gap-6">
        {/* Search input skeleton */}
        <div className="flex-1">
          <Skeleton className="mb-2 h-4 w-32" />
          <Skeleton className="h-10 w-full" />
        </div>

        {/* Filter 1 skeleton */}
        <div className="min-w-[180px]">
          <Skeleton className="mb-2 h-4 w-16" />
          <Skeleton className="h-10 w-full" />
        </div>

        {/* Filter 2 skeleton */}
        <div className="min-w-[180px]">
          <Skeleton className="mb-2 h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>

      {/* Results count skeleton */}
      <Skeleton className="mb-4 h-4 w-48" />

      {/* Table skeleton */}
      <div className="rounded-lg border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-sm">
                  <Skeleton className="h-4 w-20" />
                </th>
                <th className="px-4 py-3 text-left font-medium text-sm">
                  <Skeleton className="h-4 w-16" />
                </th>
                <th className="px-4 py-3 text-right font-medium text-sm">
                  <Skeleton className="h-4 w-12" />
                </th>
                <th className="px-4 py-3 text-center font-medium text-sm">
                  <Skeleton className="h-4 w-8" />
                </th>
                <th className="px-4 py-3 text-left font-medium text-sm">
                  <Skeleton className="h-4 w-12" />
                </th>
                <th className="px-4 py-3 text-right font-medium text-sm">
                  <Skeleton className="h-4 w-16" />
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td className="px-4 py-3">
                    <Skeleton className="h-4 w-32" />
                  </td>
                  <td className="px-4 py-3">
                    <Skeleton className="h-6 w-16" />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Skeleton className="ml-auto h-4 w-16" />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Skeleton className="mx-auto h-4 w-8" />
                  </td>
                  <td className="px-4 py-3">
                    <Skeleton className="h-4 w-20" />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Skeleton className="ml-auto h-4 w-6" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
