import { Suspense } from 'react';
import { api } from '@/trpc/server';
import { CatalogContent } from './_components/catalog-content';
import { CatalogHeader } from './_components/catalog-header';
import { CatalogSearch } from './_components/catalog-search';
import { CatalogSkeleton } from './_components/catalog-skeleton';

type SearchParams = Promise<{
  q?: string;
  page?: string;
}>;

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
  const searchQuery = params.q;
  const page = params.page ? Number.parseInt(params.page, 10) : 1;

  // Fetch manufacturer on the server (no hardcoded IDs)
  const manufacturer = await api.catalog['get-default-manufacturer']();

  return (
    <div className="min-h-screen">
      <div className="container mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-12">
        <CatalogHeader />
        <CatalogSearch initialValue={searchQuery} />
        <Suspense fallback={<CatalogSkeleton />} key={`${searchQuery}-${page}`}>
          <CatalogContent
            manufacturerId={manufacturer.id}
            manufacturerName={manufacturer.name}
            page={page}
            searchQuery={searchQuery}
          />
        </Suspense>
      </div>
    </div>
  );
}
