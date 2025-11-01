import { Suspense } from "react";
import { CatalogHeader } from "./_components/molecules/catalog-header";
import { CatalogContent } from "./_components/organisms/catalog-content";
import { CatalogFilterBarWrapper } from "./_components/organisms/catalog-filter-bar-wrapper";
import { CatalogSkeleton } from "./_components/organisms/catalog-skeleton";
import { CatalogFilterSkeleton } from "./_components/organisms/catalog-filter-skeleton";
import type { CatalogSearchParams } from "./_types/catalog-params";
import { validateCatalogParams } from "./_types/catalog-params";

type SearchParams = Promise<CatalogSearchParams>;

type CatalogPageProps = {
  searchParams: SearchParams;
};

/**
 * Catalog Page - Server Component with ISR
 * Issue: #002-ui-ux-requirements
 *
 * Minimalist design inspired by Saleor Storefront
 * Clean layout, generous spacing, professional typography
 *
 * SSG/ISR Strategy:
 * - Models are fetched server-side and rendered as static HTML
 * - Page revalidates every 3600 seconds (1 hour)
 * - Search is handled client-side for instant feedback
 * - Only the interactive parts are client components
 *
 * Benefits:
 * - Faster initial page load (pre-rendered HTML)
 * - Better SEO (search engines see the content)
 * - Reduced server load (cached pages)
 * - Better UX (instant navigation, progressive enhancement)
 */

// MIGRATED: Removed export const dynamic = 'force-dynamic' (incompatible with Cache Components)
// Note: Dynamic by default - catalog uses client components and real-time filtering
// TODO: Previously disabled ISR due to Next.js 16 prerendering limitations
// TODO: Evaluate if Cache Components with Suspense enables better caching strategy
// Potential: Use "use cache" for static catalog shell + Suspense for dynamic filters

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const params = await searchParams;

  // Validate and normalize parameters
  const { searchQuery, page, manufacturerId, sort } =
    validateCatalogParams(params);

  return (
    <div className="min-h-screen">
      <div className="container mx-auto max-w-7xl px-4 py-4 md:px-6 md:py-8">
        {/* Header + Search + Filters in desktop row */}
        <div className="mb-8 space-y-4">
          {/* Row 1: Title + Subtitle */}
          <CatalogHeader />

          {/* Row 2: Search (left) + Filters (right) on desktop */}
          {/* Wrapped in Suspense to prevent blocking route */}
          <Suspense fallback={<CatalogFilterSkeleton />}>
            <CatalogFilterBarWrapper
              currentProfileSupplier={manufacturerId ?? "all"}
              currentSort={sort}
              searchQuery={searchQuery}
            />
          </Suspense>
        </div>

        <Suspense
          fallback={<CatalogSkeleton />}
          key={`${searchQuery}-${page}-${manufacturerId}-${sort}`}
        >
          <CatalogContent
            manufacturerId={manufacturerId}
            page={page}
            searchQuery={searchQuery}
            sort={sort}
          />
        </Suspense>
      </div>
    </div>
  );
}
