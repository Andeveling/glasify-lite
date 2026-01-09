import { Suspense } from "react";
import { CatalogHeader } from "./_components/molecules/catalog-header";
import { CatalogContent } from "./_components/organisms/catalog-content";
import { CatalogFilterBarWrapper } from "./_components/organisms/catalog-filter-bar-wrapper";
import { CatalogFilterSkeleton } from "./_components/organisms/catalog-filter-skeleton";
import { CatalogSkeleton } from "./_components/organisms/catalog-skeleton";
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

/**
 * CRITICAL: Dynamic rendering required to prevent build failures
 *
 * This page uses PublicLayout which contains:
 * - PublicFooter > SocialMediaLinks (queries db.tenantConfig.findUnique())
 *
 * If this page attempts static prerendering, the build fails with:
 * "Can't reach database server" because DATABASE_URL may not be available
 * during build time in CI/CD environments (Vercel, GitHub Actions).
 *
 * Suspense boundaries alone are insufficient - we must force dynamic rendering
 * to completely prevent prerendering attempts.
 *
 * DO NOT REMOVE unless:
 * 1. PublicLayout no longer contains database queries
 * 2. All DB queries are moved to client components
 * 3. Build process guarantees DATABASE_URL availability
 */
export const dynamic = "force-dynamic";

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
