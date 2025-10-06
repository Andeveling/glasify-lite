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

// Enable ISR - revalidate every hour
export const revalidate = 3600;

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const params = await searchParams;

  // Validate and normalize parameters
  const { searchQuery, page, manufacturerId, sort } = validateCatalogParams(params);

  // Fetch manufacturers for filter dropdown
  const manufacturers = await api.catalog['list-manufacturers']();

  // Fetch total count for results display (lightweight query)
  const totalData = await api.catalog['list-models']({
    limit: 1,
    manufacturerId,
    page: 1,
    search: searchQuery,
    sort,
  });

  return (
    <div className="min-h-screen">
      <div className="container mx-auto max-w-7xl px-4 py-4 md:px-6 md:py-8">
        <CatalogHeader />

        {/* Nuevo layout armónico: barra de búsqueda y filtros + badges */}
        <CatalogFilterBar
          currentManufacturer={manufacturerId ?? 'all'}
          currentSort={sort}
          manufacturers={manufacturers}
          searchQuery={searchQuery}
          totalResults={totalData.total}
        />

        <Suspense fallback={<CatalogSkeleton />} key={`${searchQuery}-${page}-${manufacturerId}-${sort}`}>
          <CatalogContent manufacturerId={manufacturerId} page={page} searchQuery={searchQuery} sort={sort} />
        </Suspense>
      </div>
    </div>
  );
}
