import { Suspense } from 'react';
import { api } from '@/trpc/server-client';
import { CatalogHeader } from './_components/molecules/catalog-header';
import { CatalogContent } from './_components/organisms/catalog-content';
import { CatalogFilterBar } from './_components/organisms/catalog-filter-bar';
import { CatalogSkeleton } from './_components/organisms/catalog-skeleton';
import type { CatalogSearchParams } from './_types/catalog-params';
import { validateCatalogParams } from './_types/catalog-params';

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

// Disable ISR temporarily due to Next.js 16 prerendering limitations with client components
// TODO: Re-enable ISR once Next.js 16 properly handles client components in Server Components
// export const revalidate = 3600;
export const dynamic = 'force-dynamic';

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const params = await searchParams;

  // Validate and normalize parameters
  const { searchQuery, page, manufacturerId, sort } = validateCatalogParams(params);

  // Fetch profile suppliers for filter dropdown
  const profileSuppliers = await api.catalog[ 'list-manufacturers' ]();

  // Fetch total count for results display (lightweight query)
  const totalData = await api.catalog[ 'list-models' ]({
    limit: 1,
    manufacturerId,
    page: 1,
    search: searchQuery,
    sort,
  });

  return (
    <div className="min-h-screen">
      <div className="container mx-auto max-w-7xl px-4 py-4 md:px-6 md:py-8">
        {/* Header + Search + Filters in desktop row */}
        <div className="mb-8 space-y-4">
          {/* Row 1: Title + Subtitle */}
          <CatalogHeader />

          {/* Row 2: Search (left) + Filters (right) on desktop */}
          <CatalogFilterBar
            currentProfileSupplier={manufacturerId ?? 'all'}
            currentSort={sort}
            profileSuppliers={profileSuppliers}
            searchQuery={searchQuery}
            totalResults={totalData.total}
          />
        </div>

        <Suspense fallback={<CatalogSkeleton />} key={`${searchQuery}-${page}-${manufacturerId}-${sort}`}>
          <CatalogContent manufacturerId={manufacturerId} page={page} searchQuery={searchQuery} sort={sort} />
        </Suspense>
      </div>
    </div>
  );
}
