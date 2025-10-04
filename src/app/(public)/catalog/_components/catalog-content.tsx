import { api } from '@/trpc/server';
import { CatalogEmpty } from './catalog-empty';
import { CatalogError } from './catalog-error';
import { CatalogGrid } from './catalog-grid';
import { CatalogPagination } from './catalog-pagination';

type CatalogContentProps = {
  manufacturerId: string;
  manufacturerName: string;
  page: number;
  searchQuery?: string;
};

const ITEMS_PER_PAGE = 20;

/**
 * CatalogContent - Server Component
 * Issue: #002-ui-ux-requirements
 *
 * Server Component that fetches and renders catalog models.
 * This component is cached and revalidated via ISR.
 *
 * Benefits:
 * - Pre-rendered HTML for better performance
 * - SEO-friendly (search engines see the content)
 * - No client-side JavaScript needed for rendering
 */
export async function CatalogContent({ manufacturerId, manufacturerName, page, searchQuery }: CatalogContentProps) {
  try {
    // Fetch models on the server - this is cached and revalidated
    const data = await api.catalog['list-models']({
      limit: ITEMS_PER_PAGE,
      manufacturerId,
      page,
      search: searchQuery,
    });

    const hasActiveFilters = Boolean(searchQuery);
    const { items: models, total } = data;
    const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

    // Empty state
    if (models.length === 0) {
      return <CatalogEmpty hasActiveFilters={hasActiveFilters} />;
    }

    // Render models grid
    return (
      <main>
        <CatalogGrid manufacturer={manufacturerName} models={models} />

        {/* Pagination - only show if more than one page */}
        {totalPages > 1 && <CatalogPagination currentPage={page} totalPages={totalPages} />}
      </main>
    );
  } catch (_error) {
    // Error state
    return <CatalogError />;
  }
}
