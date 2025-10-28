import { AdminContentContainer } from "@/app/(dashboard)/admin/_components/admin-content-container";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// Constants for skeleton counts matching dashboard layout
const QUOTE_METRICS_COUNT = 4;
const CATALOG_CHARTS_COUNT = 3;
const MONETARY_CHARTS_COUNT = 3;

/**
 * Loading state for Admin Metrics Dashboard
 *
 * Displays skeleton UI while dashboard data is being fetched.
 * Matches the layout of the actual dashboard for smooth transitions.
 */
export default function AdminMetricsDashboardLoading() {
  return (
    <AdminContentContainer maxWidth="full">
      <div className="flex flex-col gap-6">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-9 w-64" />
            <Skeleton className="h-5 w-96" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>

        {/* Quote Performance Section */}
        <section className="space-y-4">
          <Skeleton className="h-7 w-56" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...new Array(QUOTE_METRICS_COUNT)].map((_, i) => (
              <Card key={`metric-${i}`}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-4 rounded-full" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="mb-1 h-7 w-16" />
                  <Skeleton className="h-4 w-32" />
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="mt-4">
            <Card>
              <CardHeader>
                <Skeleton className="h-5 w-40" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-64 w-full" />
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Catalog Analytics Section */}
        <section className="space-y-4">
          <Skeleton className="h-7 w-48" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...new Array(CATALOG_CHARTS_COUNT)].map((_, i) => (
              <Card key={`catalog-${i}`}>
                <CardHeader>
                  <Skeleton className="h-5 w-32" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-64 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Monetary Metrics Section */}
        <section className="space-y-4">
          <Skeleton className="h-7 w-44" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...new Array(MONETARY_CHARTS_COUNT)].map((_, i) => (
              <Card key={`monetary-${i}`}>
                <CardHeader>
                  <Skeleton className="h-5 w-36" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-48 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </AdminContentContainer>
  );
}
